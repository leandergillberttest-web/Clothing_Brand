const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 500;

function readBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return {};
}

function clean(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value || "").trim().slice(0, maxLength);
}

function isEmail(value) {
  return EMAIL_PATTERN.test(value);
}

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

async function ensureTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS customer_enquiries (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      product TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customer_registrations (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      interest TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS customer_enquiries_created_at_idx
    ON customer_enquiries (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS customer_registrations_created_at_idx
    ON customer_registrations (created_at DESC)
  `;
}

module.exports = {
  clean,
  ensureTables,
  isEmail,
  readBody,
  sendJson
};
