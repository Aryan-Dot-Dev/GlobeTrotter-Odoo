import axios from '../lib/axios';

const API_BASE_URL = '/api/community';

// Get all public trips for community board
export const getPublicTrips = async (params = {}) => {
    try {
        const { page = 1, limit = 12, search = '', sort = 'newest' } = params;
        
        const response = await axios.get(`${API_BASE_URL}/trips`, {
            params: { page, limit, search, sort },
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching public trips:', error);
        throw error;
    }
};

// Get detailed view of a specific trip
export const getTripDetails = async (tripId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trips/${tripId}`, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching trip details:', error);
        throw error;
    }
};

// Copy a community trip to user's account
export const copyTripToAccount = async (tripId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/copy`, {}, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error copying trip to account:', error);
        throw error;
    }
};
