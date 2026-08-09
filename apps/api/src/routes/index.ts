import { Router } from 'express';
import { validateRouter } from './validate';
import { parseRouter } from './parse';


export const apiRouter: Router = Router();

apiRouter.use('/validate', validateRouter);
apiRouter.use('/parse', parseRouter);

// Placeholder for other endpoints
apiRouter.use('/analyze', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
apiRouter.use('/generate', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));
apiRouter.use('/repair', (req, res) => res.status(501).json({ message: 'Not implemented yet' }));