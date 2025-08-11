import { supabase } from "../config/supabase.js";

const authenticate = async (req, res, next) => {
    const token = req.cookies['sb-access-token'];
    if (!token) return res.status(401).json({ message: "Couldnt find token" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data) return res.status(401).json({ message: "Couldnt find user" });

    req.user = data.user;
    next();
};

export { authenticate };