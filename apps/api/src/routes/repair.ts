import { Router } from 'express';
import multer from 'multer';
import { repairController } from '../controllers/repairController';

const upload = multer({ storage: multer.memoryStorage() });

export const repairRouter: Router = Router();

/**
 * @swagger
 * /repair:
 *   post:
 *     summary: Repair formatting issues in a BACS Standard 18 file
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
 *         description: Repaired file content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 repairedContent:
 *                   type: string
 *       400:
 *         description: Bad request
 */
repairRouter.post('/', upload.any(), repairController);