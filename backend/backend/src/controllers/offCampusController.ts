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

        // 2. Generate the first question based on resume and domain
        const prompt = `
      You are an interviewer for an off-campus placement drive for the domain "${domain}".
      Based on the user's resume content below, generate the first highly technical interview question.
      Resume Content: ${resumeAnalysis.parsed_content}
      
      RULE 1: You MUST ONLY ask strictly technical questions related to ${domain}.
      RULE 2: DO NOT ask any HR, behavioral, or college-related questions under any circumstances.
      Focus on the user's projects or skills mentioned in the resume that are relevant to ${domain}.
      Return as JSON: { "question": "..." }
    `;
        const { question } = await AIService.generateContent(prompt);

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
