import app from '../backend/src/app.js';
import { bootstrap } from '../backend/src/bootstrap.js';

if (!process.env.VERCEL) {
  await import('dotenv/config');
}

await bootstrap();

export default app;
