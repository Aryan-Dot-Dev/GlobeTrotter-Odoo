import axios from '../lib/axios';

const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post('/api/auth/upload-avatar', formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

const updateProfile = async (profileData) => {
    const response = await axios.put('/api/auth/profile', profileData, {
        withCredentials: true
    });

    return response.data;
};

export { uploadProfileImage, updateProfile };
