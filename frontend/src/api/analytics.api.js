import axios from '../lib/axios';

// Get overview statistics
export const getOverviewStats = async () => {
    try {
        const response = await axios.get('/api/analytics/overview');
        return response.data;
    } catch (error) {
        console.error('Error fetching overview stats:', error);
        throw error;
    }
};

// Get popular destinations
export const getPopularDestinations = async () => {
    try {
        const response = await axios.get('/api/analytics/destinations');
        return response.data;
    } catch (error) {
        console.error('Error fetching popular destinations:', error);
        throw error;
    }
};

// Get popular activities
export const getPopularActivities = async () => {
    try {
        const response = await axios.get('/api/analytics/activities');
        return response.data;
    } catch (error) {
        console.error('Error fetching popular activities:', error);
        throw error;
    }
};

// Get user engagement data
export const getUserEngagement = async () => {
    try {
        const response = await axios.get('/api/analytics/engagement');
        return response.data;
    } catch (error) {
        console.error('Error fetching user engagement:', error);
        throw error;
    }
};

// Get user management data
export const getUserManagement = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`/api/analytics/users?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user management data:', error);
        throw error;
    }
};
