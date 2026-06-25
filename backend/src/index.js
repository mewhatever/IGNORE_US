import 'dotenv/config';
import app from './app.js';
import { bootstrap } from './bootstrap.js';
import { getLlmStatus } from './services/llmClassifier.js';

const PORT = process.env.PORT || 3001;

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.warn('Warning: JWT_SECRET should be at least 16 characters in production.');
  }

  let retries = 10;
  while (retries > 0) {
    try {
      await bootstrap();
      break;
    } catch (err) {
      retries -= 1;
      if (retries === 0) {
        console.error('Could not connect to PostgreSQL. Is Docker running?', err.message);
        process.exit(1);
      }
      console.log('Waiting for PostgreSQL...');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const classifier = getLlmStatus();
  console.log(
    `Classifier: mode=${classifier.mode}, llm=${classifier.enabled ? `${classifier.provider}/${classifier.model}` : 'disabled (rules only)'}`
  );

  app.listen(PORT, () => {
    console.log(`QueueStorm API running on http://localhost:${PORT}`);
  });
}

start();
