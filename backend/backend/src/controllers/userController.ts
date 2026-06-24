import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { supabase } from '../config/supabase';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Supabase profile fetch error:', error);
            return res.status(500).json({ error: error.message });
        }

        if (!profile) {
            // Auto-create profile from user_metadata
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.user_metadata?.name || 'New User',
                    placement_type: req.user.user_metadata?.placement_type || 'On-Campus'
                })
                .select()
                .single();

            if (createError) {
                console.error("Auto-create profile failed", createError);
                return res.status(500).json({ error: 'Failed to initialize profile' });
            }
            return res.json(newProfile);
        }

        res.json(profile);
    } catch (err) {
        console.error('getProfile unexpected error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    const { name, college, degree, branch, placement_type } = req.body;

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .upsert({
                id: req.user.id,
                email: req.user.email,
                name,
                college,
                degree,
                branch,
                placement_type,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
