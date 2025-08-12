import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logout from '@/components/Logout'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Activity, Eye, Loader2, ArrowLeft } from "lucide-react";
import { getUserTrips } from '@/api/user.api';

// Predefined itineraries for different states
const predefinedItineraries = [
  // US States
  {
    id: 1,
    state: 'California',
    title: 'Golden State Adventure',
    description: 'Explore the best of California from San Francisco to Los Angeles',
    duration: '7 days',
    highlights: ['Golden Gate Bridge', 'Hollywood', 'Yosemite National Park'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹98,000 - ₹1,65,000'
  },
  {
    id: 2,
    state: 'New York',
    title: 'Empire State Experience',
    description: 'From NYC skyline to Niagara Falls',
    duration: '5 days',
    highlights: ['Times Square', 'Central Park', 'Statue of Liberty'],
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    cost: '₹66,000 - ₹1,24,000'
  },
  {
    id: 3,
    state: 'Florida',
    title: 'Sunshine State Tour',
    description: 'Beaches, theme parks, and vibrant cities',
    duration: '6 days',
    highlights: ['Miami Beach', 'Disney World', 'Everglades'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹74,000 - ₹1,32,000'
  },
  {
    id: 4,
    state: 'Texas',
    title: 'Lone Star Journey',
    description: 'Big cities, BBQ, and cowboy culture',
    duration: '6 days',
    highlights: ['Austin Music Scene', 'Houston Space Center', 'Dallas Cowboys'],
    image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=400',
    cost: '₹57,000 - ₹1,07,000'
  },
  // Indian States
  {
    id: 5,
    state: 'Rajasthan',
    title: 'Royal Rajasthan',
    description: 'Palaces, forts, and desert landscapes',
    duration: '8 days',
    highlights: ['Jaipur Pink City', 'Udaipur Lakes', 'Jaisalmer Desert'],
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400',
    cost: '₹25,000 - ₹45,000'
  },
  {
    id: 6,
    state: 'Kerala',
    title: 'Gods Own Country',
    description: 'Backwaters, hill stations, and spice plantations',
    duration: '7 days',
    highlights: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Kochi Fort'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
    cost: '₹20,000 - ₹35,000'
  },
  {
    id: 7,
    state: 'Goa',
    title: 'Coastal Paradise',
    description: 'Beaches, Portuguese heritage, and vibrant nightlife',
    duration: '5 days',
    highlights: ['Baga Beach', 'Old Goa Churches', 'Dudhsagar Falls'],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
    cost: '₹15,000 - ₹30,000'
  },
  {
    id: 8,
    state: 'Himachal Pradesh',
    title: 'Mountain Retreat',
    description: 'Hill stations, adventure sports, and scenic valleys',
    duration: '6 days',
    highlights: ['Shimla Mall Road', 'Manali Rohtang Pass', 'Dharamshala'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹18,000 - ₹32,000'
  },
  {
    id: 9,
    state: 'Tamil Nadu',
    title: 'Temple Trail',
    description: 'Ancient temples, classical culture, and coastal beauty',
    duration: '7 days',
    highlights: ['Meenakshi Temple', 'Mahabalipuram', 'Ooty Hill Station'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    cost: '₹16,000 - ₹28,000'
  },
  {
    id: 10,
    state: 'Uttarakhand',
    title: 'Himalayan Adventure',
    description: 'Spiritual sites, trekking, and pristine mountains',
    duration: '8 days',
    highlights: ['Rishikesh Yoga', 'Haridwar Ganga Aarti', 'Nainital Lake'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹22,000 - ₹38,000'
  },
  {
    id: 11,
    state: 'Maharashtra',
    title: 'Cultural Heritage',
    description: 'Caves, hill stations, and bustling cities',
    duration: '6 days',
    highlights: ['Ajanta Ellora Caves', 'Lonavala', 'Mumbai Gateway'],
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400',
    cost: '₹20,000 - ₹35,000'
  },
  {
    id: 12,
    state: 'Karnataka',
    title: 'Silicon Valley of India',
    description: 'Tech cities, palaces, and coffee plantations',
    duration: '7 days',
    highlights: ['Mysore Palace', 'Coorg Coffee', 'Hampi Ruins'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    cost: '₹18,000 - ₹32,000'
  },
  {
    id: 13,
    state: 'West Bengal',
    title: 'Cultural Capital',
    description: 'Art, literature, and colonial architecture',
    duration: '5 days',
    highlights: ['Victoria Memorial', 'Howrah Bridge', 'Darjeeling Tea'],
    image: 'https://images.unsplash.com/photo-1558431382-27cce35feb4b?w=400',
    cost: '₹15,000 - ₹25,000'
  },
  {
    id: 14,
    state: 'Punjab',
    title: 'Land of Five Rivers',
    description: 'Golden Temple, heritage, and vibrant culture',
    duration: '4 days',
    highlights: ['Golden Temple', 'Jallianwala Bagh', 'Wagah Border'],
    image: 'https://images.unsplash.com/photo-1569950154942-43ea0c8b7736?w=400',
    cost: '₹12,000 - ₹22,000'
  }
];

const Dashboard = () => {
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        setLoading(true);
        console.log('Dashboard: Fetching user trips...');
        const response = await getUserTrips();
        console.log('Dashboard: API response:', response);
        
        // Check if response has trips array (backend returns trips, not data)
        if (response.trips && Array.isArray(response.trips)) {
          // Get latest 3 trips
          const latestTrips = response.trips.slice(0, 3);
          console.log('Dashboard: Latest trips:', latestTrips);
          setUserTrips(latestTrips);
        } else {
          console.error('Dashboard: No trips array found in response');
        }
      } catch (error) {
        console.error('Dashboard: Error fetching user trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
    // Initialize with all itineraries
    setFilteredItineraries(predefinedItineraries);
  }, []);

  // Filter itineraries based on search query
  useEffect(() => {
    const filtered = predefinedItineraries.filter(itinerary =>
      itinerary.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itinerary.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItineraries(filtered);
  }, [searchQuery]);

  const handleSearch = () => {
    // Search functionality is handled by useEffect above
    console.log('Searching for:', searchQuery);
  };

  const handleViewItinerary = (itinerary) => {
    // Navigate to trip planner with predefined itinerary data
    navigate('/trip-planner', { state: { predefinedItinerary: itinerary } });
  };

  const handleViewTrip = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  return (
    <div className="relative min-h-screen w-full">
      <img
        src="/banner.jpg"
        alt=""
        className="absolute inset-0 w-full h-108 object-cover z-0"
        style={{ objectPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40 z-5 h-96" />
      <div className="relative z-10">
        <header className="flex justify-between items-center px-6 py-4
          bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white text-2xl font-bold drop-shadow-lg">GlobalTrotter</h1>
          </div>
          <div className='flex gap-4 items-center'>
            <div className="rounded-full w-8 h-8 border border-white/30 bg-white/20 cursor-pointer" 
                 onClick={() => window.location.href = '/profile'} />
            <Logout />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="text-center mb-8">
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
              Discover Your Next Adventure
            </h2>
            <p className="text-white/90 text-lg md:text-xl drop-shadow-md">
              Plan amazing trips around the world
            </p>
          </div>
          <div className="w-full max-w-2xl bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Search destinations (e.g., California, Rajasthan...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white/90 border-white/50 text-gray-900 placeholder:text-gray-600"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/80 border-white/50 text-gray-900 hover:bg-white"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-t-3xl shadow-xl relative z-10 -mt-8">
          <div className="container mx-auto px-6 py-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Discover State Itineraries
                {searchQuery && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({filteredItineraries.length} results for "{searchQuery}")
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItineraries.length > 0 ? (
                  filteredItineraries.map((itinerary) => (
                    <Card 
                      key={itinerary.id} 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => handleViewItinerary(itinerary)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                        <img 
                          src={itinerary.image} 
                          alt={itinerary.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center" style={{display: 'none'}}>
                          <span className="text-white font-bold text-xl">{itinerary.state}</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                          {itinerary.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <h3 className="font-bold text-gray-900 mb-1">{itinerary.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{itinerary.description}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Highlights:</p>
                          <div className="flex flex-wrap gap-1">
                            {itinerary.highlights.slice(0, 2).map((highlight, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {highlight}
                              </span>
                            ))}
                            {itinerary.highlights.length > 2 && (
                              <span className="text-xs text-gray-500">+{itinerary.highlights.length - 2} more</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">{itinerary.cost}</span>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No itineraries found</h3>
                    <p className="text-gray-600 mb-4">Try searching for a different state or destination</p>
                    <Button 
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {userTrips.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Recent Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <CardContent className="">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    userTrips.map((trip) => (
                      <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                        <div className="h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-bold mb-1">{trip.title}</h3>
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="w-3 h-3" />
                              <span>{trip.start_destination} → {trip.end_destination}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trip.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {trip.start_date && trip.end_date ? (
                                  `${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                ) : 'Dates TBD'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>{trip.stops?.length || 0} stops</span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleViewTrip(trip.id)}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Trip
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
