import { supabase } from "../config/supabase.js";

// Middleware to check if user has admin role
export const requireAdmin = async (req, res, next) => {
    try {
        const token = req.cookies['sb-access-token'];
        if (!token) {
            return res.status(401).json({ message: 'No access token provided' });
        }

        const { data: user, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user?.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if user has admin role in the users table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching user role:', profileError);
            return res.status(500).json({ message: 'Error verifying user permissions' });
        }

        // Check if user has admin role
        if (!userProfile || userProfile.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.',
                userRole: userProfile?.role || 'user'
            });
        }

        // User is admin, add user info to request and continue
        req.user = user.user;
        req.userProfile = userProfile;
        next();

    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};
