import { supabase } from '../utils/supabaseClient.js';

export const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ message: 'User registered successfully', user: data.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return res.status(401).json({ error: 'Invalid credentials' });

        // Set session in cookie if needed, but Supabase usually handles this on frontend.
        // If we want the backend to be secure, we can store the access_token.
        res.cookie('token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: data.session.expires_in * 1000
        });

        res.json({ message: 'Logged in successfully', user: data.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    await supabase.auth.signOut();
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.CLIENT_URL}/reset-password`,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { error } = await supabase.auth.updateUser({ password });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username, avatar_url } = req.body;
        const { data, error } = await supabase
            .from('profiles')
            .update({ username, avatar_url, updated_at: new Date() })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: 'Profile updated successfully', profile: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        // Fetch profile data along with auth data
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
            console.error('Error fetching profile:', error);
        }

        res.json({ 
            user: {
                ...req.user,
                profile: profile || null
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
