// js/storage.js

const Storage = {
  setToken(token) {
    localStorage.setItem('accessToken', token);
  },
  getToken() {
    return localStorage.getItem('accessToken');
  },
  removeToken() {
    localStorage.removeItem('accessToken');
  },
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser() {
    localStorage.removeItem('user');
  },
  clearAll() {
    localStorage.clear();
  }
};
