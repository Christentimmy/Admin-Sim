// Authentication module
const auth = {
    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Logout function
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    },

    // Get authentication token
    getToken: () => {
        return localStorage.getItem('token') || API_CONFIG.TEST_TOKEN;
    }
}; 