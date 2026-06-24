import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';
import { supabase } from '../config/supabase';

export const generateFundamentalsQuestions = async (req: AuthRequest, res: Response) => {
    const { category, difficulty, count } = req.query;

    try {
        const questions = await AIService.generateAptitudeQuestions(
            category as string,
            difficulty as string,
            Number(count) || 10
        );
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate fundamentals questions' });
    }
};

export const submitFundamentalsScore = async (req: AuthRequest, res: Response) => {
    const { category, score, readiness_score } = req.body;

    try {
        const { data, error } = await supabase
            .from('fundamentals_results')
            .insert({
                user_id: req.user.id,
                category,
                score,
                readiness_score,
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save fundamentals score' });
    }
};
