CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'agent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(100) NOT NULL,
  channel VARCHAR(50),
  locale VARCHAR(20),
  message TEXT NOT NULL,
  case_type VARCHAR(80) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  department VARCHAR(80) NOT NULL,
  agent_summary TEXT NOT NULL,
  human_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  confidence NUMERIC(4, 3) NOT NULL,
  classified_by_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_case_type ON tickets(case_type);
CREATE INDEX IF NOT EXISTS idx_tickets_severity ON tickets(severity);
