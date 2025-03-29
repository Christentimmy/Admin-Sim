// Authentication module
const auth = {
    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Login function
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Invalid email or password');
            }

            const data = await response.json();
            
            // Store the token
            localStorage.setItem('token', data.token);
            
            // Show success message with green background
            const errorAlert = document.getElementById('errorAlert');
            errorAlert.textContent = data.message;
            errorAlert.style.display = 'block';
            errorAlert.classList.remove('alert-danger');
            errorAlert.classList.add('alert-success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            const errorAlert = document.getElementById('errorAlert');
            errorAlert.textContent = error.message || 'Login failed. Please try again.';
            errorAlert.style.display = 'block';
            errorAlert.classList.remove('alert-success');
            errorAlert.classList.add('alert-danger');
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
        return localStorage.getItem('token') || API_CONFIG.TEST_TOKEN;
    }
}; 