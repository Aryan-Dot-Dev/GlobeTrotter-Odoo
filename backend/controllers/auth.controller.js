import { supabase } from "../config/supabase.js";

const signup = async (req, res) => {
    const token = req.cookies['sb-access-token'];
    if (token) {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user) return res.status(200).json({ alreadyLoggedIn: true });
    }

    const { name, email, password, location, avatar_url } = req.body;
    if (!name || !email || !password || !location || !avatar) return res.status(400).json({ message: "All fields are required" });

    const { data, error } = await supabase.auth.signUp({
        name, email, password
    });

    if (error) return res.status(401).json({ message: error.message });

    const { data: user, error: userError } = await supabase.from('users')
        .upsert({ id: data.user.id, name: name, email: email, location: location, avatar_url: avatar_url })
        .select();

    if (userError) return res.status(401).json({ message: userError });

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

    res.json({ message: "You are signed up", user: data.user })
}

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

    res.json({ user: data.user })
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

export { signup, login, logout, me };