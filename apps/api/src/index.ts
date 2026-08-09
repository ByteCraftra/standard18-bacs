import { app } from './app';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`BACS Standard 18 API running on port ${PORT}`);
});