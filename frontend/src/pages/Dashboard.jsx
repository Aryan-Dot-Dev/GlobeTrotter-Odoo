import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logout from '@/components/Logout'
import UserNav from '@/components/UserNav'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Activity, Eye, Loader2, ArrowLeft, Plus, Users, Edit } from "lucide-react";
import { getUserTrips } from '@/api/user.api';

// Predefined AI-generated itineraries with detailed content
const predefinedItineraries = [
  // Featured Itineraries (shown on dashboard)
  {
    id: 1,
    state: 'California',
    title: 'Golden State Adventure',
    description: 'Experience the diversity of California from tech hubs to natural wonders',
    duration: '7 days',
    highlights: ['Golden Gate Bridge', 'Hollywood Walk of Fame', 'Yosemite National Park'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹98,000 - ₹1,65,000',
    featured: true,
    aiGenerated: true,
    detailedItinerary: {
      days: [
        {
          day: 1,
          title: 'Arrival in San Francisco',
          activities: ['Check into hotel in Union Square', 'Walk across Golden Gate Bridge', 'Explore Fishermans Wharf', 'Dinner at Pier 39'],
          accommodation: 'Hotel Zephyr San Francisco',
          meals: ['Welcome dinner at seafood restaurant'],
          estimatedCost: '₹16,500'
        },
        {
          day: 2,
          title: 'San Francisco City Tour',
          activities: ['Alcatraz Island tour', 'Lombard Street visit', 'Cable car ride', 'Chinatown exploration'],
          accommodation: 'Hotel Zephyr San Francisco',
          meals: ['Breakfast at hotel', 'Lunch in Chinatown', 'Dinner at Nob Hill'],
          estimatedCost: '₹14,800'
        },
        {
          day: 3,
          title: 'Drive to Los Angeles',
          activities: ['Scenic Pacific Coast Highway drive', 'Stop at Monterey Bay', 'Sunset at Big Sur', 'Late arrival in LA'],
          accommodation: 'Hollywood Roosevelt Hotel',
          meals: ['Breakfast in SF', 'Lunch at Monterey', 'Dinner in Hollywood'],
          estimatedCost: '₹20,600'
        }
        // ... more days would be included
      ]
    }
  },
  {
    id: 2,
    state: 'Rajasthan',
    title: 'Royal Heritage Circuit',
    description: 'Journey through majestic palaces and vibrant desert culture',
    duration: '8 days',
    highlights: ['Jaipur Pink City', 'Udaipur Lake Palace', 'Jaisalmer Desert Safari'],
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400',
    cost: '₹25,000 - ₹45,000',
    featured: true,
    aiGenerated: true,
    detailedItinerary: {
      days: [
        {
          day: 1,
          title: 'Arrival in Jaipur - The Pink City',
          activities: ['Airport pickup', 'Check into heritage hotel', 'Evening at Hawa Mahal', 'Traditional Rajasthani dinner'],
          accommodation: 'Rambagh Palace',
          meals: ['Welcome lunch', 'Royal dinner with folk dance'],
          estimatedCost: '₹3,500'
        },
        {
          day: 2,
          title: 'Jaipur Palace Tour',
          activities: ['Amber Fort elephant ride', 'City Palace museum', 'Jantar Mantar observatory', 'Local bazaar shopping'],
          accommodation: 'Rambagh Palace',
          meals: ['Breakfast at hotel', 'Lunch at local restaurant', 'Dinner at Chokhi Dhani'],
          estimatedCost: '₹2,800'
        }
        // ... more days would be included
      ]
    }
  },
  {
    id: 3,
    state: 'Kerala',
    title: 'Backwater Bliss',
    description: 'Serene backwaters, lush hill stations, and spice-scented air',
    duration: '6 days',
    highlights: ['Alleppey Houseboat', 'Munnar Tea Plantations', 'Kochi Chinese Nets'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
    cost: '₹18,000 - ₹32,000',
    featured: true,
    aiGenerated: true,
    detailedItinerary: {
      days: [
        {
          day: 1,
          title: 'Arrival in Kochi',
          activities: ['Fort Kochi walking tour', 'Chinese fishing nets photography', 'Spice market visit', 'Kathakali performance'],
          accommodation: 'Brunton Boatyard Hotel',
          meals: ['Lunch at local restaurant', 'Seafood dinner by the harbor'],
          estimatedCost: '₹2,200'
        }
        // ... more days would be included
      ]
    }
  },
  {
    id: 4,
    state: 'New York',
    title: 'Empire State Explorer',
    description: 'From Manhattan skylines to Niagara Falls natural wonder',
    duration: '5 days',
    highlights: ['Times Square', 'Central Park', 'Statue of Liberty', 'Niagara Falls'],
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    cost: '₹74,000 - ₹1,32,000',
    featured: true,
    aiGenerated: true,
    detailedItinerary: {
      days: [
        {
          day: 1,
          title: 'Manhattan Arrival',
          activities: ['Check into Times Square hotel', 'Broadway show evening', 'Late night Times Square walk'],
          accommodation: 'Marriott Marquis',
          meals: ['Dinner at famous NYC deli'],
          estimatedCost: '₹18,100'
        }
        // ... more days would be included
      ]
    }
  },
  
  // Additional searchable itineraries (not featured on dashboard)
  {
    id: 5,
    state: 'Florida',
    title: 'Sunshine State Tour',
    description: 'Beaches, theme parks, and vibrant cities',
    duration: '6 days',
    highlights: ['Miami Beach', 'Disney World', 'Everglades'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹74,000 - ₹1,32,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 6,
    state: 'Texas',
    title: 'Lone Star Journey',
    description: 'Big cities, BBQ, and cowboy culture',
    duration: '6 days',
    highlights: ['Austin Music Scene', 'Houston Space Center', 'Dallas Cowboys'],
    image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=400',
    cost: '₹57,000 - ₹1,07,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 7,
    state: 'Goa',
    title: 'Coastal Paradise',
    description: 'Beaches, Portuguese heritage, and vibrant nightlife',
    duration: '5 days',
    highlights: ['Baga Beach', 'Old Goa Churches', 'Dudhsagar Falls'],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
    cost: '₹15,000 - ₹30,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 8,
    state: 'Himachal Pradesh',
    title: 'Mountain Retreat',
    description: 'Hill stations, adventure sports, and scenic valleys',
    duration: '6 days',
    highlights: ['Shimla Mall Road', 'Manali Rohtang Pass', 'Dharamshala'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹18,000 - ₹32,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 9,
    state: 'Tamil Nadu',
    title: 'Temple Trail',
    description: 'Ancient temples, classical culture, and coastal beauty',
    duration: '7 days',
    highlights: ['Meenakshi Temple', 'Mahabalipuram', 'Ooty Hill Station'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400',
    cost: '₹16,000 - ₹28,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 10,
    state: 'Uttarakhand',
    title: 'Himalayan Adventure',
    description: 'Spiritual sites, trekking, and pristine mountains',
    duration: '8 days',
    highlights: ['Rishikesh Yoga', 'Haridwar Ganga Aarti', 'Nainital Lake'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    cost: '₹22,000 - ₹38,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 11,
    state: 'Maharashtra',
    title: 'Cultural Heritage',
    description: 'Caves, hill stations, and bustling cities',
    duration: '6 days',
    highlights: ['Ajanta Ellora Caves', 'Lonavala', 'Mumbai Gateway'],
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400',
    cost: '₹20,000 - ₹35,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 12,
    state: 'Karnataka',
    title: 'Silicon Valley of India',
    description: 'Tech cities, palaces, and coffee plantations',
    duration: '7 days',
    highlights: ['Mysore Palace', 'Coorg Coffee', 'Hampi Ruins'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    cost: '₹18,000 - ₹32,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 13,
    state: 'West Bengal',
    title: 'Cultural Capital',
    description: 'Art, literature, and colonial architecture',
    duration: '5 days',
    highlights: ['Victoria Memorial', 'Howrah Bridge', 'Darjeeling Tea'],
    image: 'https://images.unsplash.com/photo-1558431382-27cce35feb4b?w=400',
    cost: '₹15,000 - ₹25,000',
    featured: false,
    aiGenerated: true
  },
  {
    id: 14,
    state: 'Punjab',
    title: 'Land of Five Rivers',
    description: 'Golden Temple, heritage, and vibrant culture',
    duration: '4 days',
    highlights: ['Golden Temple', 'Jallianwala Bagh', 'Wagah Border'],
    image: 'https://images.unsplash.com/photo-1569950154942-43ea0c8b7736?w=400',
    cost: '₹12,000 - ₹22,000',
    featured: false,
    aiGenerated: true
  }
];

const Dashboard = () => {
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const navigate = useNavigate();

  // Fallback gradient colors for each trip
  const getTripGradient = (tripId) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      'linear-gradient(135deg, #cdb4db 0%, #ffc8dd 100%)',
      'linear-gradient(135deg, #ffafbd 0%, #ffc3a0 100%)'
    ];
    return gradients[tripId % gradients.length];
  };

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
    // Initialize with featured itineraries only
    setFilteredItineraries(predefinedItineraries.filter(itinerary => itinerary.featured));
  }, []);

  // Filter itineraries based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Show only featured itineraries when no search
      setFilteredItineraries(predefinedItineraries.filter(itinerary => itinerary.featured));
    } else {
      // Show all matching itineraries when searching
      const filtered = predefinedItineraries.filter(itinerary =>
        itinerary.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItineraries(filtered);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    // Search functionality is handled by useEffect above
    console.log('Searching for:', searchQuery);
  };

  const handleViewItinerary = (itinerary) => {
    if (itinerary.featured && itinerary.detailedItinerary) {
      // Navigate to detailed view for featured itineraries with full details
      navigate('/itinerary-detail', { state: { predefinedItinerary: itinerary } });
    } else {
      // Navigate to trip planner for basic itineraries
      navigate('/trip-planner', { state: { predefinedItinerary: itinerary } });
    }
  };

  const handleViewTrip = (tripId) => {
    navigate(`/trip/${tripId}`, { state: { from: 'dashboard' } });
  };

  const handleEditTrip = (tripId) => {
    navigate('/trip-planner', { 
      state: { 
        editTripId: tripId,
        mode: 'edit' 
      } 
    });
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
          bg-black/35 rounded-b-2xl backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white text-2xl font-bold drop-shadow-lg">GlobalTrotter</h1>
          </div>
          <div className='flex gap-4 items-center'>
            <UserNav />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center px-6 pt-12 py-28 ">
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
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-t-3xl shadow-xl relative z-10 -mt-8">
          <div className="container mx-auto px-6 py-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                {searchQuery ? (
                  <>
                    Search Results
                    <span className="text-lg font-normal text-gray-400 ml-2">
                      ({filteredItineraries.length} results for "{searchQuery}")
                    </span>
                  </>
                ) : (
                  <>
                    🌍 Featured GlobeTrotter Itineraries
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      (Ready-to-book adventures)
                    </span>
                  </>
                )}
              </h2>
              {!searchQuery && (
                <p className="text-gray-400 mb-6">
                  Discover our handpicked, expertly-curated travel experiences. Search above to explore more destinations!
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItineraries.length > 0 ? (
                  filteredItineraries.map((itinerary) => (
                    <Card 
                      key={itinerary.id} 
                      className="overflow-hidden p-0 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gray-800/50 border border-gray-700 hover:border-gray-600 flex flex-col h-full"
                      onClick={() => handleViewItinerary(itinerary)}
                    >
                      <div className="aspect-video bg-gray-100 relative overflow-hidden flex-shrink-0">
                        <img 
                          src={itinerary.image} 
                          alt={itinerary.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center" style={{display: 'none'}}>
                          <span className="text-gray-600 font-bold text-xl">{itinerary.state}</span>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3">
                          {itinerary.aiGenerated && (
                            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                              🌍 GlobeTrotter Verified
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-gray-800/90 backdrop-blur-sm text-gray-300 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                            {itinerary.duration}
                          </span>
                        </div>
                        
                        {itinerary.featured && (
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                              ⭐ Featured
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="px-5 pt-0 pb-5 flex flex-col h-full">
                        <div className="space-y-3 flex-grow">
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-gray-300 transition-colors text-lg">
                              {itinerary.title}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {itinerary.description}
                            </p>
                          </div>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1">
                            {itinerary.highlights.slice(0, 2).map((highlight, idx) => (
                              <span key={idx} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                                {highlight}
                              </span>
                            ))}
                            {itinerary.highlights.length > 2 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{itinerary.highlights.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-700 mt-auto">
                          <span className="text-sm font-semibold text-white">{itinerary.cost}</span>
                          <Button 
                            size="sm" 
                            className="bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {itinerary.featured ? 'Book Now' : 'View'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No itineraries found</h3>
                    <p className="text-gray-400 mb-4">Try searching for a different state or destination</p>
                    <Button 
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {userTrips.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-white">Your Recent Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    userTrips.map((trip) => (
                      <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 p-0 group cursor-pointer bg-gray-800/50 border border-gray-700 hover:border-gray-600 flex flex-col h-full">
                        <div 
                          className="h-48 relative overflow-hidden flex-shrink-0"
                          style={{ background: getTripGradient(trip.id) }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-lg font-semibold mb-1">{trip.title}</h3>
                            <div className="flex items-center space-x-2 text-sm opacity-90">
                              <MapPin className="w-3 h-3" />
                              <span>{trip.start_destination} → {trip.end_destination}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex-grow">
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{trip.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
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
                          </div>
                          <div className="mt-auto">
                            <div className="flex gap-2">
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTrip(trip.id);
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTrip(trip.id);
                                }}
                                variant="outline"
                                className="flex-1 border-gray-600 text-gray-700 hover:bg-gray-700 hover:text-white"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
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

      {/* Floating Create Trip Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4 flex items-center space-x-2"
        onClick={() => navigate('/trip-planner')}
      >
        <Plus className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Create Trip</span>
      </Button>
    </div>
  );
};

export default Dashboard;