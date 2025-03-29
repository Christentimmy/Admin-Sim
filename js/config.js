// API Configuration
const API_BASE_URL = 'http://192.168.1.108:5000/admin';
const TOKEN_VALIDATION_URL = `${API_BASE_URL}/check-token`;
// const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YWE5NDVjMTVjMTk5OGQ4NTUzODVjZSIsInJvbGUiOiJzdXBlciIsImlhdCI6MTc0MzE4Mjg3NSwiZXhwIjoxNzQzMjY5Mjc1fQ.wkm-1lB2DUB14PqEYNJw5mVKfv4kaQGWaWFL8-UIA4A';

// Export the constants
window.API_CONFIG = {
    API_BASE_URL,
    TOKEN_VALIDATION_URL,
    // TEST_TOKEN
}; 