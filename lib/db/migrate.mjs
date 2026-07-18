#!/usr/bin/env node
/**
 * Runs idempotent CREATE TABLE IF NOT EXISTS for all schema tables.
 * Used during Vercel builds where drizzle-kit push can't resolve SSL correctly.
 */
// Force IPv4 DNS resolution — Vercel build environment can't reach IPv6 addresses.
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

import pg from "pg";

const { Pool } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  // Vercel build environment doesn't support IPv6; force IPv4
  family: 4,
});

const sql = `
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_sections (
  section    TEXT        PRIMARY KEY,
  data       JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_file (
  id          INTEGER     PRIMARY KEY,
  content     TEXT        NOT NULL,
  size        INTEGER     NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

try {
  await pool.query(sql);
  console.log("Migration complete — all tables ensured.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
