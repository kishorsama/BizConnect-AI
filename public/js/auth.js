// js/auth.js

const Auth = {
  isAuthenticated() {
    return !!Storage.getToken();
  },
  
  getCurrentUser() {
    return Storage.getUser();
  },
  
  async login(email, password) {
    try {
      const response = await API.post(API_CONFIG.endpoints.login, { email, password });
      Storage.setToken(response.accessToken);
      Storage.setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  },
  
  async register(registrationData) {
    try {
      const response = await API.post(API_CONFIG.endpoints.register, registrationData);
      Storage.setToken(response.accessToken);
      Storage.setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    Storage.clearAll();
    window.location.href = '/login.html';
  },
  
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },
  
  redirectToDashboard() {
    const role = this.getUserRole();
    switch(role) {
      case 'admin':
        window.location.href = '/admin-dashboard.html';
        break;
      case 'vendor':
        window.location.href = '/vendor-dashboard.html';
        break;
      case 'customer':
        window.location.href = '/customer-dashboard.html';
        break;
      default:
        // Fallback dashboard
        window.location.href = '/login.html';
    }
  },
  
  // Call this function at the top of any protected page
  protectPage(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    
    const userRole = this.getUserRole();
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      alert('You do not have permission to access this page.');
      // Redirect to their default dashboard to avoid getting stuck
      this.redirectToDashboard();
      return;
    }
  }
};
