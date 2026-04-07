-- ============================================================
-- GMVN CONTROL TOWER — DATABASE SCHEMA
-- Run this on your Railway PostgreSQL instance
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROPERTIES — all 82 GMVN guest houses
-- ============================================================
CREATE TABLE properties (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  location        TEXT NOT NULL,
  district        TEXT,
  google_place_id TEXT,                    -- filled in Step 7
  google_maps_url TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS — linked to Clerk auth, role-based
-- ============================================================
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  clerk_user_id   TEXT UNIQUE NOT NULL,    -- Clerk's user ID
  email           TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('super_admin', 'property_manager')),
  property_id     INT REFERENCES properties(id),  -- NULL for super_admin
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GUESTS — synced from GMVN Google Sheet
-- ============================================================
CREATE TABLE guests (
  id              SERIAL PRIMARY KEY,
  serial_no       INT,
  guest_name      TEXT NOT NULL,
  property_id     INT NOT NULL REFERENCES properties(id),
  check_in_date   DATE NOT NULL,
  check_out_date  DATE NOT NULL,
  visit_type      TEXT CHECK (visit_type IN ('Package', 'Single', 'Other')),
  phone_number    TEXT,                    -- stored encrypted, never logged
  sheet_row_hash  TEXT UNIQUE,             -- dedup: hash of name+property+checkin
  synced_at       TIMESTAMPTZ DEFAULT NOW(),
  call_scheduled  BOOLEAN DEFAULT FALSE,
  call_date       DATE                     -- day after checkout
);

