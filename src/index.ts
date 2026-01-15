import 'dotenv/config';

import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

async function start(): Promise<void> {
  const env = loadEnv();
  const app = buildApp(env);

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err, 'Failed to start server');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  void start();
}
