import { Router } from 'express';
import { validateRouter } from './validate';
import { parseRouter } from './parse';
import { analyzeRouter } from './analyze';


export const apiRouter: Router = Router();

apiRouter.use('/validate', validateRouter);
apiRouter.use('/parse', parseRouter);
apiRouter.use('/analyze', analyzeRouter);

// Placeholder for other endpoints
apiRouter.use('/generate', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
apiRouter.use('/repair', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));