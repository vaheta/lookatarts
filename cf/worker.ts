// Cloudflare Worker port of the lookatarts FastAPI backend (main.py).
// D1 replaces Neon Postgres, R2 replaces Replit Object Storage.
// The React frontend is served from the assets binding on the same origin.
import { Hono } from 'hono';

type Env = {
  DB: D1Database;
  ARTWORKS: R2Bucket;
  ASSETS: Fetcher;
};

type ImageRow = {
  id: number;
  created_at: string;
  image_url: string | null;
  date: string | null;
  description: string | null;
};

type EventRow = {
  id: number;
  event_type: string;
  user_id: string | null;
  session_id: string;
  total_planned_duration: number | null;
  duration_ms: number | null;
  duration_percent: number | null;
  event_metadata: string | null;
  created_at: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  await next();
  // The old FastAPI backend allowed any origin; keep that for compatibility
  c.header('Access-Control-Allow-Origin', '*');
});

function nowISO(): string {
  return new Date().toISOString();
}

function getUserIdFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(/(?:^|;\s*)user_id=([^;]+)/);
  return m ? m[1].trim() : null;
}

app.get('/health', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({ status: 'healthy' });
  } catch {
    return c.json({ detail: 'Database is unavailable' }, 500);
  }
});

app.get('/api/todays_pic/metadata', async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  let image = await c.env.DB
    .prepare('SELECT * FROM images WHERE date = ?')
    .bind(today)
    .first<ImageRow>();
  if (!image) {
    image = await c.env.DB
      .prepare('SELECT * FROM images WHERE date IS NOT NULL ORDER BY date DESC LIMIT 1')
      .first<ImageRow>();
  }
  if (!image) return c.json({ detail: 'No images found in the database' }, 404);

  let description: unknown = {};
  try {
    description = image.description ? JSON.parse(image.description) : {};
  } catch {
    description = {};
  }
  return c.json({ image_url: image.image_url, description });
});

app.get('/api/storage/:path{.+}', async (c) => {
  const path = c.req.param('path');
  if (!path) return c.json({ detail: 'Image URL is required' }, 400);

  const obj = await c.env.ARTWORKS.get(path);
  if (!obj) return c.json({ detail: 'Image not found in storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
      ...(obj.size ? { 'Content-Length': String(obj.size) } : {}),
    },
  });
});

// Ambient audio tracks are too large for Worker static assets (25 MiB limit),
// so they live in R2 under audio/ and are served here with Range support for seeking.
app.get('/audio/:file{.+}', async (c) => {
  const key = 'audio/' + decodeURIComponent(c.req.param('file'));
  const rangeHeader = c.req.header('range');

  if (rangeHeader) {
    const head = await c.env.ARTWORKS.head(key);
    if (!head) return c.text('Not found', 404);
    const size = head.size;
    const m = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    if (m && (m[1] !== '' || m[2] !== '')) {
      let offset: number;
      let length: number;
      if (m[1] === '') {
        // suffix range: last N bytes
        length = Math.min(parseInt(m[2], 10), size);
        offset = size - length;
      } else {
        offset = parseInt(m[1], 10);
        const end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
        length = end - offset + 1;
      }
      if (offset >= size || length <= 0) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      }
      const obj = await c.env.ARTWORKS.get(key, { range: { offset, length } });
      if (!obj) return c.text('Not found', 404);
      return new Response(obj.body, {
        status: 206,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(length),
          'Content-Range': `bytes ${offset}-${offset + length - 1}/${size}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=604800',
        },
      });
    }
  }

  const obj = await c.env.ARTWORKS.get(key);
  if (!obj) return c.text('Not found', 404);
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(obj.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=604800',
    },
  });
});

app.post('/api/timer/start', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const planned = Number.isFinite(body?.total_planned_duration) ? body.total_planned_duration : null;
  if (planned == null) return c.json({ detail: 'total_planned_duration is required' }, 422);

  let userId = getUserIdFromCookie(c.req.header('cookie')) || body?.user_id || null;
  let setCookie = false;
  if (!userId) {
    userId = crypto.randomUUID();
    setCookie = true;
  }
  const sessionId = body?.session_id || crypto.randomUUID();

  const r = await c.env.DB
    .prepare(
      `INSERT INTO events (event_type, user_id, session_id, total_planned_duration, event_metadata, created_at)
       VALUES ('start', ?, ?, ?, ?, ?) RETURNING id`
    )
    .bind(userId, sessionId, planned, body?.metadata ? JSON.stringify(body.metadata) : null, nowISO())
    .first<{ id: number }>();

  if (setCookie) {
    c.header(
      'Set-Cookie',
      `user_id=${userId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`
    );
  }
  return c.json({ status: 'success', event_id: r!.id, session_id: sessionId, user_id: userId });
});

app.post('/api/timer/end', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const sessionId = typeof body?.session_id === 'string' ? body.session_id : '';
  if (!sessionId) return c.json({ detail: 'session_id is required' }, 422);

  const start = await c.env.DB
    .prepare(
      `SELECT * FROM events WHERE session_id = ? AND event_type = 'start'
       ORDER BY created_at DESC LIMIT 1`
    )
    .bind(sessionId)
    .first<EventRow>();
  if (!start) return c.json({ detail: 'No matching start event found for this timer' }, 400);

  const userId = getUserIdFromCookie(c.req.header('cookie')) || start.user_id;
  const planned = start.total_planned_duration;

  // created_at may be ISO (new rows) or "YYYY-MM-DD HH:MM:SS.ffffff+00" (migrated rows)
  const startMs = Date.parse(
    start.created_at.includes('T') ? start.created_at : start.created_at.replace(' ', 'T')
  );
  const durationMs = Math.max(0, Date.now() - startMs);
  const plannedMs = (planned ?? 0) * 60 * 1000;
  const durationPercent = plannedMs > 0 ? (durationMs / plannedMs) * 100 : 0;

  const r = await c.env.DB
    .prepare(
      `INSERT INTO events (event_type, user_id, session_id, total_planned_duration, duration_ms, duration_percent, event_metadata, created_at)
       VALUES ('end', ?, ?, ?, ?, ?, ?, ?) RETURNING id`
    )
    .bind(
      userId,
      sessionId,
      planned,
      durationMs,
      durationPercent,
      body?.metadata ? JSON.stringify(body.metadata) : null,
      nowISO()
    )
    .first<{ id: number }>();

  return c.json({
    status: 'success',
    event_id: r!.id,
    duration_ms: durationMs,
    duration_percent: durationPercent,
    total_planned_duration: planned,
  });
});

app.notFound(async (c) => {
  const path = new URL(c.req.url).pathname;
  if (path.startsWith('/api/') || path === '/health') {
    return c.json({ detail: 'Not Found' }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
