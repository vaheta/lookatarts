-- D1 (SQLite) schema for lookatarts, ported from the FastAPI/SQLAlchemy models in main.py
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  image_url TEXT,
  date TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT NOT NULL,
  total_planned_duration INTEGER,
  duration_ms INTEGER,
  duration_percent REAL,
  event_metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_timer_session_type ON events(session_id, event_type, created_at);

CREATE TABLE IF NOT EXISTS counter (
  id INTEGER PRIMARY KEY,
  value INTEGER NOT NULL
);
