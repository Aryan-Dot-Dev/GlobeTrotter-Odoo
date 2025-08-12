import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, Loader2, ChevronLeft, ChevronRight, Plus, X, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getUserTripDetails } from '@/api/user.api';

const TripPlannerNew = () => {
  console.log('🎨 TripPlannerNew component is loading (NEW DESIGN)');
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);
  
  // Get edit mode data from location state
  const editTripId = location.state?.editTripId;
  const mode = location.state?.mode;
  const isEditMode = !!editTripId;
  
  console.log('🚀 TripPlannerNew mounted with:', { editTripId, mode, isEditMode, locationState: location.state });

  // Step 1: Basic Trip Info
  const [tripData, setTripData] = useState({
    title: '',
    startDestination: '',
    endDestination: '',
    startDate: '',
    endDate: '',
    budget: ''
  });

  // Step 2: Suggested Places/Stops
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [customPlace, setCustomPlace] = useState('');

  // Step 3: Activities
  const [suggestedActivities, setSuggestedActivities] = useState({});
  const [selectedActivities, setSelectedActivities] = useState({});
  const [customActivity, setCustomActivity] = useState({ place: '', activity: '', description: '', cost: '', duration: '' });

  // Step 4: Schedule
  const [scheduledActivities, setScheduledActivities] = useState([]);
  // const [autoSchedule, setAutoSchedule] = useState(false);

  const steps = [
    { id: 1, title: "Trip Details", description: "Basic information about your trip" },
    { id: 2, title: "Places to Visit", description: "AI-suggested and custom destinations" },
    { id: 3, title: "Activities", description: "Things to do at each place" },
    { id: 4, title: "Schedule", description: "Plan your itinerary" }
  ];

  // Load trip data when in edit mode
  useEffect(() => {
    const loadTripData = async () => {
      if (isEditMode && editTripId) {
        try {
          console.log('🔄 Loading trip data for editing. Trip ID:', editTripId);
          setIsLoadingTrip(true);
          const response = await getUserTripDetails(editTripId);
          console.log('✅ Trip data received:', response);
          const trip = response.trip;
          
          // Pre-fill trip data with existing trip data
          const newTripData = {
            title: trip.title || '',
            startDestination: trip.start_destination || '',
            endDestination: trip.end_destination || '',
            startDate: trip.start_date ? trip.start_date.split('T')[0] : '',
            endDate: trip.end_date ? trip.end_date.split('T')[0] : '',
            budget: trip.budget || ''
          };
          
          console.log('📝 Setting trip data:', newTripData);
          setTripData(newTripData);
          
          // Convert stops to selected places format
          if (trip.stops && trip.stops.length > 0) {
            const places = trip.stops.map(stop => ({
              name: stop.destination,
              description: stop.notes || `Visit ${stop.destination}`,
              startDate: stop.start_date ? stop.start_date.split('T')[0] : '',
              endDate: stop.end_date ? stop.end_date.split('T')[0] : ''
            }));
            setSelectedPlaces(places);
          }
          
          // Convert activities to selected activities format
          if (trip.activities && trip.activities.length > 0) {
            const activitiesByPlace = {};
            trip.activities.forEach(activity => {
              const location = activity.stops?.destination || activity.location || 'General';
              if (!activitiesByPlace[location]) {
                activitiesByPlace[location] = [];
              }
              activitiesByPlace[location].push({
                id: activity.id,
                name: activity.activity,
                description: activity.description || '',
                cost: activity.estimated_cost || 0,
                duration: activity.duration_minutes || 60,
                scheduled_at: activity.scheduled_at || '',
                status: activity.status || 'planned'
              });
            });
            setSelectedActivities(activitiesByPlace);
          }
          
          console.log('✅ Trip data loaded successfully for editing');
        } catch (error) {
          console.error('❌ Error loading trip data:', error);
        } finally {
          setIsLoadingTrip(false);
        }
      }
    };

    loadTripData();
  }, [isEditMode, editTripId]);

  // Step 1: Handle trip data changes
  const handleTripDataChange = (field, value) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  };

  // Step 1: Validate and proceed to places
  const proceedToPlaces = async () => {
    if (!tripData.title || !tripData.endDestination || !tripData.startDate || !tripData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    setAiLoading(true);
    try {
      // Call AI API to get suggested places
      const response = await fetch('http://localhost:3000/api/ai/suggest-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startDestination: tripData.startDestination,
          endDestination: tripData.endDestination,
          duration: Math.ceil((new Date(tripData.endDate) - new Date(tripData.startDate)) / (1000 * 60 * 60 * 24))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedPlaces(data.places || []);
      }
    } catch (error) {
      console.error('Error getting place suggestions:', error);
    } finally {
      setAiLoading(false);
      setCurrentStep(2);
    }
  };

  // Step 2: Toggle place selection
  const togglePlaceSelection = (place) => {
    setSelectedPlaces(prev => {
      const isSelected = prev.find(p => p.name === place.name);
      if (isSelected) {
        return prev.filter(p => p.name !== place.name);
      } else {
        return [...prev, place];
      }
    });
  };

  // Step 2: Add custom place
  const addCustomPlace = () => {
    if (customPlace.trim()) {
      const newPlace = {
        name: customPlace.trim(),
        description: 'Custom destination',
        isCustom: true
      };
      setSelectedPlaces(prev => [...prev, newPlace]);
      setCustomPlace('');
    }
  };

  // Step 2: Proceed to activities
  const proceedToActivities = async () => {
    if (selectedPlaces.length === 0) {
      alert('Please select at least one place to visit');
      return;
    }

    setAiLoading(true);
    try {
      // Get AI suggestions for activities at each place
      const activitiesPromises = selectedPlaces.map(async (place) => {
        const response = await fetch('http://localhost:3000/api/ai/suggest-activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            place: place.name,
            budget: tripData.budget,
            duration: Math.ceil((new Date(tripData.endDate) - new Date(tripData.startDate)) / (1000 * 60 * 60 * 24))
          })
        });

        if (response.ok) {
          const data = await response.json();
          return { place: place.name, activities: data.activities || [] };
        }
        return { place: place.name, activities: [] };
      });

      const allActivities = await Promise.all(activitiesPromises);
      const activitiesMap = {};
      allActivities.forEach(({ place, activities }) => {
        activitiesMap[place] = activities;
      });

      setSuggestedActivities(activitiesMap);
      
      // Initialize selected activities
      const initialSelected = {};
      selectedPlaces.forEach(place => {
        initialSelected[place.name] = [];
      });
      setSelectedActivities(initialSelected);

    } catch (error) {
      console.error('Error getting activity suggestions:', error);
    } finally {
      setAiLoading(false);
      setCurrentStep(3);
    }
  };

  // Step 3: Toggle activity selection
  const toggleActivitySelection = (place, activity) => {
    setSelectedActivities(prev => ({
      ...prev,
      [place]: prev[place].find(a => a.name === activity.name)
        ? prev[place].filter(a => a.name !== activity.name)
        : [...prev[place], activity]
    }));
  };

  // Step 3: Add custom activity
  const addCustomActivity = () => {
    if (customActivity.place && customActivity.activity) {
      const newActivity = {
        name: customActivity.activity,
        description: customActivity.description,
        estimatedCost: parseFloat(customActivity.cost) || 0,
        duration: parseInt(customActivity.duration) || 60,
        isCustom: true
      };

      setSelectedActivities(prev => ({
        ...prev,
        [customActivity.place]: [...(prev[customActivity.place] || []), newActivity]
      }));

      setCustomActivity({ place: '', activity: '', description: '', cost: '', duration: '' });
    }
  };

  // Step 3: Proceed to scheduling
  const proceedToScheduling = () => {
    const totalActivities = Object.values(selectedActivities).flat().length;
    if (totalActivities === 0) {
      alert('Please select at least one activity');
      return;
    }

    // Calculate total activity time
    let totalActivityTime = 0;
    Object.values(selectedActivities).forEach(placeActivities => {
      placeActivities.forEach(activity => {
        totalActivityTime += activity.duration || 60;
      });
    });

    // Calculate available time (trip duration in minutes)
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    const tripDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const availableTime = tripDays * 8 * 60; // Assuming 8 productive hours per day

    // Check if activities exceed available time
    if (totalActivityTime > availableTime) {
      const excessHours = Math.ceil((totalActivityTime - availableTime) / 60);
      const totalHours = Math.ceil(totalActivityTime / 60);
      const availableHours = Math.ceil(availableTime / 60);
      
      const proceed = window.confirm(
        `⚠️ Time Warning!\n\n` +
        `Your selected activities require approximately ${totalHours} hours, ` +
        `but you only have ${availableHours} hours available during your ${tripDays}-day trip.\n\n` +
        `You're exceeding the available time by ${excessHours} hours.\n\n` +
        `Consider removing some activities to fit your schedule better.\n\n` +
        `Do you want to proceed anyway? You can adjust the schedule in the next step.`
      );
      
      if (!proceed) {
        return;
      }
    }

    // Convert selected activities to schedulable format
    const activities = [];
    Object.entries(selectedActivities).forEach(([place, placeActivities]) => {
      placeActivities.forEach(activity => {
        activities.push({
          id: Date.now() + Math.random(),
          place,
          name: activity.name,
          description: activity.description,
          estimatedCost: activity.estimatedCost || 0,
          duration: activity.duration || 60,
          scheduledDate: '',
          scheduledTime: ''
        });
      });
    });

    setScheduledActivities(activities);
    setCurrentStep(4);
  };

  // Step 4: Auto-schedule activities
  const handleAutoSchedule = async () => {
    setAiLoading(true);
    
    console.log('🔍 Auto-schedule Debug Info:');
    console.log('Selected Activities:', selectedActivities);
    console.log('Scheduled Activities:', scheduledActivities);
    console.log('Total activities to schedule:', scheduledActivities.length);
    
    if (scheduledActivities.length === 0) {
      alert('No activities selected for scheduling. Please select some activities first by clicking on them in the previous step.');
      setAiLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          activities: scheduledActivities,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          places: selectedPlaces.map(p => p.name)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const returnedActivities = data.scheduledActivities || [];
        
        console.log('🔍 Frontend Auto-schedule Validation:');
        console.log('- Sent activities:', scheduledActivities.length);
        console.log('- Received activities:', returnedActivities.length);
        console.log('- Original activities:', scheduledActivities.map(a => a.name));
        console.log('- Returned activities:', returnedActivities.map(a => a.name));
        
        // Validate that we got back only our activities
        const validActivities = returnedActivities.filter(returnedActivity => {
          return scheduledActivities.some(originalActivity => 
            originalActivity.name === returnedActivity.name && 
            originalActivity.place === returnedActivity.place
          );
        });
        
        if (validActivities.length !== scheduledActivities.length) {
          console.warn('⚠️ Activity count mismatch! Using filtered activities.');
        }
        
        setScheduledActivities(validActivities.length > 0 ? validActivities : scheduledActivities);
      }
    } catch (error) {
      console.error('Error auto-scheduling:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Step 4: Manual schedule update
  const updateActivitySchedule = (activityId, field, value) => {
    setScheduledActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? { ...activity, [field]: value }
          : activity
      )
    );
  };

  // Final submission
  const submitTrip = async () => {
    setLoading(true);
    try {
      let tripId;
      
      if (isEditMode) {
        // Update existing trip
        console.log('🔄 Updating existing trip:', editTripId);
        const tripResponse = await fetch(`http://localhost:3000/api/trips/${editTripId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: tripData.title,
            description: `Trip from ${tripData.startDestination} to ${tripData.endDestination}`,
            startDate: tripData.startDate,
            endDate: tripData.endDate,
            startDestination: tripData.startDestination,
            endDestination: tripData.endDestination,
            budget: parseFloat(tripData.budget) || 0
          })
        });

        if (!tripResponse.ok) throw new Error('Failed to update trip');
        tripId = editTripId;
        
        // Delete existing stops and activities for fresh update
        await fetch(`http://localhost:3000/api/trips/${tripId}/stops`, {
          method: 'DELETE',
          credentials: 'include'
        });
        await fetch(`http://localhost:3000/api/trips/${tripId}/activities`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        console.log('✅ Trip updated, recreating stops and activities');
      } else {
        // Create new trip
        console.log('🔄 Creating new trip');
        const tripPayload = {
          title: tripData.title,
          description: `Trip from ${tripData.startDestination} to ${tripData.endDestination}`,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          start_destination: tripData.startDestination,
          end_destination: tripData.endDestination,
          budget: parseFloat(tripData.budget) || 0,
          status: 'planned'
        };
        
        console.log('📤 Sending trip payload:', tripPayload);
        
        const tripResponse = await fetch('http://localhost:3000/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(tripPayload)
        });

        if (!tripResponse.ok) {
          const errorData = await tripResponse.text();
          console.error('❌ Trip creation failed:', {
            status: tripResponse.status,
            statusText: tripResponse.statusText,
            error: errorData
          });
          throw new Error(`Failed to create trip: ${tripResponse.status} ${tripResponse.statusText}`);
        }
        
        const trip = await tripResponse.json();
        console.log('📥 Trip creation response:', trip);
        
        // Handle the response structure (trip.trip should be an array from Supabase)
        const newTripData = Array.isArray(trip.trip) ? trip.trip[0] : trip.trip;
        tripId = newTripData.id;
        console.log('✅ New trip created:', tripId);
      }

      // Calculate date ranges for each place based on scheduled activities
      const placeActivities = {};
      scheduledActivities.forEach(activity => {
        if (!placeActivities[activity.place]) {
          placeActivities[activity.place] = [];
        }
        placeActivities[activity.place].push(activity);
      });

      // Create stops with calculated date ranges
      const stopsPromises = selectedPlaces.map(place => {
        const activities = placeActivities[place.name] || [];
        let startDate = null;
        let endDate = null;

        if (activities.length > 0) {
          // Find earliest and latest activity dates for this place
          const dates = activities
            .filter(a => a.scheduledDate)
            .map(a => new Date(a.scheduledDate))
            .sort((a, b) => a - b);

          if (dates.length > 0) {
            startDate = dates[0].toISOString().split('T')[0];
            endDate = dates[dates.length - 1].toISOString().split('T')[0];
          }
        }

        // If no specific dates, use trip dates as fallback
        if (!startDate) startDate = tripData.startDate;
        if (!endDate) endDate = tripData.endDate;

        return fetch('http://localhost:3000/api/stops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tripId,
            destination: place.name,
            startDate,
            endDate,
            notes: place.description || ''
          })
        });
      });

      const stopsResponses = await Promise.all(stopsPromises);
      const stops = await Promise.all(stopsResponses.map(r => r.json()));

      // Create activities
      const activitiesPromises = scheduledActivities.map(activity => {
        const stop = stops.find(s => s.stop.destination === activity.place);
        return fetch('http://localhost:3000/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tripId,
            stopId: stop?.stop?.id,
            activity: activity.name,
            description: activity.description,
            scheduledAt: activity.scheduledDate && activity.scheduledTime 
              ? `${activity.scheduledDate}T${activity.scheduledTime}:00`
              : null,
            durationMinutes: activity.duration,
            estimatedCost: activity.estimatedCost,
            currency: 'INR'
          })
        });
      });

      await Promise.all(activitiesPromises);

      console.log(`✅ ${isEditMode ? 'Trip updated' : 'Trip created'} successfully`);
      
      // Redirect based on mode
      if (isEditMode) {
        // If editing, redirect back to dashboard
        navigate('/dashboard');
      } else {
        // If creating new trip, redirect to trip view
        navigate(`/trip/${tripId}`);
      }

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} trip:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} trip. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Main Layout */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex">
        {/* Left Sidebar - Vertical Journey */}
        <div className="w-80 p-6 border-r border-gray-700">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-gray-800 hover:text-white p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditMode ? 'Edit Your Trip' : 'Plan Your Trip'}
              </h1>
              <p className="text-gray-300 text-sm">
                {isEditMode ? 'Update your journey details' : 'Let\'s create your journey'}
              </p>
            </div>
          </div>
          
          {/* Vertical Progress Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-px h-16 mt-4 ${
                      currentStep > step.id ? 'bg-gray-600' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="w-full">
        {/* Step 1: Trip Details */}
        {currentStep === 1 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MapPin className="w-5 h-5 mr-2" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white">Trip Name *</Label>
                  <Input
                    id="title"
                    value={tripData.title}
                    onChange={(e) => handleTripDataChange('title', e.target.value)}
                    placeholder="e.g., European Adventure"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="budget" className="text-white">Budget (INR)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={tripData.budget}
                    onChange={(e) => handleTripDataChange('budget', e.target.value)}
                    placeholder="2000"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDestination" className="text-white">Start Destination</Label>
                  <Input
                    id="startDestination"
                    value={tripData.startDestination}
                    onChange={(e) => handleTripDataChange('startDestination', e.target.value)}
                    placeholder="e.g., New York"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="endDestination" className="text-white">End Destination *</Label>
                  <Input
                    id="endDestination"
                    value={tripData.endDestination}
                    onChange={(e) => handleTripDataChange('endDestination', e.target.value)}
                    placeholder="e.g., Paris"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-white">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => handleTripDataChange('startDate', e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-white">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => handleTripDataChange('endDate', e.target.value)}
                    min={tripData.startDate}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={proceedToPlaces} disabled={aiLoading} className="bg-gray-700 hover:bg-gray-600 text-white">
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting AI Suggestions...
                    </>
                  ) : (
                    <>
                      Next: Places to Visit
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Places to Visit */}
        {currentStep === 2 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MapPin className="w-5 h-5 mr-2" />
                Places to Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Suggested Places */}
              {suggestedPlaces.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">AI Suggested Places</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedPlaces.map((place, index) => {
                      const isSelected = selectedPlaces.find(p => p.name === place.name);
                      return (
                        <Card
                          key={index}
                          onClick={() => togglePlaceSelection(place)}
                          className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                              : 'bg-slate-800/60 border-slate-600 hover:border-slate-500 hover:bg-slate-700/60'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white pr-2">{place.name}</h4>
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-slate-400 bg-transparent'
                              }`}>
                                {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-300 mb-3 leading-relaxed">{place.description}</p>
                            
                            {!isSelected && (
                              <div className="text-xs text-slate-400 flex items-center">
                                <Plus className="w-3 h-3 mr-1" />
                                Click to add to trip
                              </div>
                            )}
                            
                            {isSelected && (
                              <div className="text-xs text-blue-300 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Added to trip
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Custom Place */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-white">Add Custom Place</h3>
                <div className="flex gap-2">
                  <Input
                    value={customPlace}
                    onChange={(e) => setCustomPlace(e.target.value)}
                    placeholder="Enter a custom destination"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomPlace()}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Button onClick={addCustomPlace} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Selected Places */}
              {selectedPlaces.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-white">Selected Places ({selectedPlaces.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlaces.map((place, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-gray-700 text-white hover:bg-gray-600">
                        {place.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => setSelectedPlaces(prev => prev.filter(p => p.name !== place.name))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-gray-600 text-white hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={proceedToActivities} disabled={aiLoading || selectedPlaces.length === 0} className="bg-gray-700 hover:bg-gray-600 text-white">
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Activities...
                    </>
                  ) : (
                    <>
                      Next: Activities
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Activities */}
        {currentStep === 3 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Calendar className="w-5 h-5 mr-2" />
                Activities
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Click on activities to select them for your trip. Selected activities will be highlighted in blue.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Activities by Place */}
              {selectedPlaces.map((place) => (
                <div key={place.name} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                  <h3 className="text-lg font-semibold mb-3 text-white">{place.name}</h3>
                  
                  {/* AI Suggested Activities */}
                  {suggestedActivities[place.name]?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-3 text-white">Suggested Activities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {suggestedActivities[place.name].map((activity, index) => {
                          const isSelected = selectedActivities[place.name]?.find(a => a.name === activity.name);
                          return (
                            <Card
                              key={index}
                              onClick={() => toggleActivitySelection(place.name, activity)}
                              className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                isSelected
                                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                                  : 'bg-slate-800/60 border-slate-600 hover:border-slate-500 hover:bg-slate-700/60'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h5 className="font-semibold text-sm text-white leading-tight pr-2">
                                    {activity.name}
                                  </h5>
                                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'bg-blue-500 border-blue-500' 
                                      : 'border-slate-400 bg-transparent'
                                  }`}>
                                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-3">
                                    {activity.duration && (
                                      <div className="flex items-center text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>{Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                                      </div>
                                    )}
                                    {activity.estimatedCost && (
                                      <div className="flex items-center text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        <span>${activity.estimatedCost}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {!isSelected && (
                                  <div className="mt-3 text-xs text-slate-400 flex items-center">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Click to add
                                  </div>
                                )}
                                
                                {isSelected && (
                                  <div className="mt-3 text-xs text-blue-300 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Added to trip
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Activities for this place */}
                  {selectedActivities[place.name]?.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white text-sm">Selected Activities ({selectedActivities[place.name].length})</h4>
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>
                              {Math.floor(selectedActivities[place.name].reduce((sum, a) => sum + (a.duration || 60), 0) / 60)}h{' '}
                              {selectedActivities[place.name].reduce((sum, a) => sum + (a.duration || 60), 0) % 60}m
                            </span>
                          </div>
                          <div className="flex items-center text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span>${selectedActivities[place.name].reduce((sum, a) => sum + (a.estimatedCost || 0), 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {selectedActivities[place.name].map((activity, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200 border-blue-500/30 text-xs">
                            {activity.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Custom Activity */}
              <Card className="bg-slate-800/60 border-slate-600">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-white">
                    <Plus className="w-5 h-5 mr-2 text-blue-400" />
                    Add Custom Activity
                  </CardTitle>
                  <p className="text-slate-400 text-sm">Create your own activity for any destination</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm font-medium">Place *</Label>
                      <select
                        value={customActivity.place}
                        onChange={(e) => setCustomActivity(prev => ({ ...prev, place: e.target.value }))}
                        className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <option value="">Choose a destination</option>
                        {selectedPlaces.map(place => (
                          <option key={place.name} value={place.name}>{place.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-white text-sm font-medium">Activity Name *</Label>
                      <Input
                        value={customActivity.activity}
                        onChange={(e) => setCustomActivity(prev => ({ ...prev, activity: e.target.value }))}
                        placeholder="e.g., Visit Local Museum"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm font-medium">Description</Label>
                    <Input
                      value={customActivity.description}
                      onChange={(e) => setCustomActivity(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the activity"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm font-medium">Estimated Cost</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          value={customActivity.cost}
                          onChange={(e) => setCustomActivity(prev => ({ ...prev, cost: e.target.value }))}
                          placeholder="25"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm font-medium">Duration</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          value={customActivity.duration}
                          onChange={(e) => setCustomActivity(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="120"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-10 h-12"
                        />
                        <span className="absolute right-3 top-3.5 text-slate-400 text-sm">minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={addCustomActivity} 
                    disabled={!customActivity.place || !customActivity.activity}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Total Trip Summary */}
              {Object.values(selectedActivities).some(activities => activities.length > 0) && (
                <div className="border-2 border-gray-600 rounded-lg p-4 bg-gray-700/50">
                  <h3 className="text-lg font-semibold mb-3 text-white">Trip Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-300">
                        {Object.values(selectedActivities).flat().length}
                      </div>
                      <div className="text-sm text-gray-400">Total Activities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-300">
                        {Math.floor(Object.values(selectedActivities).flat().reduce((sum, a) => sum + (a.duration || 60), 0) / 60)}h{' '}
                        {Object.values(selectedActivities).flat().reduce((sum, a) => sum + (a.duration || 60), 0) % 60}m
                      </div>
                      <div className="text-sm text-gray-400">Total Time Needed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        ${Object.values(selectedActivities).flat().reduce((sum, a) => sum + (a.estimatedCost || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-400">Estimated Cost</div>
                    </div>
                  </div>
                  
                  {/* Time Warning */}
                  {(() => {
                    const totalTime = Object.values(selectedActivities).flat().reduce((sum, a) => sum + (a.duration || 60), 0);
                    const startDate = new Date(tripData.startDate);
                    const endDate = new Date(tripData.endDate);
                    const tripDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    const availableTime = tripDays * 8 * 60; // 8 productive hours per day
                    
                    if (totalTime > availableTime) {
                      const excessHours = Math.ceil((totalTime - availableTime) / 60);
                      return (
                        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                          <div className="flex items-center text-yellow-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="font-medium">⚠️ Time Warning:</span>
                          </div>
                          <p className="text-sm text-yellow-300 mt-1">
                            Your activities need {Math.ceil(totalTime / 60)} hours, but you only have {Math.ceil(availableTime / 60)} hours 
                            available ({tripDays} days × 8 hours). Consider removing {excessHours} hours worth of activities.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Selection Summary */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-2">Selection Summary</h4>
                <p className="text-gray-300 text-sm">
                  {Object.values(selectedActivities).flat().length} activities selected
                  {Object.values(selectedActivities).flat().length === 0 && (
                    <span className="text-yellow-400 ml-2">⚠️ Please select some activities to continue</span>
                  )}
                </p>
                {Object.entries(selectedActivities).map(([place, activities]) => (
                  activities.length > 0 && (
                    <div key={place} className="text-xs text-gray-400 mt-1">
                      {place}: {activities.length} activity{activities.length !== 1 ? 'ies' : ''}
                    </div>
                  )
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-gray-600 text-white hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={proceedToScheduling} className="bg-gray-700 hover:bg-gray-600 text-white">
                  Next: Schedule ({Object.values(selectedActivities).flat().length} activities)
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Schedule */}
        {currentStep === 4 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="w-5 h-5 mr-2" />
                Schedule Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Activity Schedule</h3>
                <Button onClick={handleAutoSchedule} disabled={aiLoading} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Auto-scheduling...
                    </>
                  ) : (
                    'Auto-schedule with AI'
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {scheduledActivities.map((activity) => (
                  <div key={activity.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-medium text-white">{activity.name}</h4>
                        <p className="text-sm text-gray-300">{activity.place}</p>
                      </div>
                      <div>
                        <Label className="text-white">Date</Label>
                        <Input
                          type="date"
                          value={activity.scheduledDate}
                          onChange={(e) => updateActivitySchedule(activity.id, 'scheduledDate', e.target.value)}
                          min={tripData.startDate}
                          max={tripData.endDate}
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Time</Label>
                        <Input
                          type="time"
                          value={activity.scheduledTime}
                          onChange={(e) => updateActivitySchedule(activity.id, 'scheduledTime', e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>{activity.duration} minutes</p>
                        {activity.estimatedCost > 0 && <p>₹{activity.estimatedCost}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="border-gray-600 text-white hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={submitTrip} disabled={loading} className="bg-gray-700 hover:bg-gray-600 text-white">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? 'Updating Trip...' : 'Creating Trip...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Trip' : 'Create Trip'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerNew;
