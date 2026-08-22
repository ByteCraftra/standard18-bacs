import { Router } from 'express';

export const healthRouter: Router = Router();

/** 
 * @swagger
 * /health:
 *   get:   
 *    summary: Check the health of the API
 *   responses:
 *    200:
 *    description: API is healthy
 *   content:
 *    application/json:
 *    schema:
 *    type: object
 *   properties:
 *    status:
 *    type: string
 *   example: "healthy"
 * */
healthRouter.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});