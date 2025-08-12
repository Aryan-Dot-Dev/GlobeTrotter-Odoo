import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign, User, Activity, Navigation, Copy, Edit, CheckCircle } from "lucide-react";
import { getTripDetails, copyTripToAccount } from '@/api/community.api';
import { getUserTripDetails, getUserProfile } from '@/api/user.api';
import TripBudgetBreakdown from './TripBudgetBreakdown';

const TripDetailView = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copying, setCopying] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Determine which API to use and back navigation based on route and state
    const isCommunityTrip = window.location.pathname.startsWith('/community/trip/');
    const fromDashboard = location.state?.from === 'dashboard';
    
    const handleBackNavigation = () => {
        if (fromDashboard) {
            navigate('/dashboard');
        } else if (isCommunityTrip) {
            navigate('/community');
        } else {
            // For user trips, check if we have history, if not default to profile
            if (window.history.length > 1) {
                navigate(-1); // Go back to previous page
            } else {
                navigate('/profile');
            }
        }
    };

    const handleCopyTrip = async () => {
        try {
            setCopying(true);
            const response = await copyTripToAccount(tripId);
            setCopySuccess(true);
            
            // Show success message for 2 seconds then redirect to edit the copied trip
            setTimeout(() => {
                navigate('/trip-planner', { 
                    state: { 
                        editTripId: response.trip.id,
                        mode: 'edit' 
                    } 
                });
            }, 2000);
        } catch (error) {
            console.error('Error copying trip:', error);
            console.log('Error response:', error.response?.data);
            
            // Handle specific error cases
            if (error.response?.data?.code === 'OWN_TRIP_COPY_ATTEMPT') {
                // User tried to copy their own trip - redirect to edit mode
                console.log('✅ Redirecting to edit mode for own trip');
                console.log('🎯 Redirect data:', { 
                    editTripId: error.response.data.tripId || tripId,
                    mode: 'edit',
                    fullResponse: error.response.data 
                });
                
                navigate('/trip-planner', { 
                    state: { 
                        editTripId: error.response.data.tripId || tripId,
                        mode: 'edit'
                    } 
                });
                return; // Exit early to avoid setting error
            } else {
                // Other errors - you could add error state handling here
                console.error('Copy failed with error:', error.response?.data?.message || error.message);
                setError('Failed to copy trip. Please try again.');
            }
        } finally {
            setCopying(false);
        }
    };

    // Check if current user owns this trip
    const isOwnTrip = currentUser && trip && trip.users?.id === currentUser.id;

    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let response;
                if (isCommunityTrip) {
                    // Use community API for community trips
                    response = await getTripDetails(tripId);
                } else {
                    // Use user API for personal trips
                    response = await getUserTripDetails(tripId);
                }
                
                setTrip(response.trip);

                // Fetch current user profile to check ownership (optional for community trips)
                if (isCommunityTrip) {
                    try {
                        const userProfile = await getUserProfile();
                        setCurrentUser(userProfile.user);
                    } catch {
                        // This is expected for unauthenticated users viewing community trips
                        console.log('User not authenticated (this is normal for public community trips)');
                        setCurrentUser(null);
                    }
                }
            } catch (err) {
                console.error('Error fetching trip details:', err);
                setError('Failed to load trip details. Trip may not exist or may be private.');
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTripDetails();
        }
    }, [tripId, isCommunityTrip]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCost = (cost, currency = 'INR') => {
        if (!cost || cost === 0) return 'Free';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(cost);
    };

    const formatDestination = (destination) => {
        if (!destination) return '';
        return destination
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
                        <div className="h-12 bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-6 bg-gray-700 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-64 bg-gray-700 rounded"></div>
                                <div className="h-64 bg-gray-700 rounded"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-48 bg-gray-700 rounded"></div>
                                <div className="h-32 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
                    <CardContent className="p-8 text-center">
                        <div className="text-red-400 mb-4">
                            <MapPin className="w-16 h-16 mx-auto" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">Trip Not Found</h2>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <Button
                            onClick={handleBackNavigation}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalCost = trip.activities?.reduce((total, activity) => {
        return total + (parseFloat(activity.estimated_cost) || 0);
    }, 0) || 0;

    const tripDuration = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Button
                    onClick={handleBackNavigation}
                    variant="outline"
                    className="mb-8 bg-gray-800/50 border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white hover:bg-gray-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {/* Trip Header Section */}
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 mb-8">
                    <CardContent className="p-8">
                        {/* Trip Title and Description */}
                        <div className="mb-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-5xl font-bold text-gray-100 mb-4">{trip.title}</h1>
                                    <p className="text-xl text-gray-300 leading-relaxed">{trip.description}</p>
                                </div>
                                
                                {/* Copy to Account Button - Only show for community trips that user doesn't own */}
                                {isCommunityTrip && !isOwnTrip && (
                                    <div className="ml-8 flex-shrink-0">
                                        {copySuccess ? (
                                            <Button
                                                disabled
                                                className="bg-green-600 text-white cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Copied! Redirecting...
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleCopyTrip}
                                                disabled={copying}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                            >
                                                {copying ? (
                                                    <>
                                                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                                                        Copying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        Add to My Trips
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Edit Button - Show for user's own trips */}
                                {isCommunityTrip && isOwnTrip && (
                                    <div className="ml-8 flex-shrink-0">
                                        <Button
                                            onClick={() => navigate('/trip-planner', { 
                                                state: { 
                                                    editTripId: tripId,
                                                    mode: 'edit' 
                                                } 
                                            })}
                                            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Trip
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Trip Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Route */}
                            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-6 border border-blue-700/50">
                                <div className="flex items-center mb-3">
                                    <Navigation className="w-6 h-6 text-blue-400 mr-3" />
                                    <h3 className="text-lg font-semibold text-gray-100">Route</h3>
                                </div>
                                <div className="flex items-center justify-center text-base font-medium text-gray-300">
                                    <span className="text-blue-400">{formatDestination(trip.start_destination)}</span>
                                    <span className="mx-3 text-gray-500">→</span>
                                    <span className="text-purple-400">{formatDestination(trip.end_destination)}</span>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-700/50">
                                <div className="flex items-center mb-3">
                                    <Calendar className="w-6 h-6 text-green-400 mr-3" />
                                    <h3 className="text-lg font-semibold text-gray-100">Timeline</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-400">Duration</div>
                                    <div className="text-xl font-bold text-gray-100">{tripDuration} days</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Trip Creator */}
                            <div className="bg-gradient-to-r from-orange-900/40 to-amber-900/40 rounded-xl p-6 border border-orange-700/50">
                                <div className="flex items-center mb-3">
                                    <User className="w-6 h-6 text-orange-400 mr-3" />
                                    <h3 className="text-lg font-semibold text-gray-100">Creator</h3>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white text-lg font-semibold mr-3">
                                        {trip.users?.name ? trip.users.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-100 text-sm">
                                            {trip.users?.name || 'Anonymous User'}
                                        </div>
                                        {trip.users?.location && (
                                            <div className="text-xs text-gray-400 flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {trip.users.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-700/50">
                                <div className="flex items-center mb-3">
                                    <Activity className="w-6 h-6 text-purple-400 mr-3" />
                                    <h3 className="text-lg font-semibold text-gray-100">Overview</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Stops:</span>
                                        <span className="font-medium text-gray-100">{trip.stops?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Activities:</span>
                                        <span className="font-medium text-gray-100">{trip.activities?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Est. Cost:</span>
                                        <span className="font-medium text-green-400">{formatCost(totalCost)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Trip Details */}
                    <div className="space-y-8">
                        {/* Stops */}
                        {trip.stops && trip.stops.length > 0 && (
                            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                                        <MapPin className="w-6 h-6 mr-3 text-orange-400" />
                                        Stops & Destinations
                                    </h2>
                                    <div className="space-y-4">
                                        {trip.stops.map((stop, index) => (
                                            <div key={stop.id} className="flex items-start space-x-4 p-4 bg-gray-700/50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-100 mb-2">{stop.destination}</h3>
                                                    <div className="text-sm text-gray-400 mb-2">
                                                        {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                                                    </div>
                                                    {stop.notes && (
                                                        <p className="text-sm text-gray-400 italic">{stop.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Activities */}
                        {trip.activities && trip.activities.length > 0 && (
                            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                                        <Activity className="w-6 h-6 mr-3 text-purple-400" />
                                        Activities & Experiences
                                    </h2>
                                    <div className="space-y-4">
                                        {trip.activities.map((activity) => (
                                            <div key={activity.id} className="p-4 bg-gray-700/50 rounded-lg">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-100">{activity.activity}</h3>
                                                    {activity.estimated_cost > 0 && (
                                                        <span className="text-sm font-medium text-green-400">
                                                            {formatCost(activity.estimated_cost, activity.currency)}
                                                        </span>
                                                    )}
                                                </div>
                                                {activity.description && (
                                                    <p className="text-sm text-gray-300 mb-3">{activity.description}</p>
                                                )}
                                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                    {activity.stops?.destination && (
                                                        <span className="flex items-center">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            {activity.stops.destination}
                                                        </span>
                                                    )}
                                                    {activity.scheduled_at && (
                                                        <span className="flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {formatDateTime(activity.scheduled_at)}
                                                        </span>
                                                    )}
                                                    {activity.duration_minutes && (
                                                        <span className="flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {activity.duration_minutes} mins
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        activity.status === 'planned' ? 'bg-blue-900/50 text-blue-300' :
                                                        activity.status === 'booked' ? 'bg-green-900/50 text-green-300' :
                                                        activity.status === 'completed' ? 'bg-gray-600/50 text-gray-300' :
                                                        'bg-red-900/50 text-red-300'
                                                    }`}>
                                                        {activity.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Budget Breakdown */}
                    <div className="space-y-6">
                        {/* Budget & Cost Breakdown */}
                        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                            <CardContent className="p-6">
                                <h3 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
                                    <DollarSign className="w-6 h-6 mr-3 text-green-400" />
                                    Budget & Cost Breakdown
                                </h3>
                                <TripBudgetBreakdown 
                                    trip={trip}
                                    activities={trip.activities || []}
                                    stops={trip.stops || []}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDetailView;
