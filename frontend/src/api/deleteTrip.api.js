import axios from '../lib/axios';

const deleteTrip = async (tripId) => {
    try {
        const response = await axios.delete(`/api/trips/trip/${tripId}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
    }
};

export { deleteTrip };
