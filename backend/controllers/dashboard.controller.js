import { supabase } from "../config/supabase.js";

const dashboard = async (req, res) => {
    res.status(200).json({message: "You are authenticated"})
}

export { dashboard };