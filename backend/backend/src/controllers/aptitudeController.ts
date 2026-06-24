import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';
import { supabase } from '../config/supabase';

export const generateAptitudeQuestions = async (req: AuthRequest, res: Response) => {
    const { topic, difficulty, count } = req.query;

    try {
        const questions = await AIService.generateAptitudeQuestions(
            topic as string,
            difficulty as string,
            Number(count) || 5
        );
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate aptitude questions' });
    }
};

export const submitAptitudeScore = async (req: AuthRequest, res: Response) => {
    const { topic, difficulty, score, accuracy, topic_mastery } = req.body;

    try {
        const { data, error } = await supabase
            .from('aptitude_results')
            .insert({
                user_id: req.user.id,
                topic,
                difficulty,
                score,
                accuracy,
                topic_mastery,
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save aptitude score' });
    }
};
