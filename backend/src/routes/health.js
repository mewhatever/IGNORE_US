import { Router } from 'express';
import { healthCheck } from '../db/pool.js';
import { getLlmStatus } from '../services/llmClassifier.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    const dbHealthy = await healthCheck();
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'ok' : 'degraded',
      service: 'queuestorm-api',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'unavailable',
      classifier: getLlmStatus(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      service: 'queuestorm-api',
      timestamp: new Date().toISOString(),
      database: 'unavailable',
      classifier: getLlmStatus(),
    });
  }
});

export default router;
