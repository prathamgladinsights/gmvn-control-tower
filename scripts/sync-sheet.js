require('dotenv').config()
const { Pool } = require('pg')
const { google } = require('googleapis')
const crypto = require('crypto')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// ── Google Sheets Auth ────────────────────────────────────
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const sheets = google.sheets({ version: 'v4', auth })

// GMVN Sheet column mapping:
// Col A: Sn | B: Guest Name | C: Guest House | D: Check In | E: Check Out
// Col F: Visit Type | G: Food (0-5) | H: Stay (0-5) | I: Staff (0-15) | J: Comments

async function syncGuestSheet() {
  console.log('🔄 Starting Google Sheet sync...')
  let rowsRead = 0, rowsInserted = 0, rowsSkipped = 0

  try {
    // Fetch sheet data — skip header row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A2:J',   // Adjust sheet name if needed
    })

    const rows = response.data.values || []
    rowsRead = rows.length
    console.log(`📋 Read ${rowsRead} rows from sheet`)

    // Load property name→id map
    const { rows: props } = await pool.query('SELECT id, name FROM properties')
    const propertyMap = {}
    props.forEach(p => {
      propertyMap[p.name.toLowerCase().trim()] = p.id
    })

    for (const row of rows) {
      const [sn, guestName, guestHouse, checkIn, checkOut, visitType, scoreFood, scoreStay, scoreStaff, comments] = row

      if (!guestName || !guestHouse || !checkIn || !checkOut) {
        rowsSkipped++
        continue
      }

      // Find property ID — fuzzy match
      const propertyId = findPropertyId(guestHouse, propertyMap)
      if (!propertyId) {
        console.warn(`⚠️  Property not found: "${guestHouse}" — skipping row`)
        rowsSkipped++
        continue
      }

      // Parse dates
      const checkInDate  = parseDate(checkIn)
      const checkOutDate = parseDate(checkOut)
      if (!checkInDate || !checkOutDate) {
        rowsSkipped++
        continue
      }

      // Dedup hash — name + property + checkin
      const hash = crypto.createHash('md5')
        .update(`${guestName.trim().toLowerCase()}|${propertyId}|${checkInDate}`)
        .digest('hex')

      // Check if already exists
      const existing = await pool.query('SELECT id FROM guests WHERE sheet_row_hash = $1', [hash])
      if (existing.rows.length > 0) {
        rowsSkipped++
        continue
      }

      // Insert guest
      const { rows: inserted } = await pool.query(`
        INSERT INTO guests (
          serial_no, guest_name, property_id, check_in_date, check_out_date,
          visit_type, sheet_row_hash, call_scheduled, call_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)
        RETURNING id
      `, [
        sn ? parseInt(sn) : null,
        guestName.trim(),
        propertyId,
        checkInDate,
        checkOutDate,
        normalizeVisitType(visitType),
        hash,
        addDays(checkOutDate, 1),  // Call day after checkout
      ])

      const guestId = inserted[0].id

      // If sheet already has feedback scores, save them directly
      const hasSheetScores = scoreFood || scoreStay || scoreStaff
      if (hasSheetScores) {
        const food  = parseScore(scoreFood, 5)
        const stay  = parseScore(scoreStay, 5)
        const staff = parseScore(scoreStaff, 15)
        const overall = computeOverall(food, stay, staff)

        await pool.query(`
          INSERT INTO feedback_calls (
            guest_id, property_id, call_provider, call_status,
            sheet_score_food, sheet_score_stay, sheet_score_staff,
            score_food, score_stay, score_staff, score_overall,
            sheet_comments, completed_at
          ) VALUES ($1, $2, 'manual', 'completed', $3, $4, $5, $3, $4, $5, $6, $7, NOW())
        `, [guestId, propertyId, food, stay, staff, overall, comments?.trim() || null])

        // Mark guest as already called (sheet had scores)
        await pool.query('UPDATE guests SET call_scheduled = true WHERE id = $1', [guestId])
      }

      rowsInserted++
    }

    // Log sync
    await pool.query(`
      INSERT INTO sync_logs (sync_type, rows_read, rows_inserted, rows_skipped)
      VALUES ('google_sheet', $1, $2, $3)
    `, [rowsRead, rowsInserted, rowsSkipped])

    console.log(`✅ Sync complete — Read: ${rowsRead}, Inserted: ${rowsInserted}, Skipped: ${rowsSkipped}`)

  } catch (err) {
    await pool.query(`
      INSERT INTO sync_logs (sync_type, rows_read, rows_inserted, rows_skipped, error_message)
      VALUES ('google_sheet', $1, $2, $3, $4)
    `, [rowsRead, rowsInserted, rowsSkipped, err.message])
    console.error('❌ Sync failed:', err.message)
  } finally {
    await pool.end()
  }
}

// ── Helpers ───────────────────────────────────────────────
function findPropertyId(name, propertyMap) {
  const normalized = name.toLowerCase().trim()
  // Exact match
  if (propertyMap[normalized]) return propertyMap[normalized]
  // Partial match
  for (const [key, id] of Object.entries(propertyMap)) {
    if (key.includes(normalized) || normalized.includes(key.split(' ')[0])) return id
  }
  return null
}

function parseDate(str) {
  if (!str) return null
  // Handle DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/,   // DD/MM/YYYY
    /(\d{2})-(\d{2})-(\d{4})/,     // DD-MM-YYYY
    /(\d{4})-(\d{2})-(\d{2})/,     // YYYY-MM-DD
  ]
  for (const fmt of formats) {
    const m = str.match(fmt)
    if (m) {
      const date = fmt === formats[2]
        ? new Date(`${m[1]}-${m[2]}-${m[3]}`)
        : new Date(`${m[3]}-${m[2]}-${m[1]}`)
      if (!isNaN(date)) return date.toISOString().split('T')[0]
    }
  }
  return null
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function normalizeVisitType(val) {
  if (!val) return 'Other'
  const v = val.toLowerCase()
  if (v.includes('package')) return 'Package'
  if (v.includes('single')) return 'Single'
  return 'Other'
}

function parseScore(val, max) {
  if (!val) return null
  const n = parseFloat(val)
  if (isNaN(n) || n < 0 || n > max) return null
  return n
}

function computeOverall(food, stay, staff) {
  // Max possible: food=5, stay=5, staff=15 → total=25 → scale to 10
  const total = (food || 0) + (stay || 0) + (staff || 0)
  const maxTotal = (food !== null ? 5 : 0) + (stay !== null ? 5 : 0) + (staff !== null ? 15 : 0)
  if (maxTotal === 0) return null
  return Math.round((total / maxTotal) * 10 * 10) / 10
}

syncGuestSheet()
