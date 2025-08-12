import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Users, BarChart3 } from "lucide-react";
import { getUserProfile } from '@/api/user.api';
import { logout } from '@/api/logout.api';

const UserNav = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserProfile();
                setUser(response.profile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/community')}
                    className="flex items-center space-x-2 text-white hover:bg-white/20 transition-all duration-200"
                >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Community</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/analytics')}
                    className="flex items-center space-x-2 text-white hover:bg-white/20 transition-all duration-200"
                >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Analytics</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 text-white hover:bg-white/20 transition-all duration-200"
                >
                    <Avatar className="w-8 h-8 ring-2 ring-white/30 ring-offset-1 ring-offset-transparent">
                        <AvatarImage src={user?.avatar_url} alt={user?.name || 'User'} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline font-medium">{user?.name || 'Profile'}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/settings')}
                    className="flex items-center space-x-2 text-white hover:bg-white/20 transition-all duration-200"
                >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Settings</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Logout</span>
                </Button>
            </div>
        </div>
    );
};

export default UserNav;
