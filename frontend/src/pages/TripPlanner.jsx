import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, MapPin, Calendar, Activity, Eye, Loader2, Clock, DollarSign, Users, Car, Plane, Train, Bus, Star, Info, Plus, ArrowLeft } from "lucide-react"
import CreateTripForm from '@/components/CreateTripForm'
import ItenaryForm from '@/components/ItenaryForm'
import AddActivitiesForm from '@/components/AddActivitiesForm'
import ReviewTripForm from '@/components/ReviewTripForm'
import UserNav from '@/components/UserNav'
import { addTrip } from '@/api'
import addStops from '@/api/addStops.api'
import addActivities from '@/api/addActivities.api'
import { getUserTripDetails } from '@/api/user.api'
import { getSuggestedStops } from '@/utils/getSuggestedStops'

const TripPlanner = () => {
    console.log('🎨 TripPlanner component is loading (OLD DESIGN)');
    const navigate = useNavigate()
    const location = useLocation()
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingTrip, setIsLoadingTrip] = useState(false)
    const [suggestedStops, setSuggestedStops] = useState(null)
    const [suggestionsImported, setSuggestionsImported] = useState(false)
    
    // Get edit mode data from location state
    const editTripId = location.state?.editTripId
    const mode = location.state?.mode
    const isEditMode = !!editTripId
    
    console.log('🚀 TripPlanner mounted with:', { editTripId, mode, isEditMode, locationState: location.state });
    const [formData, setFormData] = useState({
        // Trip table fields
        title: '',
        description: '',
        start: '',  // Start destination
        end: '',    // End destination
        start_date: '',
        end_date: '',
        status: 'published',
        public_slug: '',

        // Trip members array (for trip_members table)
        members: [],

        // Stops array (for stops table)
        stops: [],

        // Activities array (for activities table)
        activities: []
    })

    const updateFormData = (field, value) => {
        // If updating activities, clean up any old activities with stop_id but no location
        if (field === 'activities') {
            value = value.map(activity => {
                // If activity has stop_id but no location, try to find the location
                if (activity.stop_id && !activity.location) {
                    const stop = formData.stops.find(s => s.id === parseInt(activity.stop_id));
                    // Create new activity without stop_id
                    return {
                        activity: activity.activity,
                        location: stop ? stop.destination : 'Unknown Location',
                        description: activity.description,
                        scheduled_at: activity.scheduled_at,
                        duration_minutes: activity.duration_minutes,
                        estimated_cost: activity.estimated_cost,
                        currency: activity.currency,
                        status: activity.status,
                        id: activity.id
                    };
                }
                // If activity already has location, keep it as is
                return activity;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Load trip data when in edit mode
    useEffect(() => {
        const loadTripData = async () => {
            if (isEditMode && editTripId) {
                try {
                    console.log('🔄 Loading trip data for editing. Trip ID:', editTripId)
                    setIsLoadingTrip(true)
                    const response = await getUserTripDetails(editTripId)
                    console.log('✅ Trip data received:', response)
                    const trip = response.trip
                    
                    // Pre-fill form data with existing trip data
                    const newFormData = {
                        title: trip.title || '',
                        description: trip.description || '',
                        start: trip.start_destination || '',
                        end: trip.end_destination || '',
                        start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
                        end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
                        status: trip.status || 'published',
                        public_slug: trip.public_slug || '',
                        members: trip.trip_members || [],
                        stops: trip.stops?.map(stop => ({
                            id: stop.id,
                            destination: stop.destination,
                            start_date: stop.start_date ? stop.start_date.split('T')[0] : '',
                            end_date: stop.end_date ? stop.end_date.split('T')[0] : '',
                            notes: stop.notes || ''
                        })) || [],
                        activities: trip.activities?.map(activity => ({
                            id: activity.id,
                            activity: activity.activity,
                            location: activity.stops?.destination || activity.location || 'General',
                            description: activity.description || '',
                            scheduled_at: activity.scheduled_at || '',
                            duration_minutes: activity.duration_minutes || 60,
                            estimated_cost: activity.estimated_cost || 0,
                            currency: activity.currency || 'INR',
                            status: activity.status || 'planned'
                        })) || []
                    }
                    
                    console.log('📝 Setting form data:', newFormData)
                    setFormData(newFormData)
                    
                    console.log('✅ Trip data loaded successfully for editing')
                } catch (error) {
                    console.error('❌ Error loading trip data:', error)
                } finally {
                    setIsLoadingTrip(false)
                }
            }
        }

        loadTripData()
    }, [isEditMode, editTripId])

    const nextStep = async () => {
        if (currentStep < 4) {
            // If moving from Trip Details (step 1) to Plan Stops (step 2), get suggested stops
            if (currentStep === 1 && formData.start && formData.end) {
                setIsLoadingSuggestions(true)
                
                try {
                    // Calculate duration from start and end dates
                    let duration = '3-5 days'
                    if (formData.start_date && formData.end_date) {
                        const startDate = new Date(formData.start_date)
                        const endDate = new Date(formData.end_date)
                        const diffTime = Math.abs(endDate - startDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        duration = `${diffDays} days`
                    }

                    console.log('Getting suggestions for:', formData.start, 'to', formData.end, 'for', duration)
                    const suggestions = await getSuggestedStops(formData.start, formData.end, duration)
                    setSuggestedStops(suggestions)
                    console.log('Suggested stops received:', suggestions)
                } catch (error) {
                    console.error('Error getting suggested stops:', error)
                } finally {
                    setIsLoadingSuggestions(false)
                }
            }
            
            setCurrentStep(currentStep + 1)
        }
    }

    // Function to convert AI suggestions to database format
    const convertSuggestionsToFormData = () => {
        if (!suggestedStops?.success || !suggestedStops?.data?.suggested_stops) {
            alert('No suggestions available to import!');
            return;
        }

        const aiData = suggestedStops.data;
        
        // Convert suggested stops to stops format (without ID - will come from DB)
        const convertedStops = aiData.suggested_stops.map((stop, index) => {
            // Calculate dates based on trip duration and stop index
            let stopStartDate = formData.start_date;
            let stopEndDate = formData.end_date;
            
            if (formData.start_date && formData.end_date) {
                const totalDays = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
                const daysPerStop = Math.floor(totalDays / aiData.suggested_stops.length);
                const startDayOffset = index * daysPerStop;
                const endDayOffset = (index + 1) * daysPerStop;
                
                const tripStart = new Date(formData.start_date);
                stopStartDate = new Date(tripStart.getTime() + startDayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                stopEndDate = new Date(tripStart.getTime() + endDayOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }

            return {
                id: `stop_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID for frontend
                destination: stop.place_name,
                start_date: stopStartDate,
                end_date: stopEndDate,
                notes: `${stop.description}\n\nDistance: ${stop.distance_from_start}\nRecommended Duration: ${stop.recommended_duration}\nAccommodation: ₹${stop.accommodation_cost_per_night_inr}/night\nFood: ₹${stop.food_cost_per_day_inr}/day`
            };
        });

        // Convert activities from all stops (without stop_id - will be mapped later)
        const convertedActivities = [];
        aiData.suggested_stops.forEach((stop, stopIndex) => {
            if (stop.activities) {
                stop.activities.forEach((activity, actIndex) => {
                    // Calculate activity date/time within the stop's duration
                    let activityDateTime = formData.start_date ? `${formData.start_date}T10:00` : '';
                    
                    if (formData.start_date) {
                        const totalDays = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
                        const daysPerStop = Math.floor(totalDays / aiData.suggested_stops.length);
                        const activityDay = (stopIndex * daysPerStop) + Math.floor(actIndex / 2); // Spread activities across stop duration
                        const activityHour = 9 + (actIndex * 3); // Space activities 3 hours apart
                        
                        const tripStart = new Date(formData.start_date);
                        const activityDate = new Date(tripStart.getTime() + activityDay * 24 * 60 * 60 * 1000);
                        activityDateTime = `${activityDate.toISOString().split('T')[0]}T${activityHour.toString().padStart(2, '0')}:00`;
                    }

                    convertedActivities.push({
                        id: `activity_${Date.now()}_${stopIndex}_${actIndex}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID for frontend
                        activity: activity.activity_name,
                        location: stop.place_name, // Will be used to match with stop_id later
                        description: activity.description,
                        scheduled_at: activityDateTime,
                        duration_minutes: activity.duration ? parseInt(activity.duration.replace(/\D/g, '')) * 60 : 120, // Convert hours to minutes
                        estimated_cost: activity.estimated_cost_inr || 0,
                        currency: 'INR',
                        status: 'planned'
                        // stop_id will be added after stops are saved to database
                    });
                });
            }
        });

        // Update form data with converted suggestions
        updateFormData('stops', [...formData.stops, ...convertedStops]);
        updateFormData('activities', [...formData.activities, ...convertedActivities]);
        setSuggestionsImported(true);
        
        console.log('Converted stops (no IDs yet):', convertedStops);
        console.log('Converted activities (no stop_id yet):', convertedActivities);
        
        // Show success message
        alert(`Successfully imported ${convertedStops.length} stops and ${convertedActivities.length} activities to your trip!`);
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await addTrip(
                formData.title,
                formData.description,
                formData.start,
                formData.end,
                formData.start_date,
                formData.end_date,
                formData.status,
                formData.public_slug
            );

            const tripId = response.trip[0].id;
            console.log('Trip created with ID:', tripId);

            // Add stops first - this will return stop IDs from database
            const stopsResponse = await addStops(tripId, formData.stops);
            console.log('Stops added successfully:', stopsResponse);

            if (formData.activities.length > 0) {
                // Map activities to use the correct stop_id from the database
                const activitiesWithStopIds = formData.activities.map(activity => {
                    console.log('Processing activity:', activity);

                    // Find the corresponding database stop by matching activity.location with stop.destination
                    const dbStop = stopsResponse.stops.find(stop =>
                        stop.destination.toLowerCase() === activity.location.toLowerCase() &&
                        stop.trip_id === tripId
                    );

                    console.log('Matching activity location:', activity.location, 'with DB stop destination:', dbStop?.destination, 'DB stop ID:', dbStop?.id);

                    if (!dbStop) {
                        console.warn('No matching stop found for activity location:', activity.location);
                    }

                    return {
                        activity: activity.activity,
                        description: activity.description,
                        scheduled_at: activity.scheduled_at,
                        duration_minutes: activity.duration_minutes,
                        estimated_cost: activity.estimated_cost,
                        currency: activity.currency,
                        status: activity.status,
                        stop_id: dbStop?.id // Use the actual database stop ID
                    };
                });

                // Filter out activities that couldn't be matched to a stop
                const validActivities = activitiesWithStopIds.filter(activity => activity.stop_id);

                if (validActivities.length > 0) {
                    console.log('Adding activities with proper stop_ids:', validActivities);
                    const activitiesResponse = await addActivities(tripId, validActivities);
                    console.log('Activities added:', activitiesResponse);
                } else {
                    console.warn('No valid activities to add - all activities failed stop matching');
                }
            }

            console.log('Trip created successfully:', response);
            
            // Show success message with redirect countdown
            alert('🎉 Trip created successfully! Redirecting to dashboard...');
            
            // Redirect to dashboard after successful trip creation
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500); // Small delay to allow user to see the success message
        } catch (error) {
            console.error('Error adding trip:', error);
            alert('❌ Failed to create trip. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const steps = [
        {
            id: 1,
            title: "Trip Details",
            subtitle: "Basic information & members",
            icon: MapPin,
            color: "from-blue-500 to-cyan-500"
        },
        {
            id: 2,
            title: "Plan Stops",
            subtitle: "Add destinations & dates",
            icon: Calendar,
            color: "from-purple-500 to-pink-500"
        },
        {
            id: 3,
            title: "Activities",
            subtitle: "Schedule your experiences",
            icon: Activity,
            color: "from-green-500 to-teal-500"
        },
        {
            id: 4,
            title: "Review",
            subtitle: "Finalize your trip",
            icon: Eye,
            color: "from-orange-500 to-red-500"
        }
    ]

    const getCurrentStep = () => steps.find(step => step.id === currentStep)

    return (
        <div className="relative min-h-screen w-full">
            {/* Loading overlay for edit mode */}
            {isLoadingTrip && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="text-lg font-medium">Loading trip data...</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Background Banner */}
            <img
                src="/banner.jpg"
                alt=""
                className="absolute inset-0 w-full h-96 object-cover z-0"
                style={{ objectPosition: 'center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-5 h-96" />
            
            <div className="relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center px-6 py-4 bg-black/35 rounded-b-2xl backdrop-blur-sm border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="text-white hover:bg-white/20 p-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-white text-2xl font-bold drop-shadow-lg">GlobeTrotter</h1>
                    </div>
                    <div className='flex gap-4 items-center'>
                        <UserNav />
                    </div>
                </header>

                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center px-6 pt-8 pb-20">
                    <div className="text-center mb-6">
                        <h2 className="text-white text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                            {isEditMode ? 'Edit Your Trip' : 'Plan Your Perfect Trip'}
                        </h2>
                        <p className="text-white/90 text-lg md:text-xl drop-shadow-md">
                            {isEditMode ? 'Modify your itinerary and make it even better' : 'Create amazing memories with our step-by-step planner'}
                        </p>
                        {isEditMode && (
                            <div className="mt-4 bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-400/30">
                                <p className="text-blue-100 text-sm">
                                    ✨ Editing trip: <span className="font-semibold">{formData.title || 'Untitled Trip'}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Steps Progress */}
                    <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
                        <div className="flex justify-between items-center">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1">
                                        <div 
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                                isActive 
                                                    ? 'bg-gray-800 text-white shadow-lg scale-110' 
                                                    : isCompleted 
                                                        ? 'bg-green-500 text-white shadow-md'
                                                        : 'bg-white/80 text-gray-600 hover:bg-white'
                                            }`}
                                            onClick={() => setCurrentStep(step.id)}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <span className={`text-sm mt-2 font-medium ${
                                            isActive || isCompleted ? 'text-white' : 'text-white/80'
                                        }`}>
                                            {step.title}
                                        </span>
                                        {index < steps.length - 1 && (
                                            <div className={`hidden md:block absolute h-0.5 w-16 mt-6 ml-16 ${
                                                isCompleted ? 'bg-green-400' : 'bg-white/40'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-white/80 mb-2">
                                <span>Progress</span>
                                <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-gray-800 to-gray-600 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-t-3xl shadow-xl relative z-10 -mt-8">
                    <div className="container mx-auto px-6 py-8">
                        {/* Current Step Header */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-3 mb-4">
                                {React.createElement(getCurrentStep().icon, {
                                    className: `w-8 h-8 text-gray-800`
                                })}
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {getCurrentStep().title}
                                    </h2>
                                    <p className="text-gray-600 mt-1">{getCurrentStep().subtitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="max-w-4xl mx-auto">
                            <Card className="shadow-lg border-0 bg-white">
                                <CardContent className="p-8">
                                    <div className="transition-all duration-500 ease-in-out transform">
                                        {/* Step 1: Trip Details & Members */}
                                        {currentStep === 1 && (
                                            <div className="animate-in slide-in-from-right-5 duration-500">
                                                <CreateTripForm
                                                    formData={formData}
                                                    updateFormData={updateFormData}
                                                />
                                            </div>
                                        )}

                                        {/* Step 2: Stops Planning */}
                                        {currentStep === 2 && (
                                            <div className="animate-in slide-in-from-right-5 duration-500 space-y-6">
                                                <ItenaryForm
                                                    formData={formData}
                                                    updateFormData={updateFormData}
                                                />
                                                
                                                {/* Suggested Stops Display */}
                                                {suggestedStops && suggestedStops.success && (
                                                    <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-600 mr-3"></div>
                                                            🌍 GlobeTrotter AI Suggestions
                                                        </h3>
                                                        
                                                        {/* Route Overview */}
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 mb-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="flex items-center text-sm text-gray-600">
                                                                        <MapPin className="w-4 h-4 mr-1 text-green-500" />
                                                                        <span className="font-medium">{suggestedStops.data?.route?.start}</span>
                                                                    </div>
                                                                    <div className="text-gray-400">→</div>
                                                                    <div className="flex items-center text-sm text-gray-600">
                                                                        <MapPin className="w-4 h-4 mr-1 text-red-500" />
                                                                        <span className="font-medium">{suggestedStops.data?.route?.end}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm text-gray-500">Total Duration</div>
                                                                    <div className="font-semibold text-gray-800">{suggestedStops.data?.route?.estimated_total_duration}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm text-gray-500">Est. Cost</div>
                                                                    <div className="font-semibold text-gray-800">₹{suggestedStops.data?.route?.total_estimated_cost_inr?.toLocaleString()}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Suggested Stops Cards */}
                                                        <div className="grid gap-4 mb-6">
                                                            {suggestedStops.data?.suggested_stops?.map((stop, index) => (
                                                                <Card key={index} className="bg-white/80 border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
                                                                    <CardContent className="p-6">
                                                                        <div className="flex justify-between items-start mb-4">
                                                                            <div>
                                                                                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                                                                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                                                                    {stop.place_name}
                                                                                </h4>
                                                                                <p className="text-sm text-gray-600 mt-1">{stop.description}</p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-xs text-gray-500">Total Cost</div>
                                                                                <div className="font-bold text-gray-800">₹{stop.total_estimated_cost_inr?.toLocaleString()}</div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                                            <div className="flex items-center text-sm text-gray-600">
                                                                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                                                <div>
                                                                                    <div className="text-xs text-gray-500">Distance</div>
                                                                                    <div className="font-medium">{stop.distance_from_start}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center text-sm text-gray-600">
                                                                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                                                <div>
                                                                                    <div className="text-xs text-gray-500">Duration</div>
                                                                                    <div className="font-medium">{stop.recommended_duration}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center text-sm text-gray-600">
                                                                                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                                                                <div>
                                                                                    <div className="text-xs text-gray-500">Per Night</div>
                                                                                    <div className="font-medium">₹{stop.accommodation_cost_per_night_inr}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center text-sm text-gray-600">
                                                                                <Users className="w-4 h-4 mr-2 text-gray-500" />
                                                                                <div>
                                                                                    <div className="text-xs text-gray-500">Food/Day</div>
                                                                                    <div className="font-medium">₹{stop.food_cost_per_day_inr}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Activities */}
                                                                        {stop.activities && stop.activities.length > 0 && (
                                                                            <div className="border-t pt-4">
                                                                                <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                                                                    <Activity className="w-4 h-4 mr-2 text-gray-500" />
                                                                                    Activities
                                                                                </h5>
                                                                                <div className="grid gap-2">
                                                                                    {stop.activities.slice(0, 3).map((activity, actIndex) => (
                                                                                        <div key={actIndex} className="bg-gray-50/80 rounded-lg p-3">
                                                                                            <div className="flex justify-between items-start">
                                                                                                <div>
                                                                                                    <div className="font-medium text-sm text-gray-800">{activity.activity_name}</div>
                                                                                                    <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
                                                                                                </div>
                                                                                                <div className="text-right">
                                                                                                    <div className="text-xs text-gray-500">₹{activity.estimated_cost_inr}</div>
                                                                                                    <div className="text-xs text-gray-500">{activity.duration}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                    {stop.activities.length > 3 && (
                                                                                        <div className="text-xs text-gray-500 text-center py-2">
                                                                                            +{stop.activities.length - 3} more activities
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>

                                                        {/* Travel Tips and Transportation */}
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {/* Travel Tips */}
                                                            {suggestedStops.data?.travel_tips && (
                                                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                                                                    <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                                                        <Info className="w-4 h-4 mr-2 text-gray-500" />
                                                                        Travel Tips
                                                                    </h5>
                                                                    <ul className="space-y-2">
                                                                        {suggestedStops.data.travel_tips.map((tip, index) => (
                                                                            <li key={index} className="text-sm text-gray-600 flex items-start">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 mr-2 flex-shrink-0"></div>
                                                                                {tip}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {/* Transportation Options */}
                                                            {suggestedStops.data?.transportation_options && (
                                                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                                                                    <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                                                        <Car className="w-4 h-4 mr-2 text-gray-500" />
                                                                        Transportation
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        {suggestedStops.data.transportation_options.map((transport, index) => {
                                                                            const getTransportIcon = (mode) => {
                                                                                switch (mode.toLowerCase()) {
                                                                                    case 'flight': return <Plane className="w-4 h-4" />
                                                                                    case 'train': return <Train className="w-4 h-4" />
                                                                                    case 'bus': return <Bus className="w-4 h-4" />
                                                                                    default: return <Car className="w-4 h-4" />
                                                                                }
                                                                            }
                                                                            
                                                                            return (
                                                                                <div key={index} className="flex justify-between items-center text-sm">
                                                                                    <div className="flex items-center text-gray-600">
                                                                                        {getTransportIcon(transport.mode)}
                                                                                        <span className="ml-2">{transport.mode}</span>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <div className="font-medium text-gray-800">₹{transport.estimated_cost_inr}</div>
                                                                                        <div className="text-xs text-gray-500">{transport.duration}</div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mt-6 flex justify-center">
                                                            <Button
                                                                onClick={convertSuggestionsToFormData}
                                                                disabled={suggestionsImported}
                                                                className={`px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                                                                    suggestionsImported 
                                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                                        : 'bg-gray-800 hover:bg-gray-900'
                                                                } text-white`}
                                                            >
                                                                {suggestionsImported ? '✅ Suggestions Imported!' : '✨ Import These Suggestions to My Trip'}
                                                            </Button>
                                                        </div>

                                                        <div className="mt-4 text-sm text-gray-600 text-center space-y-2">
                                                            <div>💡 These are AI-generated suggestions based on your route from <strong>{formData.start}</strong> to <strong>{formData.end}</strong></div>
                                                            {!suggestionsImported && (
                                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800">
                                                                    <div className="font-medium mb-1">📋 What will be imported:</div>
                                                                    <div className="text-sm space-y-1">
                                                                        <div>• {suggestedStops?.data?.suggested_stops?.length || 0} stops with dates and accommodation info</div>
                                                                        <div>• {suggestedStops?.data?.suggested_stops?.reduce((total, stop) => total + (stop.activities?.length || 0), 0) || 0} activities with timing and cost estimates</div>
                                                                        <div>• All data can be edited after import in the Activities step</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {suggestionsImported && (
                                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800">
                                                                    <div className="font-medium mb-1">✨ Successfully imported! You can now:</div>
                                                                    <div className="text-sm space-y-1">
                                                                        <div>• Go to Activities step to edit imported activities</div>
                                                                        <div>• Add more custom activities to any location</div>
                                                                        <div>• Continue to Review step when ready</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Step 3: Activities */}
                                        {currentStep === 3 && (
                                            <div className="animate-in slide-in-from-right-5 duration-500">
                                                {suggestionsImported && formData.activities.length > 0 && (
                                                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                        <div className="flex items-center mb-2">
                                                            <Info className="w-5 h-5 text-amber-600 mr-2" />
                                                            <span className="font-medium text-amber-800">AI Activities Imported!</span>
                                                        </div>
                                                        <div className="text-sm text-amber-700">
                                                            You have {formData.activities.length} imported activities. Click the <strong>Edit</strong> button on any activity to modify details, or add more activities using the form below.
                                                        </div>
                                                    </div>
                                                )}
                                                <AddActivitiesForm
                                                    formData={formData}
                                                    updateFormData={updateFormData}
                                                />
                                            </div>
                                        )}

                                        {/* Step 4: Review & Submit */}
                                        {currentStep === 4 && (
                                            <div className="animate-in slide-in-from-right-5 duration-500">
                                                <ReviewTripForm
                                                    formData={formData}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="px-8 py-3 bg-white hover:bg-gray-50 border-gray-300 hover:shadow-md transition-all duration-200"
                                >
                                    ← Previous
                                </Button>

                                {currentStep < 4 ? (
                                    <Button
                                        onClick={nextStep}
                                        disabled={isLoadingSuggestions}
                                        className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                                    >
                                        {isLoadingSuggestions ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Getting Suggestions...
                                            </>
                                        ) : (
                                            'Next →'
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating Trip...
                                            </>
                                        ) : (
                                            '🚀 Create Trip'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TripPlanner