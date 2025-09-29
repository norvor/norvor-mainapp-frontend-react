
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// This function will be our central point for all API calls
const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
 
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If a token exists, add the Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    ...options,
    headers,
  };
  try {
    console.log(`API Request: ${config.method} ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      // If the server response is not OK (e.g., 401 Unauthorized), handle it
      if (response.status === 401) {
        // Token is invalid or expired, so we log the user out
        localStorage.removeItem('authToken');
        // Redirect to the marketing site's login page
        // IMPORTANT: Replace with your deployed marketing URL in production
        window.location.href = 'https://www.norvorx.com/login'; 
        //window.location.href = 'http://localhost:3000/login'; 
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || 'An API error occurred');
    }

    // If the request might not have a body (e.g., a DELETE request)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    // Return nothing for responses with no body
    return; 

  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
};

export default apiClient;