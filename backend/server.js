require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { Pool } = require('pg')

const app = express()
const PORT = process.env.PORT || 4000

// ── DB Connection ─────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ DB connection failed:', err.message))

// ── Middleware ────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

// ── Health ────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ═══════════════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════════════
app.get('/api/properties', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        ROUND(AVG(fc.score_overall)::numeric, 1) AS avg_score,
        COUNT(fc.id) FILTER (WHERE fc.call_status = 'completed') AS total_calls,
        COUNT(a.id) FILTER (WHERE a.status = 'open') AS open_alerts,
        gr.google_rating,
        gr.total_reviews
      FROM properties p
      LEFT JOIN feedback_calls fc ON fc.property_id = p.id
      LEFT JOIN alerts a ON a.property_id = p.id
      LEFT JOIN LATERAL (
        SELECT google_rating, total_reviews FROM google_reviews
        WHERE property_id = p.id ORDER BY fetched_at DESC LIMIT 1
      ) gr ON true
      WHERE p.is_active = true
      GROUP BY p.id, gr.google_rating, gr.total_reviews
      ORDER BY p.id
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
})

app.get('/api/properties/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*,
        ROUND(AVG(fc.score_food)::numeric, 1)    AS avg_food,
        ROUND(AVG(fc.score_stay)::numeric, 1)    AS avg_stay,
        ROUND(AVG(fc.score_staff)::numeric, 1)   AS avg_staff,
        ROUND(AVG(fc.score_overall)::numeric, 1) AS avg_overall,
        COUNT(fc.id) FILTER (WHERE fc.call_status = 'completed') AS total_calls,
        COUNT(fc.id) FILTER (WHERE fc.call_status = 'connected') AS connected_calls
      FROM properties p
      LEFT JOIN feedback_calls fc ON fc.property_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Property not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════
app.get('/api/stats/overview', async (req, res) => {
  try {
    const [props, calls, alerts, reqs] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM properties WHERE is_active = true'),
      pool.query(`SELECT COUNT(*) FILTER (WHERE call_status='completed') as completed,
                         COUNT(*) FILTER (WHERE call_status='connected') as connected,
                         ROUND(AVG(score_overall)::numeric,1) as avg_score
                  FROM feedback_calls
                  WHERE created_at >= NOW() - INTERVAL '30 days'`),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='open') as open_count FROM alerts"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='pending') as pending_count FROM requisitions"),
    ])
    res.json({
      total_properties:       parseInt(props.rows[0].count),
      calls_this_month:       parseInt(calls.rows[0].completed),
      avg_overall_score:      parseFloat(calls.rows[0].avg_score) || 0,
      open_alerts:            parseInt(alerts.rows[0].open_count),
      pending_requisitions:   parseInt(reqs.rows[0].pending_count),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// FEEDBACK CALLS
// ═══════════════════════════════════════════════════════════
app.get('/api/feedback', async (req, res) => {
  try {
    const { property_id, limit = 50 } = req.query
    const params = [parseInt(limit)]
    let where = ''
    if (property_id) {
      where = 'WHERE fc.property_id = $2'
      params.push(parseInt(property_id))
    }
    const { rows } = await pool.query(`
      SELECT fc.*, g.guest_name, g.check_out_date, p.name AS property_name
      FROM feedback_calls fc
      JOIN guests g ON g.id = fc.guest_id
      JOIN properties p ON p.id = fc.property_id
      ${where}
      ORDER BY fc.created_at DESC
      LIMIT $1
    `, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// GOOGLE REVIEWS
// ═══════════════════════════════════════════════════════════
app.get('/api/reviews', async (req, res) => {
  try {
    const { property_id } = req.query
    const params = []
    let where = ''
    if (property_id) { where = 'WHERE gr.property_id = $1'; params.push(property_id) }
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (gr.property_id)
        gr.*, p.name AS property_name, p.location
      FROM google_reviews gr
      JOIN properties p ON p.id = gr.property_id
      ${where}
      ORDER BY gr.property_id, gr.fetched_at DESC
    `, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// REQUISITIONS
// ═══════════════════════════════════════════════════════════
app.get('/api/requisitions', async (req, res) => {
  try {
    const { property_id, status } = req.query
    const conditions = []
    const params = []
    if (property_id) { conditions.push(`r.property_id = $${params.length + 1}`); params.push(property_id) }
    if (status)      { conditions.push(`r.status = $${params.length + 1}`); params.push(status) }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
    const { rows } = await pool.query(`
      SELECT r.*, p.name AS property_name, ii.name AS item_name, ii.category,
             u.name AS raised_by_name, a.name AS approver_name
      FROM requisitions r
      JOIN properties p ON p.id = r.property_id
      JOIN inventory_items ii ON ii.id = r.item_id
      JOIN users u ON u.id = r.raised_by
      LEFT JOIN users a ON a.id = r.approver_id
      ${where}
      ORDER BY 
        CASE r.urgency WHEN 'critical' THEN 1 WHEN 'urgent' THEN 2 ELSE 3 END,
        r.created_at DESC
    `, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/requisitions', async (req, res) => {
  const { property_id, raised_by, item_id, quantity, urgency, justification } = req.body
  try {
    const { rows } = await pool.query(`
      INSERT INTO requisitions (property_id, raised_by, item_id, quantity, urgency, justification)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [property_id, raised_by, item_id, quantity, urgency || 'routine', justification])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/requisitions/:id', async (req, res) => {
  const { status, approved_qty, approver_id, approver_note, dispatch_date } = req.body
  try {
    const extra = status === 'approved' ? ', approved_at = NOW()' :
                  status === 'dispatched' ? ', dispatched_at = NOW()' : ''
    const { rows } = await pool.query(`
      UPDATE requisitions
      SET status = $1, approved_qty = $2, approver_id = $3,
          approver_note = $4, dispatch_date = $5 ${extra}
      WHERE id = $6 RETURNING *
    `, [status, approved_qty, approver_id, approver_note, dispatch_date, req.params.id])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════
app.get('/api/alerts', async (req, res) => {
  try {
    const { property_id, status } = req.query
    const conditions = []
    const params = []
    if (property_id) { conditions.push(`a.property_id = $${params.length+1}`); params.push(property_id) }
    if (status)      { conditions.push(`a.status = $${params.length+1}`); params.push(status) }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
    const { rows } = await pool.query(`
      SELECT a.*, p.name AS property_name, u.name AS raised_by_name
      FROM alerts a
      JOIN properties p ON p.id = a.property_id
      JOIN users u ON u.id = a.raised_by
      ${where}
      ORDER BY CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
               a.created_at DESC
    `, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/alerts', async (req, res) => {
  const { property_id, raised_by, title, description, severity } = req.body
  try {
    const { rows } = await pool.query(`
      INSERT INTO alerts (property_id, raised_by, title, description, severity)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [property_id, raised_by, title, description, severity || 'medium'])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/alerts/:id', async (req, res) => {
  const { status, acknowledged_by, resolved_by } = req.body
  try {
    const ack = status === 'acknowledged' ? ', acknowledged_by = $3, acknowledged_at = NOW()' : ''
    const res_ = status === 'resolved' ? ', resolved_by = $4, resolved_at = NOW()' : ''
    const { rows } = await pool.query(`
      UPDATE alerts SET status = $1 ${ack} ${res_} WHERE id = $2 RETURNING *
    `, [status, req.params.id, acknowledged_by, resolved_by].filter(x => x !== undefined))
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// INVENTORY ITEMS
// ═══════════════════════════════════════════════════════════
app.get('/api/inventory-items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM inventory_items WHERE is_active = true ORDER BY category, name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// AI INSIGHTS
// ═══════════════════════════════════════════════════════════
app.get('/api/insights', async (req, res) => {
  try {
    const { property_id } = req.query
    const params = []
    let where = 'WHERE i.is_dismissed = false'
    if (property_id) { where += ` AND i.property_id = $1`; params.push(property_id) }
    const { rows } = await pool.query(`
      SELECT i.*, p.name AS property_name
      FROM ai_insights i
      JOIN properties p ON p.id = i.property_id
      ${where}
      ORDER BY i.generated_at DESC
      LIMIT 50
    `, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, p.name AS property_name
      FROM users u
      LEFT JOIN properties p ON p.id = u.property_id
      ORDER BY u.role DESC, u.name
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/users', async (req, res) => {
  const { clerk_user_id, email, name, role, property_id } = req.body
  try {
    const { rows } = await pool.query(`
      INSERT INTO users (clerk_user_id, email, name, role, property_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [clerk_user_id, email, name, role, property_id || null])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/users/:id', async (req, res) => {
  const { is_active, property_id, role } = req.body
  try {
    const { rows } = await pool.query(`
      UPDATE users SET is_active = COALESCE($1, is_active),
        property_id = COALESCE($2, property_id), role = COALESCE($3, role)
      WHERE id = $4 RETURNING *
    `, [is_active, property_id, role, req.params.id])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// WEBHOOKS — Voice AI callbacks
// ═══════════════════════════════════════════════════════════

// Sarvam webhook — receives call results
app.post('/api/webhooks/sarvam', async (req, res) => {
  try {
    const { call_id, status, transcript, duration } = req.body
    console.log('Sarvam webhook received:', { call_id, status })

    // Find the feedback_call record by external_call_id
    const { rows } = await pool.query(
      'SELECT * FROM feedback_calls WHERE external_call_id = $1 AND call_provider = $2',
      [call_id, 'sarvam']
    )
    if (!rows[0]) return res.status(404).json({ error: 'Call not found' })

    const callRecord = rows[0]

    if (status === 'completed' && transcript) {
      // Score the transcript via Anthropic API
      const scores = await scoreTranscript(transcript)

      await pool.query(`
        UPDATE feedback_calls
        SET call_status = 'completed', transcript = $1, call_duration_sec = $2,
            score_food = $3, score_stay = $4, score_staff = $5, score_overall = $6,
            comments = $7, completed_at = NOW()
        WHERE id = $8
      `, [transcript, duration, scores.food, scores.stay, scores.staff, scores.overall, scores.comments, callRecord.id])
    } else {
      await pool.query(
        'UPDATE feedback_calls SET call_status = $1 WHERE id = $2',
        [status === 'no-answer' ? 'no_answer' : status, callRecord.id]
      )
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Sarvam webhook error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Fundamento webhook
app.post('/api/webhooks/fundamento', async (req, res) => {
  try {
    const { call_uuid, call_status, transcript, duration_seconds } = req.body
    console.log('Fundamento webhook received:', { call_uuid, call_status })

    const { rows } = await pool.query(
      'SELECT * FROM feedback_calls WHERE external_call_id = $1 AND call_provider = $2',
      [call_uuid, 'fundamento']
    )
    if (!rows[0]) return res.status(404).json({ error: 'Call not found' })

    if (call_status === 'completed' && transcript) {
      const scores = await scoreTranscript(transcript)
      await pool.query(`
        UPDATE feedback_calls
        SET call_status = 'completed', transcript = $1, call_duration_sec = $2,
            score_food = $3, score_stay = $4, score_staff = $5, score_overall = $6,
            comments = $7, completed_at = NOW()
        WHERE id = $8
      `, [transcript, duration_seconds, scores.food, scores.stay, scores.staff, scores.overall, scores.comments, rows[0].id])
    } else {
      await pool.query('UPDATE feedback_calls SET call_status = $1 WHERE id = $2',
        ['no_answer', rows[0].id])
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Fundamento webhook error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// AI SCORING — score transcript via Anthropic
// ═══════════════════════════════════════════════════════════
async function scoreTranscript(transcript) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are scoring a hotel guest feedback call transcript. Extract scores.

Transcript:
${transcript}

Return ONLY valid JSON, no other text:
{
  "food": <0.0-5.0, null if not mentioned>,
  "stay": <0.0-5.0, null if not mentioned>,
  "staff": <0.0-15.0, null if not mentioned>,
  "overall": <0.0-10.0 computed from above>,
  "comments": "<key concern in one sentence, or null>"
}`
        }]
      })
    })
    const data = await response.json()
    const text = data.content[0].text.trim()
    return JSON.parse(text)
  } catch (err) {
    console.error('Scoring failed:', err)
    return { food: null, stay: null, staff: null, overall: null, comments: null }
  }
}

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 GMVN Control Tower API running on port ${PORT}`)
})
