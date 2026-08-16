import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { app } from './app';
import pino from 'pino';

// Determine which .env file to load
const envFile = process.env.NODE_ENV === 'production'
  ? path.resolve(process.cwd(), '.env.production')
  : path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config(); // fallback to .env
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production'
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true },
      },
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`BACS Standard 18 API running on port ${PORT} (${process.env.NODE_ENV || 'local'} mode)`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);