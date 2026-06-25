import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import sortTicketRouter from './routes/sortTicket.js';
import apiRouter from './routes/api.js';
import { applySecurity } from './middleware/security.js';

const app = express();

app.set('trust proxy', 1);

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

export default app;
