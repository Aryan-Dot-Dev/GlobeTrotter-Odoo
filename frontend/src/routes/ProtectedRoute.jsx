import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Navigate } from "react-router-dom";
import useAuthError from "../hooks/useAuthError";
// import Loading from "@/components/Loading";

const ProtectedRoute = ({children}) => {
    const [auth, setAuth] = useState(null);
    useAuthError(); // Use the auth error hook

    useEffect(() => {
        axios.get('/api/auth/me', { withCredentials: true })
        .then(() => setAuth(true))
        .catch((error) => {
            setAuth(false);
            // If it's a 401, the interceptor will handle the redirect
            if (error.response?.status !== 401) {
                console.error('Auth check failed:', error);
            }
        });
    },  []);

    if (auth === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    if (auth === false) return <Navigate to="/unauthorized" />;
    return children;
}

export default ProtectedRoute;