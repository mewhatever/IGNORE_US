import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pool from './db/pool.js';
import { ensureDemoAgent } from './services/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let ready = null;

function assertProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const jwt = process.env.JWT_SECRET || '';
  if (jwt.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production.');
  }
}

export function bootstrap() {
  if (!ready) {
    ready = (async () => {
      assertProductionSecrets();

      const sql = readFileSync(join(__dirname, 'db', 'init.sql'), 'utf8');
      await pool.query(sql);
      await ensureDemoAgent();
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }

  return ready;
}