-- ============================================================
-- FEEDBACK CALLS — one row per AI call attempt
-- ============================================================
CREATE TABLE feedback_calls (
  id                  SERIAL PRIMARY KEY,
  guest_id            INT NOT NULL REFERENCES guests(id),
  property_id         INT NOT NULL REFERENCES properties(id),
  call_provider       TEXT NOT NULL CHECK (call_provider IN ('sarvam', 'fundamento', 'manual')),
  external_call_id    TEXT,               -- provider's call ID for webhook matching
  call_status         TEXT NOT NULL DEFAULT 'scheduled'
                        CHECK (call_status IN ('scheduled','initiated','connected','completed','no_answer','failed')),
  call_duration_sec   INT,
  transcript          TEXT,               -- full call transcript
  -- Scores (from AI scoring after transcript)
  score_food          NUMERIC(3,1),        -- 0-5
  score_stay          NUMERIC(3,1),        -- 0-5
  score_staff         NUMERIC(4,1),        -- 0-15
  score_overall       NUMERIC(4,1),        -- computed: (food+stay+staff)/25*10
  comments            TEXT,
  -- Sheet pre-filled scores (if guest already rated in sheet)
  sheet_score_food    NUMERIC(3,1),
  sheet_score_stay    NUMERIC(3,1),
  sheet_score_staff   NUMERIC(4,1),
  sheet_comments      TEXT,
  initiated_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOOGLE REVIEWS — pulled via Places API weekly
-- ============================================================
CREATE TABLE google_reviews (
  id              SERIAL PRIMARY KEY,
  property_id     INT NOT NULL REFERENCES properties(id),
  google_rating   NUMERIC(2,1),            -- e.g. 4.2
  total_reviews   INT,
  review_text     TEXT,                    -- latest reviews (JSON array stored as text)
  sentiment_pos   INT DEFAULT 0,           -- count of positive reviews
  sentiment_neg   INT DEFAULT 0,
  sentiment_neu   INT DEFAULT 0,
  fetched_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVENTORY ITEMS — master catalogue
-- ============================================================
CREATE TABLE inventory_items (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (
                'Linen & Bedding',
                'Furniture & Fittings',
                'Electrical & Mechanical',
                'Consumables & Housekeeping',
                'Maintenance & Repair',
                'Other'
              )),
  unit        TEXT DEFAULT 'units',       -- pieces, sets, kg, etc.
  is_active   BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- REQUISITIONS — property manager requests
-- ============================================================
CREATE TABLE requisitions (
  id              SERIAL PRIMARY KEY,
  property_id     INT NOT NULL REFERENCES properties(id),
  raised_by       INT NOT NULL REFERENCES users(id),
  item_id         INT NOT NULL REFERENCES inventory_items(id),
  quantity        INT NOT NULL,
  urgency         TEXT NOT NULL DEFAULT 'routine'
                    CHECK (urgency IN ('routine', 'urgent', 'critical')),
  justification   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','partial','rejected','dispatched')),
  approved_qty    INT,                    -- may differ from requested
  approver_id     INT REFERENCES users(id),
  approver_note   TEXT,
  dispatch_date   DATE,
  approved_at     TIMESTAMPTZ,
  dispatched_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALERTS — urgent flags raised by property managers
-- ============================================================
CREATE TABLE alerts (
  id              SERIAL PRIMARY KEY,
  property_id     INT NOT NULL REFERENCES properties(id),
  raised_by       INT NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  severity        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'acknowledged', 'resolved')),
  acknowledged_by INT REFERENCES users(id),
  resolved_by     INT REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI INSIGHTS — generated weekly per property
-- ============================================================
CREATE TABLE ai_insights (
  id              SERIAL PRIMARY KEY,
  property_id     INT NOT NULL REFERENCES properties(id),
  insight_type    TEXT NOT NULL CHECK (insight_type IN (
                    'feedback_pattern',
                    'inventory_gap',
                    'service_alert',
                    'positive_highlight'
                  )),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  recommendation TEXT,
  confidence      TEXT CHECK (confidence IN ('low','medium','high')),
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  is_dismissed    BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- SYNC LOG — audit trail for Google Sheet imports
-- ============================================================
CREATE TABLE sync_logs (
  id              SERIAL PRIMARY KEY,
  sync_type       TEXT NOT NULL,          -- 'google_sheet', 'google_reviews'
  rows_read       INT DEFAULT 0,
  rows_inserted   INT DEFAULT 0,
  rows_skipped    INT DEFAULT 0,
  error_message   TEXT,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: All 82 GMVN Properties
-- ============================================================
INSERT INTO properties (id, name, location, district) VALUES
(1,  'Hotel Drona',              'Dehradun',    'Dehradun'),
(2,  'Sahastradhara TRH',        'Dehradun',    'Dehradun'),
(3,  'Asan Conservation Resort', 'Dehradun',    'Dehradun'),
(4,  'Dakpathar TRH',            'Dehradun',    'Dehradun'),
(5,  'Garhwal Terrace',          'Mussoorie',   'Dehradun'),
(6,  'Ganga Resort',             'Rishikesh',   'Tehri'),
(7,  'Bharat Bhoomi',            'Rishikesh',   'Tehri'),
(8,  'Rishilok',                 'Rishikesh',   'Tehri'),
(9,  'Rahi Motel',               'Haridwar',    'Haridwar'),
(10, 'Auli Tourist Bungalow',    'Auli',        'Chamoli'),
(11, 'Jyotir Tourist Complex',   'Joshimath',   'Chamoli'),
(12, 'Hotel Devlok',             'Badrinath',   'Chamoli'),
(13, 'Badrinath TRH',            'Badrinath',   'Chamoli'),
(14, 'Swargarohini Cottages',    'Kedarnath',   'Rudraprayag'),
(15, 'Sumeru Tent Colony',       'Kedarnath',   'Rudraprayag'),
(16, 'Gangotri TRH',             'Gangotri',    'Uttarkashi'),
(17, 'Yamunotri TRH',            'Yamunotri',   'Uttarkashi'),
(18, 'Harsil TRH',               'Harsil',      'Uttarkashi'),
(19, 'Tip-In-Top Huts',          'Lansdowne',   'Pauri'),
(20, 'Dhanaulti Heights',        'Dhanaulti',   'Tehri'),
(21, 'Srinagar Alaknanda',       'Srinagar',    'Pauri'),
(22, 'Khirsu TRH',               'Khirsu',      'Pauri'),
(23, 'Guptkashi TRH',            'Guptkashi',   'Rudraprayag'),
(24, 'Barkot TRH',               'Barkot',      'Uttarkashi'),
(25, 'Uttarkashi TRH',           'Uttarkashi',  'Uttarkashi'),
(26, 'Syalsaur Eco Resort',      'Syalsaur',    'Pauri'),
(27, 'Chandrapuri TRH',          'Rudraprayag', 'Rudraprayag'),
(28, 'Rudra Complex',            'Rudraprayag', 'Rudraprayag'),
(29, 'Ghangharia TRH',           'Ghangharia',  'Chamoli'),
(30, 'Govindghat TRH',           'Govindghat',  'Chamoli'),
(31, 'Pipalkoti TRH',            'Pipalkoti',   'Chamoli'),
(32, 'Karnaprayag TRH',          'Karnaprayag', 'Chamoli'),
(33, 'Gauchar TRH',              'Gauchar',     'Chamoli'),
(34, 'Gwaldam TRH',              'Gwaldam',     'Chamoli'),
(35, 'Pauri TRH',                'Pauri',       'Pauri'),
(36, 'Kotdwar TRH',              'Kotdwar',     'Pauri'),
(37, 'Chamba TRH',               'Tehri',       'Tehri'),
(38, 'Hanol TRH',                'Chakrata',    'Dehradun'),
(39, 'Purola TRH',               'Uttarkashi',  'Uttarkashi'),
(40, 'Mori TRH',                 'Uttarkashi',  'Uttarkashi'),
(41, 'Sankri TRH',               'Uttarkashi',  'Uttarkashi'),
(42, 'Bhojbasa TRH',             'Gaumukh',     'Uttarkashi'),
(43, 'Janki Chatti TRH',         'Yamunotri',   'Uttarkashi'),
(44, 'Syanachatti TRH',          'Yamunotri',   'Uttarkashi'),
(45, 'Phulchatti TRH',           'Yamunotri',   'Uttarkashi'),
(46, 'Bhaironghati TRH',         'Gangotri',    'Uttarkashi'),
(47, 'Lanka TRH',                'Gangotri',    'Uttarkashi'),
(48, 'Gaurikund TRH',            'Kedarnath',   'Rudraprayag'),
(49, 'Sonprayag TRH',            'Kedarnath',   'Rudraprayag'),
(50, 'Rampur TRH',               'Kedarnath',   'Rudraprayag'),
(51, 'Phata TRH',                'Kedarnath',   'Rudraprayag'),
(52, 'Narayankoti TRH',          'Rudraprayag', 'Rudraprayag'),
(53, 'Jakholi TRH',              'Rudraprayag', 'Rudraprayag'),
(54, 'Augustmuni TRH',           'Rudraprayag', 'Rudraprayag'),
(55, 'Tilwara TRH',              'Rudraprayag', 'Rudraprayag'),
(56, 'Ukhimath TRH',             'Rudraprayag', 'Rudraprayag'),
(57, 'Chopta TRH',               'Rudraprayag', 'Rudraprayag'),
(58, 'Mandal TRH',               'Chamoli',     'Chamoli'),
(59, 'Gopeshwar TRH',            'Chamoli',     'Chamoli'),
(60, 'Nandprayag TRH',           'Chamoli',     'Chamoli'),
(61, 'Birahi TRH',               'Chamoli',     'Chamoli'),
(62, 'Helang TRH',               'Chamoli',     'Chamoli'),
(63, 'Pandukeshwar TRH',         'Chamoli',     'Chamoli'),
(64, 'Mana Village TRH',         'Chamoli',     'Chamoli'),
(65, 'Wan TRH',                  'Chamoli',     'Chamoli'),
(66, 'Mundoli TRH',              'Chamoli',     'Chamoli'),
(67, 'Lohajung TRH',             'Chamoli',     'Chamoli'),
(68, 'Dewal TRH',                'Chamoli',     'Chamoli'),
(69, 'Tharali TRH',              'Chamoli',     'Chamoli'),
(70, 'Adi Badri TRH',            'Chamoli',     'Chamoli'),
(71, 'Devprayag TRH',            'Tehri',       'Tehri'),
(72, 'Kirti Nagar TRH',          'Tehri',       'Tehri'),
(73, 'New Tehri TRH',            'Tehri',       'Tehri'),
(74, 'Koteshwar TRH',            'Tehri',       'Tehri'),
(75, 'Kaudiyala TRH',            'Tehri',       'Tehri'),
(76, 'Satpuli TRH',              'Pauri',       'Pauri'),
(77, 'Bubakhal TRH',             'Pauri',       'Pauri'),
(78, 'Thalisain TRH',            'Pauri',       'Pauri'),
(79, 'Chilla TRH',               'Pauri',       'Pauri'),
(80, 'Kanvashram TRH',           'Pauri',       'Pauri'),
(81, 'Corbett (Sultan)',          'Pauri',       'Pauri'),
(82, 'Roorkee TRH',              'Haridwar',    'Haridwar');

-- ============================================================
-- SEED: Inventory Item Catalogue
-- ============================================================
INSERT INTO inventory_items (name, category, unit) VALUES
-- Linen & Bedding
('Bed Sheets (Single)',       'Linen & Bedding', 'pieces'),
('Bed Sheets (Double)',       'Linen & Bedding', 'pieces'),
('Pillow Covers',             'Linen & Bedding', 'pieces'),
('Pillows',                   'Linen & Bedding', 'pieces'),
('Blankets',                  'Linen & Bedding', 'pieces'),
('Towels (Bath)',              'Linen & Bedding', 'pieces'),
('Towels (Hand)',              'Linen & Bedding', 'pieces'),
('Mattresses (Single)',        'Linen & Bedding', 'pieces'),
('Mattresses (Double)',        'Linen & Bedding', 'pieces'),
('Curtains',                  'Linen & Bedding', 'sets'),
-- Furniture & Fittings
('Chairs',                    'Furniture & Fittings', 'pieces'),
('Tables',                    'Furniture & Fittings', 'pieces'),
('Wardrobes',                 'Furniture & Fittings', 'pieces'),
('Mirrors',                   'Furniture & Fittings', 'pieces'),
('Beds (Single)',              'Furniture & Fittings', 'pieces'),
('Beds (Double)',              'Furniture & Fittings', 'pieces'),
-- Electrical & Mechanical
('Air Conditioners',          'Electrical & Mechanical', 'units'),
('Ceiling Fans',              'Electrical & Mechanical', 'units'),
('Geysers / Water Heaters',   'Electrical & Mechanical', 'units'),
('Room Heaters',              'Electrical & Mechanical', 'units'),
('LED Bulbs',                 'Electrical & Mechanical', 'pieces'),
('Tube Lights',               'Electrical & Mechanical', 'pieces'),
('Extension Boards',          'Electrical & Mechanical', 'pieces'),
('Inverters / UPS',           'Electrical & Mechanical', 'units'),
-- Consumables & Housekeeping
('Soap Bars',                 'Consumables & Housekeeping', 'pieces'),
('Shampoo Sachets',           'Consumables & Housekeeping', 'pieces'),
('Toilet Paper Rolls',        'Consumables & Housekeeping', 'pieces'),
('Phenyl / Floor Cleaner',    'Consumables & Housekeeping', 'litres'),
('Brooms',                    'Consumables & Housekeeping', 'pieces'),
('Mops',                      'Consumables & Housekeeping', 'pieces'),
('Dustbins',                  'Consumables & Housekeeping', 'pieces'),
-- Maintenance & Repair
('Plumbing Repair (pipes)',   'Maintenance & Repair', 'request'),
('Electrical Wiring Repair',  'Maintenance & Repair', 'request'),
('Door Lock Replacement',     'Maintenance & Repair', 'request'),
('Window Glass Replacement',  'Maintenance & Repair', 'request'),
('Painting / Whitewash',      'Maintenance & Repair', 'request'),
('Roof Repair',               'Maintenance & Repair', 'request');

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_guests_property ON guests(property_id);
CREATE INDEX idx_guests_checkout ON guests(check_out_date);
CREATE INDEX idx_guests_call_scheduled ON guests(call_scheduled, call_date);
CREATE INDEX idx_feedback_property ON feedback_calls(property_id);
CREATE INDEX idx_feedback_status ON feedback_calls(call_status);
CREATE INDEX idx_requisitions_property ON requisitions(property_id);
CREATE INDEX idx_requisitions_status ON requisitions(status);
CREATE INDEX idx_alerts_property ON alerts(property_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_insights_property ON ai_insights(property_id);
CREATE INDEX idx_google_reviews_property ON google_reviews(property_id);

-- ============================================================
-- UPDATED_AT trigger for requisitions
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON requisitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
