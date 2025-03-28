$(document).ready(function() {
    // Initialize DataTable for all payments
    const paymentsTable = $('#dataTableHover').DataTable({
        processing: true,
        serverSide: false,
        order: [[4, 'desc']], // Sort by date by default
        columns: [
            { data: 'transaction_id' },
            { 
                data: 'user',
                render: function(data) {
                    return `${data.first_name} ${data.last_name}`;
                }
            },
            { 
                data: 'amount',
                render: function(data) {
                    return `$${(data / 100).toFixed(2)}`;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    let badgeClass = 'success';
                    if (data === 'pending') badgeClass = 'warning';
                    if (data === 'failed') badgeClass = 'danger';
                    return `<span class="badge badge-${badgeClass}">${data}</span>`;
                }
            },
            { 
                data: 'created_at',
                render: function(data) {
                    return new Date(data).toLocaleString();
                }
            },
            { 
                data: 'processed_at',
                render: function(data) {
                    return data ? new Date(data).toLocaleString() : '-';
                }
            }
        ]
    });

    // Initialize DataTable for driver payments
    const driverPaymentsTable = $('#driverPaymentsTable').DataTable({
        processing: true,
        serverSide: false,
        order: [[4, 'desc']], // Sort by date by default
        columns: [
            { data: 'transaction_id' },
            { 
                data: 'ride',
                render: function(data) {
                    return `${data.pickup_location.address} → ${data.dropoff_location.address}`;
                }
            },
            { 
                data: 'amount',
                render: function(data) {
                    return `$${(data / 100).toFixed(2)}`;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    let badgeClass = 'success';
                    if (data === 'pending') badgeClass = 'warning';
                    if (data === 'failed') badgeClass = 'danger';
                    return `<span class="badge badge-${badgeClass}">${data}</span>`;
                }
            },
            { 
                data: 'created_at',
                render: function(data) {
                    return new Date(data).toLocaleString();
                }
            },
            { 
                data: 'processed_at',
                render: function(data) {
                    return data ? new Date(data).toLocaleString() : '-';
                }
            }
        ]
    });

    // Function to fetch all payments
    async function fetchAllPayments() {
        try {
            const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/payments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                paymentsTable.clear().rows.add(data.payments).draw();
            } else {
                showAlert('Failed to fetch payments', 'error');
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            showAlert('Error fetching payments', 'error');
        }
    }

    // Function to fetch driver payment history
    async function fetchDriverPayments(email) {
        try {
            const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/driver-payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (data.success) {
                driverPaymentsTable.clear().rows.add(data.payments).draw();
                $('#driverPaymentsModal').modal('show');
            } else {
                showAlert('Failed to fetch driver payments', 'error');
            }
        } catch (error) {
            console.error('Error fetching driver payments:', error);
            showAlert('Error fetching driver payments', 'error');
        }
    }

    // Function to show alerts
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        document.querySelector('.container-fluid').insertBefore(alertDiv, document.querySelector('.row'));
        setTimeout(() => alertDiv.remove(), 5000);
    }

    // Initial load of payments
    fetchAllPayments();

    // Handle driver payments button click
    document.querySelector('a[href="driver-payments.html"]').addEventListener('click', function(e) {
        e.preventDefault();
        $('#driverEmailModal').modal('show');
    });

    // Handle driver email form submission
    document.getElementById('driverEmailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('driverEmail').value;
        if (email) {
            fetchDriverPayments(email);
            $('#driverEmailModal').modal('hide');
        } else {
            showAlert('Please enter a driver email', 'error');
        }
    });
}); 