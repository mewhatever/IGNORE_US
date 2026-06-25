import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to backend/.env or your shell.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes('localhost') ||
    process.env.DATABASE_URL?.includes('127.0.0.1') ||
    process.env.DATABASE_URL?.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
});

try {
  const sql = readFileSync(join(__dirname, '../src/db/init.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database schema initialized successfully.');
} catch (err) {
  console.error('Database init failed:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
