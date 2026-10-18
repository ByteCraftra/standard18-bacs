import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${Date.now() - start}ms`,
    });
  });
  next();
}

export function globalmiddleware(req: Request, res: Response, next: NextFunction) {
  let requestTime: string = new Date().toISOString();
  let requestId: string = crypto.randomUUID();

  res.locals.requestTime = requestTime;
  res.locals.requestId = requestId;

  res.set('X-Request-Time', requestTime);
  res.set('X-Request-Id', requestId);

  res.set('Cache-Control', 'no-store');
  next();
}