import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuthError = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.detail && event.detail.status === 401) {
        // Clear auth data
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Navigate to unauthorized page
        navigate('/unauthorized');
      }
    };

    // Listen for custom auth error events
    window.addEventListener('authError', handleAuthError);

    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, [navigate]);
};

export default useAuthError;
