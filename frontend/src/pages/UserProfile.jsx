import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Calendar, Activity, Settings, Plus, ArrowLeft, Trash2, Upload, Camera } from "lucide-react";
import TripCalendar from '@/components/TripCalendar';
import { getUserTrips, getUserProfile } from '@/api/user.api';
import { deleteTrip } from '@/api/deleteTrip.api';
import { uploadProfileImage } from '@/api/uploadImage.api';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        avatar_url: null,
        location: "",
        created_at: "",
        username: ""
    });
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingTripId, setDeletingTripId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch user profile and trips in parallel
                const [tripsResponse, profileResponse] = await Promise.all([
                    getUserTrips({ limit: 100 }),
                    getUserProfile()
                ]);
                
                console.log('✅ User data fetched:', { 
                    trips: tripsResponse.trips?.length || 0, 
                    profile: profileResponse.profile?.name || 'Unknown' 
                });
                
                setTrips(tripsResponse.trips || []);
                setUser(profileResponse.profile || {
                    name: "User",
                    email: "",
                    avatar_url: null,
                    location: "",
                    created_at: new Date().toISOString(),
                    username: ""
                });
                
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user data. Please try again later.');
                
                // Set default user data on error
                setUser({
                    name: "User",
                    email: "",
                    avatar_url: null,
                    location: "",
                    created_at: new Date().toISOString(),
                    username: ""
                });
                setTrips([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleTripClick = (trip) => {
        navigate(`/trip/${trip.id}`);
    };

    const handleEditTrip = (trip) => {
        navigate(`/trip-planner?edit=${trip.id}`);
    };

    const handleDeleteTrip = async (tripId) => {
        try {
            setDeletingTripId(tripId);
            await deleteTrip(tripId);
            
            // Remove the deleted trip from the local state
            setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
            setShowDeleteConfirm(null);
            
            console.log('✅ Trip deleted successfully');
        } catch (error) {
            console.error('Error deleting trip:', error);
            setError('Failed to delete trip. Please try again.');
        } finally {
            setDeletingTripId(null);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        try {
            setUploadingAvatar(true);
            setError(null);
            
            const response = await uploadProfileImage(file);
            
            if (response.avatar_url) {
                setUser(prevUser => ({
                    ...prevUser,
                    avatar_url: response.avatar_url
                }));
                console.log('✅ Avatar updated successfully');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setError('Failed to upload avatar. Please try again.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const confirmDelete = (trip) => {
        setShowDeleteConfirm(trip);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    const calculateTripStats = () => {
        const totalTrips = trips.length;
        const totalDestinations = trips.reduce((acc, trip) => acc + (trip.stops?.length || 0), 0);
        const totalActivities = trips.reduce((acc, trip) => acc + (trip.activities?.length || 0), 0);
        const totalCost = trips.reduce((acc, trip) => 
            acc + (trip.activities?.reduce((sum, activity) => sum + (activity.estimated_cost || 0), 0) || 0), 0
        );

        return { totalTrips, totalDestinations, totalActivities, totalCost };
    };

    const stats = calculateTripStats();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden">
            {/* Banner Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: "url('/banner.jpg')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
            
            {/* Simple Header */}
            <div className="relative z-10 border-b border-gray-700">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">GlobeTrotter</h1>
                </div>
            </div>

            <div className="relative z-10 max-w-full mx-auto px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="text-white hover:text-white hover:bg-gray-800 p-2"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                {/* Top Section: User Details (Left) + Calendar (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column: User Details */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                            <CardContent className="p-6">
                                {/* Avatar and Name */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block group">
                                        <Avatar className="w-32 h-32 mx-auto mb-4 ring-4 ring-gray-600 ring-offset-4 ring-offset-gray-800 shadow-lg group-hover:ring-blue-500 transition-all duration-200">
                                            <AvatarImage src={user.avatar_url} alt={user.name} className="object-cover" />
                                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Upload button */}
                                        <div className="absolute -bottom-2 right-1/2 transform translate-x-1/2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                id="avatar-upload"
                                                disabled={uploadingAvatar}
                                            />
                                            <label
                                                htmlFor="avatar-upload"
                                                className={`inline-flex items-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg transition-all duration-200 text-sm font-medium border-2 border-gray-800 ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}`}
                                            >
                                                {uploadingAvatar ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Camera className="w-4 h-4 mr-2" />
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                                    <p className="text-gray-300 mb-3">{user.username || '@traveler'}</p>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Travel enthusiast exploring the world one trip at a time. 
                                        Always planning the next adventure! ✈️🌍
                                    </p>
                                </div>

                                {/* User Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-300">
                                        <User className="w-4 h-4 mr-3 text-gray-500" />
                                        <span className="text-sm">{user.email || 'No email set'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                                        <span className="text-sm">{user.location || 'Location not set'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                                        <span className="text-sm">
                                            Joined {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                                month: 'long', 
                                                year: 'numeric' 
                                            }) : 'Recently'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
                                        <div className="text-xl font-bold text-white">{stats.totalTrips}</div>
                                        <div className="text-xs text-gray-400">Trips</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
                                        <div className="text-xl font-bold text-white">{stats.totalDestinations}</div>
                                        <div className="text-xs text-gray-400">Places</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
                                        <div className="text-xl font-bold text-white">{stats.totalActivities}</div>
                                        <div className="text-xs text-gray-400">Activities</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600/30">
                                        <div className="text-xl font-bold text-white">${stats.totalCost}</div>
                                        <div className="text-xs text-gray-400">Spent</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                    <Button variant="outline" className="w-full border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white">
                                        <Activity className="w-4 h-4 mr-2" />
                                        View Statistics
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Calendar */}
                    <div className="lg:col-span-2">
                        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                            <CardHeader className="border-b border-gray-700/50 bg-gray-800/30">
                                <CardTitle className="flex items-center space-x-2 text-white">
                                    <Calendar className="w-5 h-5" />
                                    <span>Trip Calendar</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {error ? (
                                    <div className="text-center py-8 text-red-400">
                                        <p>{error}</p>
                                    </div>
                                ) : trips.length > 0 ? (
                                    <TripCalendar
                                        trips={trips}
                                        onTripClick={handleTripClick}
                                        onEditTrip={handleEditTrip}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                                        <h3 className="text-lg font-medium text-white mb-2">No trips planned yet</h3>
                                        <p className="text-gray-400 mb-4">Start planning your first adventure!</p>
                                        <Button 
                                            onClick={() => navigate('/trip-planner')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Plan Your First Trip
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section: All Trips */}
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                    <CardHeader className="border-b border-gray-700/50 bg-gray-800/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2 text-white">
                                <MapPin className="w-5 h-5" />
                                <span>All Trips ({trips.length})</span>
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/trip-planner')}
                                className="border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Trip
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {trips.length > 0 ? (
                            <div className="space-y-4">
                                {trips.map(trip => (
                                    <div 
                                        key={trip.id} 
                                        className="group border border-gray-700/50 bg-gray-700/20 rounded-lg p-4 hover:border-gray-600 hover:bg-gray-700/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                        onClick={() => handleTripClick(trip)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                        {trip.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        trip.status === 'completed' ? 'bg-green-900/50 border border-green-500/30 text-green-300' :
                                                        trip.status === 'active' ? 'bg-blue-900/50 border border-blue-500/30 text-blue-300' :
                                                        'bg-gray-700/50 border border-gray-500/30 text-gray-300'
                                                    }`}>
                                                        {trip.status || 'draft'}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-400 mb-3 text-sm">
                                                    {trip.description || 'No description available'}
                                                </p>
                                                
                                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{trip.start_destination || 'TBD'} → {trip.end_destination || 'TBD'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                                                            {trip.start_date && trip.end_date ? (
                                                                `${new Date(trip.start_date).toLocaleDateString('en-US', { 
                                                                    month: 'short', 
                                                                    day: 'numeric' 
                                                                })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { 
                                                                    month: 'short', 
                                                                    day: 'numeric',
                                                                    year: 'numeric' 
                                                                })}`
                                                            ) : 'Dates TBD'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Activity className="w-3 h-3" />
                                                        <span>{trip.stops?.length || 0} stops, {trip.activities?.length || 0} activities</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditTrip(trip);
                                                    }}
                                                    className="border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(trip);
                                                    }}
                                                    className="border-red-500/50 bg-red-900/20 text-red-400 hover:bg-red-800/30 hover:border-red-400"
                                                    disabled={deletingTripId === trip.id}
                                                >
                                                    {deletingTripId === trip.id ? (
                                                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTripClick(trip);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MapPin className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No trips created yet</h3>
                                <p className="text-gray-400 mb-4">Start your travel journey by planning your first trip!</p>
                                <Button 
                                    onClick={() => navigate('/trip-planner')}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Trip
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-900/50 border border-red-500/30 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Delete Trip</h3>
                                <p className="text-sm text-gray-400">This action cannot be undone.</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete "<strong className="text-white">{showDeleteConfirm.title}</strong>"? 
                            This will permanently remove the trip and all its stops and activities.
                        </p>
                        
                        <div className="flex space-x-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={cancelDelete}
                                disabled={deletingTripId === showDeleteConfirm.id}
                                className="border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleDeleteTrip(showDeleteConfirm.id)}
                                disabled={deletingTripId === showDeleteConfirm.id}
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {deletingTripId === showDeleteConfirm.id ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Trip
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
