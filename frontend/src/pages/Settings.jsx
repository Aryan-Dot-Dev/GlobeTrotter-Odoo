import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, MapPin, Upload, X, Save, AlertCircle, CheckCircle, Camera } from "lucide-react";
import { getUserProfile, updateUserProfile } from '@/api/user.api';

const Settings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        username: '',
        email: '',
        location: '',
        avatar_url: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            setProfile(response.profile || {});
            setAvatarPreview(response.profile?.avatar_url || null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Please select an image file' });
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size must be less than 5MB' });
                return;
            }

            setAvatarFile(file);
            
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
            setAvatarPreview(previewUrl);
            setMessage({ type: '', text: '' });
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(null);
        setProfile(prev => ({ ...prev, avatar_url: '' }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            // Validate required fields
            if (!profile.name || !profile.username) {
                setMessage({ type: 'error', text: 'Name and username are required' });
                return;
            }

            // Prepare update data
            const updateData = {
                name: profile.name.trim(),
                username: profile.username.trim(),
                location: profile.location?.trim() || '',
            };

            // Handle avatar update
            if (avatarFile) {
                // For now, we'll just use a placeholder URL
                // In a real app, you'd upload to cloud storage first
                updateData.avatar_url = avatarPreview;
            } else if (profile.avatar_url !== undefined) {
                updateData.avatar_url = profile.avatar_url;
            }

            const response = await updateUserProfile(updateData);
            
            setProfile(response.profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);

        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mr-4 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center ${
                        message.type === 'error' 
                            ? 'bg-red-900/50 border border-red-700 text-red-300' 
                            : 'bg-green-900/50 border border-green-700 text-green-300'
                    }`}>
                        {message.type === 'error' ? (
                            <AlertCircle className="w-5 h-5 mr-2" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        {message.text}
                    </div>
                )}

                {/* Profile Settings Card */}
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                {avatarPreview ? (
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700">
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={removeAvatar}
                                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 transition-colors"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-gray-300 block mb-2">Profile Picture</Label>
                                <Label htmlFor="avatar-upload" className="cursor-pointer">
                                    <div className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm transition-colors">
                                        <Camera className="w-4 h-4" />
                                        <span>Change Avatar</span>
                                    </div>
                                </Label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Name Field */}
                        <div>
                            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={profile.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                            />
                        </div>

                        {/* Username Field */}
                        <div>
                            <Label htmlFor="username" className="text-gray-300">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={profile.username || ''}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                placeholder="Enter your username"
                                className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                            />
                        </div>

                        {/* Email Field (Read-only) */}
                        <div>
                            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email || ''}
                                    readOnly
                                    placeholder="Email address"
                                    className="mt-1 pl-10 bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Location Field */}
                        <div>
                            <Label htmlFor="location" className="text-gray-300">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="location"
                                    type="text"
                                    value={profile.location || ''}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    placeholder="Enter your location"
                                    className="mt-1 pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
