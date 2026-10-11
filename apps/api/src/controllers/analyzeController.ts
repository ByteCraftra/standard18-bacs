import { Request, Response, NextFunction } from 'express';
import { analyze } from '@standard18/analyzer';
import { parse } from '@standard18/parser';
import { z } from 'zod';

const jsonSchema = z.object({
  content: z.string().min(1),
});

export function analyzeController(req: Request, res: Response, next: NextFunction) {
  try {
    let content: string;

    if (req.file) {
      content = req.file.buffer.toString('utf-8');
    } else if (req.body && typeof req.body.content === 'string') {
      const parsed = jsonSchema.parse(req.body);
      content = parsed.content;
    } else {
      return res.status(400).json({ error: 'No file or content provided.' });
    }

    const bacsFile = parse(content);
    const result = analyze(bacsFile);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid JSON body', details: error.errors });
    }
    next(error);
  }
}