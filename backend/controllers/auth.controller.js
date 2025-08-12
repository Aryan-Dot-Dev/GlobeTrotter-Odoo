import { supabase } from "../config/supabase.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Helper function to upload image to Supabase storage
const uploadImageToSupabase = async (file, userId) => {
    try {
        const fileExt = path.extname(file.originalname);
        const fileName = `${userId}-${Date.now()}${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Try to create bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets.some(bucket => bucket.name === 'user-avatars');
        
        if (!bucketExists) {
            const { error: bucketError } = await supabase.storage.createBucket('user-avatars', {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                fileSizeLimit: 5242880 // 5MB
            });
            
            if (bucketError) {
                console.error('Error creating bucket:', bucketError);
            }
        }

        const { data, error } = await supabase.storage
            .from('user-avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            console.error('Supabase storage error:', error);
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('user-avatars')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

const signup = async (req, res) => {
    const token = req.cookies['sb-access-token'];
    if (token) {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user) return res.status(200).json({ alreadyLoggedIn: true });
    }

    const { name, username, email, password, location } = req.body;
    const avatarFile = req.file;
    
    console.log('Signup data:', { name, email, password, location, username, hasAvatar: !!avatarFile });
    
    if (!name || !email || !password || !location || !username) {
        return res.status(400).json({ message: "Name, email, password, location, and username are required" });
    }

    try {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email, 
            password
        });

        console.log('Supabase auth signup result:', data);
        if (error) return res.status(401).json({ message: error.message });

        let avatar_url = null;

        // Upload avatar if provided
        if (avatarFile) {
            try {
                avatar_url = await uploadImageToSupabase(avatarFile, data.user.id);
                console.log('Avatar uploaded successfully:', avatar_url);
            } catch (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                // Continue without avatar if upload fails
            }
        }

        // Create user profile in database
        const { data: user, error: userError } = await supabase.from('users')
            .upsert({ 
                id: data.user.id, 
                name: name, 
                email: email, 
                location: location, 
                avatar_url: avatar_url, 
                username: username 
            })
            .select();

        if (userError) return res.status(401).json({ message: userError.message });

        res.cookie('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000
        })

        res.cookie('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({ message: true, user: data.user, profile: user[0] });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// New endpoint for uploading avatar separately
const uploadAvatar = async (req, res) => {
    const token = req.cookies['sb-access-token'];
    if (!token) return res.status(401).json({ message: "Authentication required" });

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData) return res.status(401).json({ message: "Invalid token" });

    const avatarFile = req.file;
    if (!avatarFile) return res.status(400).json({ message: "No file provided" });

    try {
        const avatar_url = await uploadImageToSupabase(avatarFile, userData.user.id);

        // Update user profile with new avatar URL
        const { data: user, error: updateError } = await supabase.from('users')
            .update({ avatar_url: avatar_url })
            .eq('id', userData.user.id)
            .select();

        if (updateError) return res.status(500).json({ message: updateError.message });

        res.json({ message: 'Avatar uploaded successfully', avatar_url: avatar_url, user: user[0] });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: error.message });

    res.cookie('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000
    })

    res.cookie('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ message: true, user: data.user })
}

const logout = async (req, res) => {
    res.clearCookie('sb-access-token');
    res.clearCookie('sb-refresh-token');
    res.sendStatus(204);
}

const me = async (req, res) => {
    const token = req.cookies['sb-access-token'];
    if (!token) return res.status(401).json({ message: "Couldnt find token" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data) return res.status(401).json({ message: "Couldnt find user" });
    
    const { data: user, error: userError } = await supabase.from('users').select('*, id').eq('id', data.user.id).single();
    if (userError) return res.status(401).json({ message: userError });

    res.status(200).json({ user: user })
}

export { signup, login, logout, me, upload, uploadAvatar };