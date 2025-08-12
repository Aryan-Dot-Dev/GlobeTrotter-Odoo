import React, { useState, useEffect } from 'react';
import { getUserProfile } from '@/api/user.api';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                const response = await getUserProfile();
                const userRole = response.profile?.role;
                
                if (userRole === 'admin') {
                    setIsAdmin(true);
                } else {
                    setError('Access denied. Admin privileges required.');
                }
            } catch (err) {
                console.error('Error checking admin role:', err);
                setError('Failed to verify admin privileges.');
            } finally {
                setLoading(false);
            }
        };

        checkAdminRole();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (error || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-gray-300 mb-6">
                        {error || 'You need admin privileges to access this page.'}
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
