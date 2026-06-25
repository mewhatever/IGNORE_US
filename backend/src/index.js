import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import sortTicketRouter from './routes/sortTicket.js';
import apiRouter from './routes/api.js';
import { applySecurity } from './middleware/security.js';
import { ensureDemoAgent } from './services/auth.js';
import { getLlmStatus } from './services/llmClassifier.js';
import pool from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '32kb' }));
applySecurity(app);

app.use(healthRouter);
app.use(sortTicketRouter);
app.use('/api', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.warn('Warning: JWT_SECRET should be at least 16 characters in production.');
  }

  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch {
      retries -= 1;
      if (retries === 0) {
        console.error('Could not connect to PostgreSQL. Is Docker running?');
        process.exit(1);
      }
      console.log('Waiting for PostgreSQL...');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  await ensureDemoAgent();

  const classifier = getLlmStatus();
  console.log(
    `Classifier: mode=${classifier.mode}, llm=${classifier.enabled ? `${classifier.provider}/${classifier.model}` : 'disabled (rules only)'}`
  );

  app.listen(PORT, () => {
    console.log(`QueueStorm API running on http://localhost:${PORT}`);
  });
}

start();
