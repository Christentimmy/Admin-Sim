// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: 'NOK'
    }).format(amount);
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Function to get status badge class
function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'refunded':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'rejected':
            return 'badge-danger';
        case 'successful':
            return 'badge-success';
        case 'failed':
            return 'badge-danger';
        default:
            return 'badge-secondary';
    }
}

// Function to format status text
function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Function to update refund statistics
async function updateRefundStats() {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/refunds/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch refund statistics');
        }

        const data = await response.json();
        
        // Update the stats in the UI
        document.getElementById('totalRefunds').textContent = data.stats.totalRefunds;
        document.getElementById('pendingRefunds').textContent = data.stats.pendingRefunds;
        document.getElementById('totalRefundAmount').textContent = formatCurrency(data.stats.totalRefundAmount);
        document.getElementById('approvalRate').textContent = data.stats.approvalRate;

        // Update the stats cards with animations
        animateValue('totalRefunds', 0, data.stats.totalRefunds, 1000);
        animateValue('pendingRefunds', 0, data.stats.pendingRefunds, 1000);
        animateValue('totalRefundAmount', 0, data.stats.totalRefundAmount, 1000);
        animateValue('approvalRate', 0, parseFloat(data.stats.approvalRate), 1000);

    } catch (error) {
        console.error('Error fetching refund statistics:', error);
        showAlert('Failed to load refund statistics', 'error');
    }
}

// Function to fetch and display refunds
async function fetchAndDisplayRefunds() {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/get-all-refunds`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch refunds');
        }

        const data = await response.json();
        const refundsTableBody = document.getElementById('refundsTableBody');
        refundsTableBody.innerHTML = ''; // Clear existing content

        data.refunds.forEach(refund => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.innerHTML = `
                <td>${refund.fullname}</td>
                <td>${formatCurrency(refund.amount)}</td>
                <td>${formatDate(refund.date)}</td>
                <td><span class="badge ${getStatusBadgeClass(refund.status)}">${refund.status}</span></td>
            `;
            
            // Add click event to show refund details
            row.addEventListener('click', () => showRefundDetails(refund.refund_id));
            
            refundsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching refunds:', error);
        showAlert('Failed to load refunds list', 'error');
    }
}

// Function to show refund details
async function showRefundDetails(refundId) {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/refund-details/${refundId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch refund details');
        }

        const data = await response.json();
        const refund = data.refund;

        // Update status badges
        const refundStatusBadge = document.getElementById('refundStatus');
        const paymentStatusBadge = document.getElementById('paymentStatus');
        
        refundStatusBadge.className = `badge badge-lg ${getStatusBadgeClass(refund.status)}`;
        refundStatusBadge.textContent = formatStatus(refund.status);
        
        paymentStatusBadge.className = `badge badge-lg ${getStatusBadgeClass(refund.financial.paymentStatus)}`;
        paymentStatusBadge.textContent = formatStatus(refund.financial.paymentStatus);

        // Update customer information
        document.getElementById('customerName').textContent = refund.customer.fullName;
        document.getElementById('customerEmail').textContent = refund.customer.email;
        document.getElementById('customerPhone').textContent = refund.customer.phone;

        // Update trip information
        document.getElementById('tripDate').textContent = formatDate(refund.trip.date);
        document.getElementById('pickupLocation').textContent = refund.trip.pickupLocation;
        document.getElementById('dropoffLocation').textContent = refund.trip.dropoffLocation;

        // Update driver information
        document.getElementById('driverName').textContent = refund.driver.fullName;
        document.getElementById('driverPhone').textContent = refund.driver.phone;
        document.getElementById('driverRating').textContent = `${refund.driver.rating} / 5`;

        // Update financial details
        document.getElementById('refundAmount').textContent = formatCurrency(refund.amount);
        document.getElementById('paymentMethod').textContent = refund.trip.paymentMethod;
        document.getElementById('transactionId').textContent = refund.financial.paymentTransactionId;

        // Set the refund ID on the buttons
        const approveBtn = document.getElementById('approveRefundBtn');
        const rejectBtn = document.getElementById('rejectRefundBtn');
        
        approveBtn.setAttribute('data-refund-id', refundId);
        rejectBtn.setAttribute('data-refund-id', refundId);
        
        // Show buttons based on status
        if (refund.status === 'pending') {
            approveBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'inline-block';
        } else {
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        }

        // Show the modal and set aria-hidden to false
        $('#refundDetailsModal').modal('show').attr('aria-hidden', 'false');

    } catch (error) {
        console.error('Error fetching refund details:', error);
        showAlert('Failed to load refund details', 'error');
    }
}

// Function to animate value changes
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = elementId === 'approvalRate' ? 
                `${end.toFixed(2)}%` : 
                elementId === 'totalRefundAmount' ? 
                    formatCurrency(end) : 
                    Math.round(end);
            return;
        }
        element.textContent = elementId === 'approvalRate' ? 
            `${current.toFixed(2)}%` : 
            elementId === 'totalRefundAmount' ? 
                formatCurrency(current) : 
                Math.round(current);
        requestAnimationFrame(animate);
    };

    animate();
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
    
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Function to approve refund
async function approveRefund(refundId) {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/refunds/approve/${refundId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to approve refund');
        }

        const data = await response.json();
        showAlert('Refund approved successfully', 'success');
        
        // Close the modal and refresh the data
        $('#refundDetailsModal').modal('hide');
        updateRefundStats();
        fetchAndDisplayRefunds();

    } catch (error) {
        console.error('Error approving refund:', error);
        showAlert(error.message || 'Failed to approve refund', 'error');
    }
}

// Function to reject refund
async function rejectRefund(refundId) {
    // Show a prompt for rejection reason
    const reason = prompt('Please provide a reason for rejecting the refund:');
    if (!reason) return; // If user cancels or provides no reason

    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/refunds/cancel`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            },
            body: JSON.stringify({
                refund_id: refundId,
                reason: reason
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to reject refund');
        }

        const data = await response.json();
        showAlert('Refund rejected successfully', 'success');
        
        // Close the modal and refresh the data
        $('#refundDetailsModal').modal('hide');
        updateRefundStats();
        fetchAndDisplayRefunds();

    } catch (error) {
        console.error('Error rejecting refund:', error);
        showAlert(error.message || 'Failed to reject refund', 'error');
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    updateRefundStats();
    fetchAndDisplayRefunds();

    // Set up auto-refresh every 5 minutes
    setInterval(() => {
        updateRefundStats();
        fetchAndDisplayRefunds();
    }, 300000);

    // Add event listeners for approve and reject buttons
    document.getElementById('approveRefundBtn').addEventListener('click', function() {
        const refundId = this.getAttribute('data-refund-id');
        if (refundId) {
            approveRefund(refundId);
        }
    });

    document.getElementById('rejectRefundBtn').addEventListener('click', function() {
        const refundId = this.getAttribute('data-refund-id');
        if (refundId) {
            rejectRefund(refundId);
        }
    });

    // Add event listener for modal hide
    $('#refundDetailsModal').on('hidden.bs.modal', function () {
        $(this).attr('aria-hidden', 'true');
    });
}); 