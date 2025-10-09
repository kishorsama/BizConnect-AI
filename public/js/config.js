// js/config.js

const API_CONFIG = {
  baseURL: '/api', // same-origin API base to avoid CORS issues
  timeout: 10000,
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    getCurrentUser: '/auth/me'
  }
};
