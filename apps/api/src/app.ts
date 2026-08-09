import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { setupSwagger } from './swagger';

export const app:Express = express();

// Security & performance middlewares
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing for JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb', type: 'text/plain' }));

// Request logging (Pino)
app.use(requestLogger);

// Swagger UI
setupSwagger(app);

// API routes
app.use('/api/v1', apiRouter);

// Global error handler (must be last)
app.use(errorHandler);