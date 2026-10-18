import { Router } from 'express';
import multer from 'multer';
import { analyzeController } from '../controllers/analyzeController';

const upload = multer({ storage: multer.memoryStorage() });

export const analyzeRouter: Router = Router();

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze a BACS Standard 18 file
 *     description: Parses the file and returns statistical analysis.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Analysis result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzerResult'
 *       400:
 *         description: Bad request
 */
analyzeRouter.post('/', upload.single('file'), analyzeController);