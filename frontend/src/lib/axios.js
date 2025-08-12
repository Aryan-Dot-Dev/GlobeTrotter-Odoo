import axios from 'axios';

// Set default configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000';

// Response interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => {
    // Return successful responses as is
    return response;
  },
  (error) => {
    // Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      // Clear any stored auth tokens/data
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Clear any cookies by setting them to expire
      document.cookie = 'sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Only redirect if not already on public pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/unauthorized', '/login', '/signup', '/', '/community'];
      const isCommunityTrip = currentPath.startsWith('/community/trip/');
      
      if (!publicPaths.includes(currentPath) && !isCommunityTrip) {
        // Use a small delay to prevent redirect loops
        setTimeout(() => {
          window.location.href = '/unauthorized';
        }, 100);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    // Return the error for further handling
    return Promise.reject(error);
  }
);

export default axios;
