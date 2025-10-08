// js/api.js

const API = {
  // Real API calls to backend
  async post(endpoint, body) {
    try {
      console.log(`API POST request to: ${endpoint}`);
      console.log('Request body:', body);

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  async get(endpoint) {
    try {
      console.log(`API GET request to: ${endpoint}`);
      
      const token = Storage.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'GET',
        headers: headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }
};
