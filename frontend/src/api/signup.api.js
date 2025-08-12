import axios from '../lib/axios';

const signup = async (name, email, password, location, avatarFile, username) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('location', location);
    formData.append('username', username);
    
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    const response = await axios.post('/api/auth/signup', formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data.message) console.log(response.data.user)
    return response.data;
};

export { signup };