import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // 1. Fetch data from all modules in parallel
        const [
            { data: aptitudeData },
            { data: dsaData },
            { data: fundamentalsData },
            { data: resumeData },
            { data: interviewData },
        ] = await Promise.all([
            supabase.from('aptitude_results').select('score').eq('user_id', userId),
            supabase.from('dsa_results').select('score').eq('user_id', userId),
            supabase.from('fundamentals_results').select('score').eq('user_id', userId),
            supabase.from('resume_analysis').select('ats_score').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
            supabase.from('interviews').select('score, type').eq('user_id', userId),
        ]);

        // 2. Calculate averages
        const avg = (arr: any[], key: string) => arr && arr.length > 0 ? Math.round(arr.reduce((acc, curr) => acc + curr[key], 0) / arr.length) : 0;

        const aptitudeAvg = avg(aptitudeData || [], 'score');
        const dsaAvg = avg(dsaData || [], 'score');
        const fundamentalsAvg = avg(fundamentalsData || [], 'score');
        const resumeScore = resumeData && resumeData.length > 0 ? resumeData[0].ats_score : 0;

        const technicalInterviews = (interviewData || []).filter(i => i.type === 'Technical' || i.type === 'Off-Campus');
        const hrInterviews = (interviewData || []).filter(i => i.type === 'HR');

        const technicalAvg = avg(technicalInterviews, 'score');
        const hrAvg = avg(hrInterviews, 'score');

        // 3. Calculate Placement Readiness Score
        // Formula: (Aptitude * 0.15) + (DSA * 0.25) + (Fundamentals * 0.20) + (Resume * 0.10) + (Technical * 0.20) + (HR * 0.10)
        const readinessScore = Math.round(
            (aptitudeAvg * 0.15) +
            (dsaAvg * 0.25) +
            (fundamentalsAvg * 0.20) +
            (resumeScore * 0.10) +
            (technicalAvg * 0.20) +
            (hrAvg * 0.10)
        );

        // 4. Update progress_tracking table
        await supabase.from('progress_tracking').upsert({
            user_id: userId,
            readiness_score: readinessScore,
            aptitude_avg: aptitudeAvg,
            dsa_avg: dsaAvg,
            fundamentals_avg: fundamentalsAvg,
            resume_score: resumeScore,
            technical_avg: technicalAvg,
            hr_avg: hrAvg,
        });

        res.json({
            aptitudeAvg,
            dsaAvg,
            fundamentalsAvg,
            resumeScore,
            technicalAvg,
            hrAvg,
            readinessScore,
        });
    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getDashboardHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('interviews')
            .select('id, type, domain, score, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const history = data.map((item: any) => ({
            id: item.id,
            topic: item.domain || 'General',
            type: item.type,
            score: item.score || 0,
            date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));

        res.json(history);
    } catch (err) {
        console.error('History Error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
