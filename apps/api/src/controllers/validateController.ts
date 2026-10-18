import { Request, Response, NextFunction } from 'express';
import { validate } from '@standard18/validator';
import { z } from 'zod';

const jsonSchema = z.object({
  content: z.string().min(1, 'File content must not be empty'),
});

export function validateController(req: Request, res: Response, next: NextFunction) {
  try {
    let content: string;

    // Check if file was uploaded
    if (req.file) {
      content = req.file.buffer.toString('utf-8');
    } else if (req.body && typeof req.body.content === 'string') {
      const parsed = jsonSchema.parse(req.body);
      content = parsed.content;
    } else {
      return res.status(400).json({
        error: 'No file or content provided. Use multipart/form-data with a "file" field or JSON with a "content" field.',
      });
    }

    const result = validate(content);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid JSON body', details: error.errors });
    }
    next(error);
  }
}