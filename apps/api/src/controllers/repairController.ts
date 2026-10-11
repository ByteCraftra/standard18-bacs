import { Request, Response, NextFunction } from 'express';
import { repair, RepairResult } from '@standard18/repair';
import { z } from 'zod';

const jsonSchema = z.object({
    content: z.string().min(1),
});

export function repairController(req: Request, res: Response, next: NextFunction) {
    try {
        let content: string;

        const files = req.files as Express.Multer.File[] | undefined;
        if (files && files.length > 0) {
            content = files[0].buffer.toString('utf-8');
        } else if (req.body && typeof req.body.content === 'string') {
            const parsed = jsonSchema.parse(req.body);
            content = parsed.content;
        } else {
            return res.status(400).json({ error: 'No file or content provided.' });
        }



        const repairResult: RepairResult = repair(content);

        const originalTrimmed = content.endsWith('\n') ? content.slice(0, -1) : content;
        const repairedTrimmed = repairResult.content.endsWith('\n')
            ? repairResult.content.slice(0, -1)
            : repairResult.content;

        if (repairResult.corrections.length === 0 && originalTrimmed === repairedTrimmed) {
            return res.json({
                status: 'already_correct',
                correctionsCount: 0,
                content: content,
            });
        }

        return res.json({
            status: 'corrected',
            correctionsCount: repairResult.corrections.length,
            originalContent: content,
            repairedContent: repairResult.content,
            corrections: repairResult.corrections,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid JSON body', details: error.errors });
        }
        next(error);
    }
}