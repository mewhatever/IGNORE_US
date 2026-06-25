import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function findAgentByEmail(email) {
  const result = await query('SELECT * FROM agents WHERE email = $1', [email.toLowerCase()]);
  return result.rows[0] || null;
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function ensureDemoAgent() {
  const email = process.env.DEMO_AGENT_EMAIL || 'agent@queuestorm.demo';
  const password = process.env.DEMO_AGENT_PASSWORD || 'Agent@2026';
  const existing = await findAgentByEmail(email);

  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO agents (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, role`,
    [email, passwordHash, 'Demo Support Agent', 'agent']
  );

  console.log(`Seeded demo agent: ${email}`);
  return result.rows[0];
}

export async function saveTicket({
  ticket_id,
  channel,
  locale,
  message,
  classification,
  agentId = null,
}) {
  const result = await query(
    `INSERT INTO tickets (
      ticket_id, channel, locale, message,
      case_type, severity, department, agent_summary,
      human_review_required, confidence, classified_by_agent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      ticket_id,
      channel || null,
      locale || null,
      message,
      classification.case_type,
      classification.severity,
      classification.department,
      classification.agent_summary,
      classification.human_review_required,
      classification.confidence,
      agentId,
    ]
  );

  return result.rows[0];
}

export async function getTicketHistory({ limit = 50, offset = 0 } = {}) {
  const result = await query(
    `SELECT ticket_id, channel, locale, message, case_type, severity, department,
            agent_summary, human_review_required, confidence, created_at
     FROM tickets
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

export async function getDashboardStats() {
  const result = await query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE human_review_required)::int AS needs_review,
       COUNT(*) FILTER (WHERE severity = 'critical')::int AS critical,
       COUNT(*) FILTER (WHERE case_type = 'phishing_or_social_engineering')::int AS phishing
     FROM tickets`
  );
  return result.rows[0];
}
