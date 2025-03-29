// Dashboard API Functions
async function fetchDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/get-dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

async function fetchRecentBookings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/recent-bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        throw error;
    }
}

async function fetchRevenueData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/monthly-revenue`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch revenue data');
        }
        return data;
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        throw error;
    }
}

// UI Functions

// Function to animate value changes
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = Math.round(end);
            return;
        }
        element.textContent = Math.round(current);
        requestAnimationFrame(animate);
    };

    animate();
}

function updateDashboardStats(data) {
    const stats = data.stats;
    
    // Update values with animation
    animateValue('totalTrips', 0, stats.totalTrips, 1000);
    animateValue('activeDrivers', 0, stats.activeDrivers, 1000);
    animateValue('totalUsers', 0, stats.totalUsers, 1000);
    animateValue('pendingBookings', 0, stats.pendingBookings, 1000);
}

function updateRecentBookingsTable(bookings) {
    const tableBody = document.getElementById('recentBookingsTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    bookings.forEach(ride => {
        const row = document.createElement('tr');
        const date = new Date(ride.createdAt).toLocaleString();
        
        // Determine status badge color
        let statusBadgeClass = 'badge-secondary';
        switch(ride.status) {
            case 'completed':
                statusBadgeClass = 'badge-success';
                break;
            case 'cancelled':
                statusBadgeClass = 'badge-danger';
                break;
            case 'pending':
                statusBadgeClass = 'badge-warning';
                break;
        }

        row.innerHTML = `
            <td>${ride._id.slice(-6)}</td>
            <td>${ride.pickup_location.address}</td>
            <td>${ride.dropoff_location.address}</td>
            <td><span class="badge ${statusBadgeClass}">${ride.status}</span></td>
            <td>${ride.fare.toFixed(2)}</td>
            <td>${ride.payment_method}</td>
            <td><span class="badge badge-${ride.payment_status === 'pending' ? 'warning' : 'success'}">${ride.payment_status}</span></td>
            <td>${date}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateRevenueChart(revenueData) {
    const ctx = document.getElementById('myAreaChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.revenueChart) {
        window.revenueChart.destroy();
    }

    // Create new chart
    window.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueData.map(item => item.month),
            datasets: [{
                label: 'Revenue',
                data: revenueData.map(item => item.revenue),
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                pointRadius: 3,
                pointBackgroundColor: '#4e73df',
                pointBorderColor: '#4e73df',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#4e73df',
                pointHoverBorderColor: '#4e73df',
                pointHitRadius: 10,
                pointBorderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        callback: function(value) {
                            return 'kr ' + value.toLocaleString();
                        }
                    },
                    gridLines: {
                        color: 'rgb(234, 236, 244)',
                        zeroLineColor: 'rgb(234, 236, 244)',
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: 'rgb(255,255,255)',
                bodyFontColor: '#858796',
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': kr ' + tooltipItem.yLabel.toLocaleString();
                    }
                }
            }
        }
    });
}

// Initialize Dashboard
async function initializeDashboard() {
    try {
        // First validate the token
        const isValidToken = await auth.validateToken();
        if (!isValidToken) {
            // Token is invalid or expired, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // Fetch all dashboard data
        const [stats, bookings, revenue] = await Promise.all([
            fetchDashboardStats(),
            fetchRecentBookings(),
            fetchRevenueData()
        ]);

        // Update UI with fetched data
        updateDashboardStats(stats); // Pass the entire stats response
        updateRecentBookingsTable(bookings.rides);
        updateRevenueChart(revenue.lastSixMonthsRevenue);

        // Initialize DataTable for recent bookings
        $('#dataTableHover').DataTable({
            paging: false,
            searching: false,
            ordering: false,
            info: false,
            responsive: true,
            autoWidth: false,
            language: {
                emptyTable: "No recent bookings found"
            }
        });
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showAlert('Error loading dashboard data', 'error');
    }
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    document.querySelector('.container-fluid').insertBefore(alertDiv, document.querySelector('.row'));
    setTimeout(() => alertDiv.remove(), 5000);
}

// Initialize when document is ready
$(document).ready(function() {
    initializeDashboard();
}); 