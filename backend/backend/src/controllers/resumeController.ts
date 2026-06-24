import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ResumeService } from '../services/resumeService';
import { AIService } from '../services/aiService';
import { supabase } from '../config/supabase';

export const analyzeResume = async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const { targetDomain } = req.body;

    try {
        // 1. Extract text from resume and sanitize it
        let resumeText = await ResumeService.extractText(req.file.buffer, req.file.mimetype);
        resumeText = resumeText.replace(/\0/g, ''); // Remove null bytes that crash PostgreSQL

        // 2. Analyze with Gemini
        const analysis = await AIService.analyzeResume(resumeText, targetDomain || 'Software Engineering');

        // 3. (Optional) Upload to Supabase Storage
        const fileName = `${req.user.id}/${Date.now()}_${req.file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
            });

        // 4. Save analysis results to DB
        const { data, error } = await supabase
            .from('resume_analysis')
            .insert({
                user_id: req.user.id,
                resume_url: uploadData?.path,
                ats_score: analysis.atsScore,
                resume_quality_score: analysis.resumeQualityScore,
                missing_skills: analysis.missingSkills,
                missing_keywords: analysis.missingKeywords,
                suggestions: analysis.suggestions,
                parsed_content: resumeText,
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err: any) {
        console.error('Resume Analysis Error:', err);
        res.status(500).json({ error: err.message || 'Failed to analyze resume' });
    }
};
