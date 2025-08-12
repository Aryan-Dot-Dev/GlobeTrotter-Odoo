import axios from "../lib/axios";

const addActivities = async (tripId, activities) => {
    if (!tripId || !activities || activities.length === 0) {
        throw new Error("tripId and activities array are required");
    }

    const requestPayload = {
        trip_id: tripId,
        activities: activities
    };
    
    console.log('Sending activities request:', requestPayload);
    
    try {
        const response = await axios.post('/api/trips/activities', requestPayload, { withCredentials: true });
        console.log('Activities response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding activities:', error);
        throw error;
    }
}

export default addActivities;