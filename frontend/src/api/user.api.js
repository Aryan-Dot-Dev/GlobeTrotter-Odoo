import axios from '../lib/axios';

const API_BASE_URL = '/api/user';

// Get all trips for the current user
export const getUserTrips = async (params = {}) => {
    try {
        const { page = 1, limit = 50, sort = 'start_date' } = params;
        
        const response = await axios.get(`${API_BASE_URL}/trips`, {
            params: { page, limit, sort },
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching user trips:', error);
        throw error;
    }
};

// Get user profile information
export const getUserProfile = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Get user statistics
export const getUserStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stats`, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
};

// Get detailed view of a specific trip (for the logged-in user)
export const getUserTripDetails = async (tripId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trips/${tripId}`, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching user trip details:', error);
        throw error;
    }
};
