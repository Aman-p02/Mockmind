import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';
import { supabase } from '../config/supabase';

export const generateDSAProblem = async (req: AuthRequest, res: Response) => {
    const { topic, difficulty } = req.query;

    try {
        const problem = await AIService.generateDSAQuestion(
            topic as string,
            difficulty as string
        );
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate DSA problem' });
    }
};

export const submitDSAResult = async (req: AuthRequest, res: Response) => {
    const { topic, difficulty, score, correctness_score, logic_score, complexity_feedback } = req.body;

    try {
        const { data, error } = await supabase
            .from('dsa_results')
            .insert({
                user_id: req.user.id,
                topic,
                difficulty,
                score,
                correctness_score,
                logic_score,
                complexity_feedback,
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save DSA result' });
    }
};
