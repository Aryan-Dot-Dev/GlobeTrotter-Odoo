import axios from '../lib/axios'

const addTrip = async (title, description, start_destination, end_destination, start_date, end_date, status, public_slug) => {
    try {
        const response = await axios.post('/api/trips', {
            title,
            description,
            start_destination,
            end_destination,
            start_date,
            end_date,
            status,
            public_slug
        }, {withCredentials: true});
        return response.data;
    } catch (error) {
        console.error('Error adding trip:', error);
        throw error;
    }
}

export { addTrip };