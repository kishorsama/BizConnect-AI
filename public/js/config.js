// js/config.js

const API_CONFIG = {
  baseURL: 'https://bizconnect-ai.onrender.com/api', // Replace with your actual backend URL
  timeout: 10000,
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    getCurrentUser: '/auth/me'
  }
};
