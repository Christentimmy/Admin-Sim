// Authentication module
const auth = {
    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Validate token with server
    validateToken: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;

            const response = await fetch(window.API_CONFIG.TOKEN_VALIDATION_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Token validation failed');
            }

            return response.status === 200;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    },

    // Login function
    login: async (email, password) => {
        try {
            const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Invalid email or password');
            }

            const data = await response.json();
            
            if (!data.token) {
                throw new Error('No token received from server');
            }
            
            // Store the token
            localStorage.setItem('token', data.token);
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout function
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    },

    // Get authentication token
    getToken: () => {
        return localStorage.getItem('token');
    }
}; 