import axios from '../lib/axios.js';

const bookPredefinedItinerary = async (predefinedItinerary) => {
    try {
        console.log('📤 Booking predefined itinerary:', predefinedItinerary);

        // Prepare stops data from highlights
        const stops = predefinedItinerary.highlights?.map((highlight, index) => ({
            destination: highlight,
            start_date: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            end_date: new Date(Date.now() + ((index + 1) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            notes: `Visit ${highlight} in ${predefinedItinerary.state}`
        })) || [];

        // Prepare activities data
        const activities = predefinedItinerary.activities?.map((activity, index) => ({
            name: activity.name || activity,
            description: activity.description || '',
            location: activity.location || predefinedItinerary.state,
            cost: activity.cost || 0,
            date: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            time: '09:00:00'
        })) || [];

        // Create the complete trip with stops and activities in one call
        const response = await axios.post('/api/trips/book-predefined', {
            title: predefinedItinerary.title,
            description: `${predefinedItinerary.description} (AI-Generated ${predefinedItinerary.state} Itinerary)`,
            start_destination: predefinedItinerary.highlights?.[0] || predefinedItinerary.state,
            end_destination: predefinedItinerary.highlights?.[predefinedItinerary.highlights.length - 1] || predefinedItinerary.state,
            start_date: new Date().toISOString().split('T')[0], // Today's date as placeholder
            end_date: new Date(Date.now() + (parseInt(predefinedItinerary.duration) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Duration in days
            stops: stops,
            activities: activities
        });

        console.log('✅ Predefined itinerary booked successfully:', response.data);
        return {
            success: true,
            trip: response.data.trip,
            stopsCount: response.data.stopsCount,
            activitiesCount: response.data.activitiesCount,
            message: response.data.message || 'Itinerary successfully booked and added to your trips!'
        };
    } catch (error) {
        console.error('❌ Error booking predefined itinerary:', error.response?.data || error.message);
        throw {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to book itinerary. Please try again.',
            error: error
        };
    }
};

export { bookPredefinedItinerary };
