import axios from "../lib/axios";

const addStops = async (tripId, stops) => {
    try {
        const response = await axios.post('/api/trips/stops', {
            trip_id: tripId,
            stops: stops
        }, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error adding stops:', error);
        throw error;
    }
}

export default addStops;