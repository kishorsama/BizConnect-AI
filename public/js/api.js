// js/api.js

const API = {
  // Real API calls to backend
  async post(endpoint, body) {
    try {
      console.log(`API POST request to: ${endpoint}`);
      console.log('Request body:', body);

      const token = Storage.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'POST',
        headers: headers,
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
  },

  async put(endpoint, body) {
    try {
      console.log(`API PUT request to: ${endpoint}`);
      console.log('Request body:', body);

      const token = Storage.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      console.log(`API DELETE request to: ${endpoint}`);
      
      const token = Storage.getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
};
