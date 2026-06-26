import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';
import { supabase } from '../config/supabase';

export const startOffCampusInterview = async (req: AuthRequest, res: Response) => {
    const { domain } = req.body;

    try {
        // 1. Fetch the user's latest resume analysis
        const { data: resumeAnalysis, error: resumeError } = await supabase
            .from('resume_analysis')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (resumeError || !resumeAnalysis) {
            return res.status(400).json({ error: 'Please upload and analyze your resume first to start an off-campus interview.' });
        }

        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('question_text')
            .eq('domain', domain); // Fetch all to pick randomly from

        let question = "Can you explain your experience and how it makes you a good fit for this role?"; // Fallback
        if (!qError && questions && questions.length > 0) {
            const randomIndex = Math.floor(Math.random() * questions.length);
            question = questions[randomIndex].question_text;
        }

        // 3. Create the interview record
        const { data, error } = await supabase
            .from('interviews')
            .insert({
                user_id: req.user.id,
                type: 'Off-Campus',
                domain,
                transcript: [{ question, answer: null, evaluation: null }],
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ interviewId: data.id, currentQuestion: question });
    } catch (err) {
        console.error('Off-Campus Start Error:', err);
        res.status(500).json({ error: 'Failed to start off-campus interview' });
    }
};
