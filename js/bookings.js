// Constants
const API_BASE_URL = 'http://192.168.1.108:5000/admin';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YWE5NDVjMTVjMTk5OGQ4NTUzODVjZSIsInJvbGUiOiJzdXBlciIsImlhdCI6MTc0Mjk5MjU4NywiZXhwIjoxNzQzMDc4OTg3fQ.bwJn7uEU7WzH9lITqGw4LzWAnLkpk7SXHN3p_g-6O2I';

let currentStatus = 'all';

// Initialize DataTable
$(document).ready(function() {
    const bookingsTable = $('#dataTableHover').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: `${API_BASE_URL}/history`,
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            },
            data: function(d) {
                return {
                    page: (d.start / d.length) + 1,
                    limit: d.length,
                    status: currentStatus === 'all' ? '' : currentStatus
                };
            },
            dataSrc: function(response) {
                // Update the DataTables pagination info
                const totalRecords = response.totalRides;
                const totalPages = response.totalPages;
                
                bookingsTable.page.info().recordsTotal = totalRecords;
                bookingsTable.page.info().recordsFiltered = totalRecords;
                bookingsTable.page.info().pages = totalPages;

                return response.rides.map(ride => {
                    const shortAddress = (location) => {
                        if (!location || !location.address) return 'N/A';
                        const parts = location.address.split(',');
                        return parts[0] || 'N/A';
                    };

                    return [
                        formatUserInfo(ride.customer),
                        shortAddress(ride.pickup_location),
                        shortAddress(ride.dropoff_location),
                        `<span class="badge badge-${getStatusBadgeClass(ride.status)}">${ride.status}</span>`,
                        new Date(ride.createdAt).toLocaleString(),
                        formatAmount(ride.amount),
                        ride._id // Hidden column for ride ID
                    ];
                });
            },
            error: function(xhr, error, thrown) {
                console.error('Error loading bookings:', error);
                showAlert('Error loading bookings data', 'error');
            }
        },
        columns: [
            { title: 'Rider' },
            { title: 'From' },
            { title: 'To' },
            { title: 'Status' },
            { title: 'Date' },
            { title: 'Amount' },
            { 
                title: 'ID',
                visible: false
            }
        ],
        order: [[4, 'desc']], // Sort by date by default
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        language: {
            processing: '<i class="fas fa-spinner fa-spin"></i> Loading bookings...',
            emptyTable: 'No bookings found',
            zeroRecords: 'No matching bookings found',
            info: "Showing _START_ to _END_ of _TOTAL_ bookings",
            infoEmpty: "Showing 0 to 0 of 0 bookings",
            infoFiltered: "",
            paginate: {
                first: '<i class="fas fa-angle-double-left"></i>',
                previous: '<i class="fas fa-angle-left"></i>',
                next: '<i class="fas fa-angle-right"></i>',
                last: '<i class="fas fa-angle-double-right"></i>'
            }
        },
        drawCallback: function(settings) {
            const api = this.api();
            const pageInfo = api.page.info();

            if (pageInfo.pages <= 1) {
                $('.dataTables_paginate').hide();
            } else {
                $('.dataTables_paginate').show();
            }

            $('.paginate_button').prop('disabled', settings.bProcessing);
        }
    });

    // Add row click handler
    $('#dataTableHover tbody').on('click', 'tr', function() {
        const data = bookingsTable.row(this).data();
        if (data) {
            const rideId = data[6]; // Get the hidden ride ID
            showRideDetails(rideId);
        }
    });

    // Add loading state handling
    bookingsTable.on('processing.dt', function(e, settings, processing) {
        if (processing) {
            $('#dataTableHover_wrapper').addClass('processing');
        } else {
            $('#dataTableHover_wrapper').removeClass('processing');
        }
    });

    // Handle status filter
    $('.dropdown-item').on('click', function(e) {
        e.preventDefault();
        const status = $(this).data('status');
        currentStatus = status;
        $('#statusFilter').text(`Filter by Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`);
        bookingsTable.ajax.reload();
    });
});

// Show ride details in modal
async function showRideDetails(rideId) {
    try {
        const response = await fetch(`${API_BASE_URL}/ride-details/${rideId}`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ride details');
        }

        const data = await response.json();
        
        // Update modal content
        $('#riderInfo').html(formatDetailedUserInfo(data.rider));
        $('#driverInfo').html(formatDetailedUserInfo(data.driver));
        
        $('#pickupLocation').text(data.ride.pickup_location.address);
        $('#dropoffLocation').text(data.ride.dropoff_location.address);
        $('#requestedAt').text(new Date(data.ride.requested_at).toLocaleString());
        
        $('#tripStatus').html(`<span class="badge badge-${getStatusBadgeClass(data.ride.status)}">${data.ride.status}</span>`);
        $('#paymentMethod').text(data.ride.payment_method);
        $('#paymentStatus').html(`<span class="badge badge-${getPaymentStatusBadgeClass(data.ride.payment_status)}">${data.ride.payment_status}</span>`);
        $('#tripFare').text(formatAmount(data.ride.fare));

        // Show modal
        $('#rideDetailsModal').modal('show');
    } catch (error) {
        console.error('Error fetching ride details:', error);
        showAlert('Error loading ride details', 'error');
    }
}

// Helper Functions
function formatUserInfo(user) {
    if (!user) return 'N/A';
    return `<div class="d-flex align-items-center">
                <img src="${user.profile_picture || 'img/boy.png'}" class="rounded-circle mr-2" width="32" height="32">
                <div>${user.first_name} ${user.last_name}</div>
            </div>`;
}

function formatDetailedUserInfo(user) {
    if (!user) return 'N/A';
    return `<div class="text-center mb-3">
                <img src="${user.profile_picture || 'img/boy.png'}" class="rounded-circle mb-2" width="64" height="64">
                <h5 class="mb-0">${user.first_name} ${user.last_name}</h5>
                <p class="text-muted mb-1">${user.email}</p>
                <p class="mb-0"><i class="fas fa-phone mr-2"></i>${user.phone_number}</p>
            </div>`;
}

function formatAmount(amount) {
    if (!amount) return 'kr 0,00';
    return new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: 'NOK'
    }).format(amount);
}

function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'completed': return 'success';
        case 'pending': return 'warning';
        case 'accepted': return 'info';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

function getPaymentStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'completed':
        case 'paid': return 'success';
        case 'pending': return 'warning';
        case 'failed': return 'danger';
        default: return 'secondary';
    }
}

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

// Add some CSS for loading state and interactivity
const style = document.createElement('style');
style.textContent = `
    #dataTableHover_wrapper.processing {
        opacity: 0.7;
        pointer-events: none;
    }
    #dataTableHover_wrapper.processing tbody {
        position: relative;
    }
    #dataTableHover_wrapper.processing tbody:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.7);
    }
    #dataTableHover tbody tr {
        cursor: pointer;
    }
    #dataTableHover tbody tr:hover {
        background-color: rgba(0,0,0,.05);
    }
`;
document.head.appendChild(style); 