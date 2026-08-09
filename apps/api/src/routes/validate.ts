import { Router } from 'express';
import multer from 'multer';
import { validateController } from '../controllers/validateController';

const upload = multer({ storage: multer.memoryStorage() });

export const validateRouter: Router = Router();

/**
 * @swagger
 * /validate:
 *   post:
 *     summary: Validate a BACS Standard 18 file
 *     description: Accepts either a file upload (multipart/form-data) or a JSON body with the file content.
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
 *                 description: The full BACS file content as a string
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationResult'
 *       400:
 *         description: Bad request
 */
validateRouter.post('/', upload.single('file'), validateController);