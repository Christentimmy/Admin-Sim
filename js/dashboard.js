// Dashboard Functions
const API_BASE_URL = 'http://192.168.1.108:5000/admin';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YWE5NDVjMTVjMTk5OGQ4NTUzODVjZSIsInJvbGUiOiJzdXBlciIsImlhdCI6MTc0Mjk5MjU4NywiZXhwIjoxNzQzMDc4OTg3fQ.bwJn7uEU7WzH9lITqGw4LzWAnLkpk7SXHN3p_g-6O2I';

// Fetch recent bookings
async function fetchRecentBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/recent-bookings`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.rides) {
            throw new Error('No rides data received');
        }

        return data.rides;
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        showAlert('Failed to load recent bookings', 'error');
        return [];
    }
}

// Display recent bookings
function displayRecentBookings(bookings) {
    const container = document.querySelector('.recent-bookings');
    if (!container) {
        console.error('Recent bookings container not found');
        return;
    }

    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<div class="text-center text-muted">No recent bookings</div>';
        return;
    }

    const bookingsHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-header">
                <div class="booking-status ${getStatusClass(booking.status)}">
                    ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
                <div class="booking-time">
                    ${new Date(booking.createdAt).toLocaleString()}
                </div>
            </div>
            <div class="booking-details">
                <div class="location">
                    <i class="fas fa-map-marker-alt text-danger"></i>
                    <span>${booking.pickup_location.address}</span>
                </div>
                <div class="location">
                    <i class="fas fa-map-marker-alt text-success"></i>
                    <span>${booking.dropoff_location.address}</span>
                </div>
                <div class="booking-info">
                    <span class="fare">₦${booking.fare.toLocaleString()}</span>
                    <span class="payment-method">
                        <i class="fas fa-credit-card"></i> ${booking.payment_method}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = bookingsHTML;
}

// Helper function to get status class
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        case 'pending': return 'status-pending';
        case 'in_progress': return 'status-in-progress';
        default: return 'status-default';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const recentBookings = await fetchRecentBookings();
        displayRecentBookings(recentBookings);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}); 