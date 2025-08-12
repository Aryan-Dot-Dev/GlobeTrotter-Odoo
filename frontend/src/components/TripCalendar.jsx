import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Activity, Users, Eye, Edit } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';

const TripCalendar = ({ trips = [], onTripClick, onEditTrip, className = "" }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [view, setView] = useState('month'); // 'month' or 'timeline'

    // Get trips for the current month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Organize trips by date
    const tripsByDate = trips.reduce((acc, trip) => {
        if (!trip.start_date || !trip.end_date) return acc;
        
        const startDate = parseISO(trip.start_date);
        const endDate = parseISO(trip.end_date);
        
        // Add trip to each day it spans
        const tripDays = eachDayOfInterval({ start: startDate, end: endDate });
        tripDays.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = [];
            
            // Determine trip phase for this day
            let phase = 'ongoing';
            if (isSameDay(day, startDate)) phase = 'start';
            if (isSameDay(day, endDate)) phase = 'end';
            if (isSameDay(day, startDate) && isSameDay(day, endDate)) phase = 'single';
            
            acc[dateKey].push({ ...trip, phase });
        });
        return acc;
    }, {});

    const getTripsForDate = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return tripsByDate[dateKey] || [];
    };

    const getTripPhaseColor = (phase) => {
        switch (phase) {
            case 'start': return 'bg-green-500';
            case 'end': return 'bg-red-500';
            case 'single': return 'bg-blue-500';
            default: return 'bg-yellow-500';
        }
    };

    const getTripPhaseLabel = (phase) => {
        switch (phase) {
            case 'start': return 'Departure';
            case 'end': return 'Return';
            case 'single': return 'Day Trip';
            default: return 'Traveling';
        }
    };

    const navigateMonth = (direction) => {
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        setSelectedDate(null);
    };

    // Shared Header Component - Always visible
    const SharedHeader = () => (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-t-lg border border-gray-700/50 border-b-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-white">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex space-x-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth('prev')}
                            className="p-2 border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth('next')}
                            className="p-2 border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant={view === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('month')}
                        className={view === 'month' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white'}
                    >
                        Calendar
                    </Button>
                    <Button
                        variant={view === 'timeline' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('timeline')}
                        className={view === 'timeline' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white'}
                    >
                        Timeline
                    </Button>
                </div>
            </div>
        </div>
    );

    const CalendarView = () => (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-b-lg border border-gray-700/50 border-t-0">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-700/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-300 bg-gray-800/30">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {monthDays.map(day => {
                    const dayTrips = getTripsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[120px] p-2 border-r border-b border-gray-700/30 cursor-pointer transition-colors ${
                                !isCurrentMonth ? 'bg-gray-900/50 text-gray-500' : 
                                isSelected ? 'bg-blue-900/30' : 
                                isCurrentDay ? 'bg-yellow-900/30' : 
                                'hover:bg-gray-700/20'
                            }`}
                            onClick={() => setSelectedDate(isSelected ? null : day)}
                        >
                            <div className={`text-sm font-medium mb-2 ${
                                isCurrentDay ? 'text-blue-400' : isCurrentMonth ? 'text-white' : 'text-gray-500'
                            }`}>
                                {format(day, 'd')}
                            </div>
                            
                            <div className="space-y-1">
                                {dayTrips.slice(0, 3).map((trip, index) => (
                                    <div
                                        key={`${trip.id}-${index}`}
                                        className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getTripPhaseColor(trip.phase)}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTripClick?.(trip);
                                        }}
                                        title={`${trip.title} - ${getTripPhaseLabel(trip.phase)}`}
                                    >
                                        {trip.title}
                                    </div>
                                ))}
                                {dayTrips.length > 3 && (
                                    <div className="text-xs text-gray-400">
                                        +{dayTrips.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const TimelineView = () => {
        // Get all trips for current month sorted by start date
        const monthTrips = trips.filter(trip => {
            if (!trip.start_date || !trip.end_date) return false;
            
            const tripStart = parseISO(trip.start_date);
            const tripEnd = parseISO(trip.end_date);
            return (tripStart >= monthStart && tripStart <= monthEnd) ||
                   (tripEnd >= monthStart && tripEnd <= monthEnd) ||
                   (tripStart <= monthStart && tripEnd >= monthEnd);
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-b-lg border border-gray-700/50 border-t-0 p-6">
                <div className="space-y-4">
                    {monthTrips.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No trips scheduled for this month</p>
                        </div>
                    ) : (
                        monthTrips.map((trip) => (
                            <Card key={trip.id} className="bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/40 hover:shadow-lg transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                                <h3 className="text-lg font-semibold text-white">{trip.title}</h3>
                                                <Badge variant="secondary" className="text-xs bg-gray-600/50 text-gray-300 border-gray-500/30">
                                                    {trip.start_date && trip.end_date ? (
                                                        `${format(parseISO(trip.start_date), 'MMM d')} - ${format(parseISO(trip.end_date), 'MMM d')}`
                                                    ) : 'No dates'}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-400 mb-3">{trip.description}</p>
                                            
                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{trip.start_destination || 'Unknown'} → {trip.end_destination || 'Unknown'}</span>
                                                </div>
                                                {trip.stops && trip.stops.length > 0 && (
                                                    <div className="flex items-center space-x-1">
                                                        <Activity className="w-4 h-4" />
                                                        <span>{trip.stops.length} stops</span>
                                                    </div>
                                                )}
                                                {trip.activities && trip.activities.length > 0 && (
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{trip.activities.length} activities</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onTripClick?.(trip)}
                                                className="flex items-center space-x-1 border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEditTrip?.(trip)}
                                                className="flex items-center space-x-1 border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>Edit</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        );
    };

    // Day Detail Panel
    const DayDetailPanel = () => {
        if (!selectedDate) return null;

        const dayTrips = getTripsForDate(selectedDate);

        return (
            <Card className="mt-4 bg-gray-700/30 border-gray-600/50">
                <CardHeader className="border-b border-gray-600/50">
                    <CardTitle className="flex items-center justify-between text-white">
                        <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDate(null)}
                            className="border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                        >
                            Close
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {dayTrips.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No trips scheduled for this day</p>
                    ) : (
                        <div className="space-y-3">
                            {dayTrips.map((trip, index) => (
                                <div key={`${trip.id}-${index}`} className="p-4 border border-gray-600/50 bg-gray-800/30 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="font-semibold text-white">{trip.title}</h4>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`text-white border-none ${getTripPhaseColor(trip.phase)}`}
                                                >
                                                    {getTripPhaseLabel(trip.phase)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{trip.description}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span className="flex items-center space-x-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{trip.start_destination} → {trip.end_destination}</span>
                                                </span>
                                                <span>{format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onTripClick?.(trip)}
                                                className="border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEditTrip?.(trip)}
                                                className="border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className={className}>
            {trips.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">No trips yet</h3>
                    <p className="text-gray-400 mb-6">Start planning your first trip to see it on the calendar!</p>
                    <Button 
                        onClick={() => window.location.href = '/trip-planner'}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Plan Your First Trip
                    </Button>
                </div>
            ) : (
                <>
                    <SharedHeader />
                    {view === 'month' ? <CalendarView /> : <TimelineView />}
                    {view === 'month' && <DayDetailPanel />}
                </>
            )}
        </div>
    );
};

export default TripCalendar;
