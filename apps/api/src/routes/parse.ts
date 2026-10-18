import { Router } from 'express';
import multer from 'multer';
import { parseController } from '../controllers/parseController';

const upload = multer({ storage: multer.memoryStorage() });

export const parseRouter: Router = Router();

/**
 * @swagger
 * /parse:
 *   post:
 *     summary: Parse a BACS Standard 18 file into structured records
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
 *         description: Parsed records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *       400:
 *         description: Bad request
 */
parseRouter.post('/', upload.single('file'), parseController);