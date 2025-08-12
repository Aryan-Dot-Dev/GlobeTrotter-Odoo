import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, DollarSign, Eye, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { copyTripToAccount } from '@/api/community.api';

const TripCard = ({ trip }) => {
    const navigate = useNavigate();
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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

    const handleViewTrip = () => {
        navigate(`/community/trip/${trip.id}`);
    };

    const handleCopyTrip = async () => {
        if (copying || copied) return;
        
        setCopying(true);
        try {
            await copyTripToAccount(trip.id);
            setCopied(true);
            
            // Reset the copied state after 3 seconds
            setTimeout(() => {
                setCopied(false);
            }, 3000);
            
        } catch (error) {
            console.error('Error copying trip:', error);
            alert('Failed to copy trip. Please try again.');
        } finally {
            setCopying(false);
        }
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {trip.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {trip.description}
                        </p>
                    </div>
                </div>

                {/* Route */}
                <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-700/50">
                    <MapPin className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                    <div className="text-sm font-medium text-gray-300 truncate">
                        <span className="text-blue-400">{trip.start_destination}</span>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="text-purple-400">{trip.end_destination}</span>
                    </div>
                </div>

                {/* Trip Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 text-green-400" />
                        <span>{trip.tripDuration} days</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                        <span>{trip.totalStops} stops</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-2 text-purple-400" />
                        <span>{trip.totalActivities} activities</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                        <DollarSign className="w-4 h-4 mr-2 text-red-400" />
                        <span>{formatCost(trip.estimatedCost)}</span>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    <span>Created {formatDate(trip.created_at)}</span>
                </div>

                {/* Creator Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {trip.users?.name ? trip.users.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-100">
                                {trip.users?.name || 'Anonymous'}
                            </div>
                            {trip.users?.location && (
                                <div className="text-xs text-gray-400">
                                    {trip.users.location}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleCopyTrip}
                            size="sm"
                            disabled={copying || copied}
                            className={`${
                                copied 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                            } text-white shadow-sm hover:shadow-md transition-all duration-200 flex-1`}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    {copying ? 'Copying...' : 'Copy Trip'}
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleViewTrip}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-sm hover:shadow-md transition-all duration-200 flex-1"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TripCard;
