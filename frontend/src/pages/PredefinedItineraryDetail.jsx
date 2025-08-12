import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star,
  Utensils,
  Bed,
  Camera,
  CheckCircle,
  Loader2
} from "lucide-react";
import { bookPredefinedItinerary } from '../api/index.js';

const PredefinedItineraryDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { predefinedItinerary } = location.state || {};
  
  // Booking state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!predefinedItinerary) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">Itinerary Not Found</h2>
          <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = async () => {
    try {
      setIsBooking(true);
      setBookingMessage('');
      setBookingSuccess(false);

      const result = await bookPredefinedItinerary(predefinedItinerary);
      
      if (result.success) {
        setBookingSuccess(true);
        setBookingMessage(result.message);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setBookingMessage(result.message || 'Failed to book itinerary');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingMessage(error.message || 'An error occurred while booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">{predefinedItinerary.title}</h1>
                <p className="text-gray-400">{predefinedItinerary.state}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {predefinedItinerary.aiGenerated && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  ✨ AI Curated
                </Badge>
              )}
              {predefinedItinerary.featured && (
                <Badge className="bg-green-500">
                  🌟 Featured
                </Badge>
              )}
              <Button 
                onClick={handleBookNow}
                disabled={isBooking}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book This Trip'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden p-0 bg-gray-800/50 border-gray-700">
          <div className="relative h-64 md:h-80">
            <img 
              src={predefinedItinerary.image} 
              alt={predefinedItinerary.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
              style={{display: 'none'}}
            >
              <span className="text-white font-bold text-4xl">{predefinedItinerary.state}</span>
            </div>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{predefinedItinerary.title}</h2>
              <p className="text-lg opacity-90">{predefinedItinerary.description}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Trip Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="font-semibold text-gray-100">{predefinedItinerary.duration}</div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="font-semibold text-gray-100">{predefinedItinerary.highlights.length}</div>
                    <div className="text-xs text-gray-400">Destinations</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <DollarSign className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="font-semibold text-gray-100">{predefinedItinerary.cost}</div>
                    <div className="text-xs text-gray-400">Est. Cost</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="font-semibold text-gray-100">Ready</div>
                    <div className="text-xs text-gray-400">To Book</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-100 mb-3">Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {predefinedItinerary.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-900/30 rounded-lg">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Itinerary */}
            {predefinedItinerary.detailedItinerary && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-100">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Day-by-Day Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {predefinedItinerary.detailedItinerary.days.map((day, index) => (
                      <div key={index} className="border-l-4 border-blue-500/50 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {day.day}
                          </div>
                          <h3 className="font-semibold text-gray-100">{day.title}</h3>
                          <Badge variant="outline" className="ml-auto border-gray-600 text-gray-300">
                            {day.estimatedCost}
                          </Badge>
                        </div>
                        
                        <div className="ml-10 space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-300 mb-1">Activities</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="text-sm text-gray-400">{activity}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-300 mb-1 flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                Accommodation
                              </h4>
                              <p className="text-sm text-gray-400">{day.accommodation}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-300 mb-1 flex items-center gap-1">
                                <Utensils className="w-4 h-4" />
                                Meals
                              </h4>
                              <ul className="text-sm text-gray-400">
                                {day.meals.map((meal, mealIndex) => (
                                  <li key={mealIndex}>• {meal}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24 bg-gray-800/50 border-gray-700 z-20">
              <CardHeader>
                <CardTitle className="text-center text-gray-100">Book This Adventure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {predefinedItinerary.cost}
                  </div>
                  <div className="text-sm text-gray-400">per person</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-medium text-gray-200">{predefinedItinerary.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Destinations:</span>
                    <span className="font-medium text-gray-200">{predefinedItinerary.highlights.length} places</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-medium text-gray-200">Pre-defined</span>
                  </div>
                </div>

                <Button 
                  onClick={handleBookNow}
                  disabled={isBooking}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mb-3 disabled:opacity-50"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book This Trip Now'
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => navigate('/trip-planner', { state: { predefinedItinerary, mode: 'customize' } })}
                >
                  Customize This Trip
                </Button>

                {/* Booking Message */}
                {bookingMessage && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    bookingSuccess 
                      ? 'bg-green-900/50 border border-green-700 text-green-300' 
                      : 'bg-red-900/50 border border-red-700 text-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {bookingSuccess ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-lg">⚠️</span>
                      )}
                      <span>{bookingMessage}</span>
                    </div>
                    {bookingSuccess && (
                      <div className="mt-2 text-xs opacity-75">
                        Redirecting to dashboard in a few seconds...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            <div className="sticky top-[420px] z-10">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Accommodation (as specified)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Curated activity recommendations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Detailed day-by-day itinerary</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Local insider tips</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">24/7 travel support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredefinedItineraryDetail;
