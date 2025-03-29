// Driver Management Functions
let currentDriverId = null;
let pendingDriversData = null;
let currentDriverStatus = null;

// Get all drivers
async function getAllDrivers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch drivers');
        }
        return data;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
}

// Get pending drivers
async function getPendingDrivers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/get-pending-drivers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch pending drivers');
        }
        return data;
    } catch (error) {
        console.error('Error fetching pending drivers:', error);
        showAlert('Unable to connect to server. Please check if the server is running.', 'error');
        throw error;
    }
}

// Get driver by ID
async function getDriverById(driverId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${driverId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch driver');
        }
        return data;
    } catch (error) {
        console.error('Error fetching driver:', error);
        throw error;
    }
}

// Create new driver
async function createDriver(driverData) {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            },
            body: JSON.stringify(driverData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to create driver');
        }
        return data;
    } catch (error) {
        console.error('Error creating driver:', error);
        throw error;
    }
}

// Update driver
async function updateDriver(driverId, driverData) {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${driverId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            },
            body: JSON.stringify(driverData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to update driver');
        }
        return data;
    } catch (error) {
        console.error('Error updating driver:', error);
        throw error;
    }
}

// Delete driver
async function deleteDriver(driverId) {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${driverId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete driver');
        }
        return data;
    } catch (error) {
        console.error('Error deleting driver:', error);
        throw error;
    }
}

// Driver status management
async function updateDriverStatus(driverId, action) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${driverId}/${action}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || `Failed to ${action} driver`);
        }
        return data;
    } catch (error) {
        console.error(`Error ${action}ing driver:`, error);
        throw error;
    }
}

// Display pending drivers in table
function displayPendingDrivers(drivers) {
    const tableBody = document.querySelector('#pendingDriversTable tbody');
    if (!tableBody) {
        console.error('Pending drivers table body not found!');
        return;
    }

    tableBody.innerHTML = '';
    
    if (!drivers || drivers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">No pending drivers found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    pendingDriversData = drivers;
    
    drivers.forEach(driver => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${driver.user.email.split('@')[0] || 'N/A'}</td>
            <td>${driver.user.email}</td>
            <td>${driver.car.model} ${driver.car.manufacturer} (${driver.car.car_number})</td>
            <td>${new Date(driver.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="viewDriverDocuments('${driver._id}')">
                        <i class="fas fa-file-alt"></i> Review Documents
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// View driver documents
function viewDriverDocuments(driverId) {
    try {
        currentDriverId = driverId;
        
        const driver = pendingDriversData.find(d => d._id === driverId);
        if (!driver) {
            throw new Error('Driver not found in pending drivers list');
        }
        
        document.getElementById('docDriverName').textContent = driver.user.email.split('@')[0] || 'N/A';
        document.getElementById('docDriverEmail').textContent = driver.user.email;
        document.getElementById('docDriverPhone').textContent = driver.user.phone || 'N/A';
        document.getElementById('docVehicleNumber').textContent = driver.car.car_number;
        document.getElementById('docVehicleModel').textContent = `${driver.car.model} ${driver.car.manufacturer}`;
        document.getElementById('docRegistrationDate').textContent = new Date(driver.createdAt).toLocaleDateString();
        
        // Populate documents
        document.getElementById('personalDocs').innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Birth Certificate</h6>
                            <p class="card-text">Required for age verification</p>
                            <a href="${driver.personal_documents.birth_certificate}" target="_blank" class="btn btn-sm btn-primary">
                                <i class="fas fa-eye"></i> View Document
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Driving License</h6>
                            <p class="card-text">Required for driving authorization</p>
                            ${driver.personal_documents.driving_license ? 
                                `<a href="${driver.personal_documents.driving_license}" target="_blank" class="btn btn-sm btn-primary">
                                    <i class="fas fa-eye"></i> View Document
                                </a>` : 
                                '<span class="text-danger">Not uploaded</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('vehicleDocs').innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Vehicle Registration</h6>
                            <p class="card-text">Required for vehicle ownership verification</p>
                            <a href="${driver.vehicle_documents.vehicle_registration}" target="_blank" class="btn btn-sm btn-primary">
                                <i class="fas fa-eye"></i> View Document
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Insurance Policy</h6>
                            <p class="card-text">Required for vehicle insurance coverage</p>
                            <a href="${driver.vehicle_documents.insurance_policy}" target="_blank" class="btn btn-sm btn-primary">
                                <i class="fas fa-eye"></i> View Document
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#driverDocumentsModal').modal('show');
    } catch (error) {
        showAlert(error.message || 'Error loading driver documents', 'error');
    }
}

// Approve driver
async function approveDriver(driverId) {
    if (confirm('Are you sure you want to approve this driver?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${driverId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.message) {
                showAlert(data.message, 'success');
                $('#driverDocumentsModal').modal('hide');
                const pendingDrivers = await getPendingDrivers();
                displayPendingDrivers(pendingDrivers.drivers);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error approving driver:', error);
            showAlert(error.message || 'Error approving driver', 'error');
        }
    }
}

// Reject driver
async function rejectDriver(driverId) {
    if (confirm('Are you sure you want to reject this driver?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${driverId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.message) {
                showAlert(data.message, 'success');
                $('#driverDocumentsModal').modal('hide');
                const pendingDrivers = await getPendingDrivers();
                displayPendingDrivers(pendingDrivers.drivers);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error rejecting driver:', error);
            showAlert(error.message || 'Error rejecting driver', 'error');
        }
    }
}

// Initialize pending drivers table
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const pendingDrivers = await getPendingDrivers();
        if (pendingDrivers && pendingDrivers.drivers) {
            displayPendingDrivers(pendingDrivers.drivers);
        } else {
            showAlert('Error: Invalid data format received from server', 'error');
        }
    } catch (error) {
        console.error('Error in initialization:', error);
    }
});

// Add this function to get user details
async function getUserDetails(userId) {
    try {
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${userId}/user`, {
            headers: {
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch user details');
        }
        return data.data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

// Update the DataTable initialization
$(document).ready(function() {
    if ($.fn.DataTable) {
        const driverTable = $('#dataTable').DataTable({
            processing: true,
            serverSide: true,
            pageLength: 10,
            ajax: {
                url: `${window.API_CONFIG.API_BASE_URL}/drivers`,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                data: function(d) {
                    return {
                        page: (d.start / d.length) + 1,
                        limit: d.length
                    };
                },
                dataSrc: function(response) {
                    if (!response.drivers) {
                        console.error('No drivers array in response:', response);
                        showAlert('Failed to load drivers', 'error');
                        return [];
                    }

                    return response.drivers.map(driver => [
                        `<div class="d-flex align-items-center">
                            <img src="${driver.user.profile_picture || 'img/boy.png'}" class="rounded-circle mr-2" width="32" height="32">
                            ${driver.user.first_name} ${driver.user.last_name}
                        </div>`,
                        driver.user.email,
                        driver.user.phone_number,
                        driver.car ? `${driver.car.model} ${driver.car.manufacturer} (${driver.car.car_number})` : 'N/A',
                        `<span class="badge badge-${getStatusBadgeClass(driver.user.status)}">${driver.user.status}</span>`,
                        `<div class="text-warning">
                            ${generateStars(driver.reviews?.average_rating || 0)}
                            <span class="ml-1">(${driver.reviews?.total_ratings || 0})</span>
                        </div>`,
                        `<div class="btn-group">
                            <button class="btn btn-sm btn-info" onclick="viewDriver('${driver._id}', '${driver.user._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm ${driver.user.status === 'blocked' ? 'btn-success' : 'btn-danger'}" 
                                    onclick="handleBlockDriver('${driver._id}', '${driver.user.status}')">
                                <i class="fas fa-${driver.user.status === 'blocked' ? 'unlock' : 'ban'}"></i>
                            </button>
                        </div>`
                    ]);
                },
                error: function(xhr, error, thrown) {
                    console.error('DataTable error:', error);
                    showAlert('Error loading drivers data', 'error');
                }
            },
            columns: [
                { title: 'Name' },
                { title: 'Email' },
                { title: 'Phone' },
                { title: 'Vehicle' },
                { title: 'Status' },
                { title: 'Rating' },
                { title: 'Actions', orderable: false }
            ],
            order: [[0, 'asc']],
            language: {
                processing: '<i class="fas fa-spinner fa-spin"></i> Loading drivers...',
                emptyTable: 'No drivers found',
                zeroRecords: 'No matching drivers found',
                info: "Showing _START_ to _END_ of _TOTAL_ drivers",
                infoEmpty: "No drivers available",
                infoFiltered: "(filtered from _MAX_ total drivers)",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
    }
});

// Helper functions
function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'active': return 'success';
        case 'offline': return 'warning';
        case 'pending': return 'info';
        case 'blocked': return 'danger';
        default: return 'secondary';
    }
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Update the viewDriver function to use the user ID
async function viewDriver(driverId, userId) {
    try {
        // Get user details from the API
        const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${userId}/user`, {
            headers: {
                'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch user details');
        }

        const userDetails = data.data;

        // Get all the elements we need to update
        const elements = {
            name: document.getElementById('viewDriverName'),
            email: document.getElementById('viewDriverEmail'),
            phone: document.getElementById('viewDriverPhone'),
            status: document.getElementById('viewDriverStatus'),
            rating: document.getElementById('viewDriverRating'),
            vehicle: document.getElementById('viewDriverVehicle'),
            profilePic: document.getElementById('viewDriverProfilePic'),
            dob: document.getElementById('viewDriverDOB'),
            address: document.getElementById('viewDriverAddress')
        };

        // Check if any required elements are missing
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            throw new Error(`Missing required elements in the modal: ${missingElements.join(', ')}`);
        }

        // Update the elements with the user data
        elements.name.textContent = `${userDetails.first_name} ${userDetails.last_name}`;
        elements.email.textContent = userDetails.email;
        elements.phone.textContent = userDetails.phone_number;
        elements.status.textContent = userDetails.status;
        elements.dob.textContent = userDetails.dob;
        elements.address.textContent = userDetails.address;
        elements.rating.innerHTML = generateStars(userDetails.reviews?.average_rating || 0);
        elements.vehicle.textContent = userDetails.car ? 
            `${userDetails.car.model} ${userDetails.car.manufacturer} (${userDetails.car.car_number})` : 'N/A';
        
        // Update profile picture if available
        elements.profilePic.src = userDetails.profile_picture || 'img/boy.png';
        
        // Show the modal
        $('#viewDriverModal').modal('show');
    } catch (error) {
        console.error('Error viewing driver:', error);
        showAlert(error.message || 'Error loading driver details', 'error');
    }
}

async function editDriver(driverId) {
    try {
        const response = await getDriverById(driverId);
        if (!response.success) {
            throw new Error(response.message || 'Failed to load driver details');
        }
        populateEditForm(response.data);
        $('#editDriverModal').modal('show');
    } catch (error) {
        showAlert(error.message || 'Error loading driver details', 'error');
    }
}

async function handleDeleteDriver(driverId) {
    if (confirm('Are you sure you want to delete this driver?')) {
        try {
            const response = await deleteDriver(driverId);
            if (!response.success) {
                throw new Error(response.message || 'Failed to delete driver');
            }
            showAlert('Driver deleted successfully', 'success');
            $('#dataTable').DataTable().ajax.reload();
        } catch (error) {
            showAlert(error.message || 'Error deleting driver', 'error');
        }
    }
}

// Form handlers
async function handleAddDriver(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const driverData = Object.fromEntries(formData.entries());
    
    try {
        const response = await createDriver(driverData);
        if (!response.success) {
            throw new Error(response.message || 'Failed to add driver');
        }
        showAlert('Driver added successfully', 'success');
        $('#addDriverModal').modal('hide');
        $('#dataTable').DataTable().ajax.reload();
    } catch (error) {
        showAlert(error.message || 'Error adding driver', 'error');
    }
}

async function handleEditDriver(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const driverId = formData.get('driverId');
    const driverData = Object.fromEntries(formData.entries());
    
    try {
        const response = await updateDriver(driverId, driverData);
        if (!response.success) {
            throw new Error(response.message || 'Failed to update driver');
        }
        showAlert('Driver updated successfully', 'success');
        $('#editDriverModal').modal('hide');
        $('#dataTable').DataTable().ajax.reload();
    } catch (error) {
        showAlert(error.message || 'Error updating driver', 'error');
    }
}

// UI helpers
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

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add driver form
    document.getElementById('addDriverForm').addEventListener('submit', handleAddDriver);
    
    // Edit driver form
    document.getElementById('editDriverForm').addEventListener('submit', handleEditDriver);
});

// Add the block/unblock handler function
function handleBlockDriver(driverId, status) {
    currentDriverId = driverId;
    currentDriverStatus = status;
    const isBlocking = status !== 'blocked';
    const modal = $('#blockDriverModal');
    const actionText = isBlocking ? 'block' : 'unblock';
    
    modal.find('#blockDriverModalLabel').text(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Driver`);
    modal.find('#blockActionText').text(actionText);
    modal.find('#confirmBlockBtn').text(`Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`);
    modal.find('#confirmBlockBtn').removeClass('btn-danger btn-success').addClass(isBlocking ? 'btn-danger' : 'btn-success');
    
    modal.modal('show');
}

// Add the confirmation handler
$(document).ready(function() {
    // Existing DataTable initialization code...
    
    // Add the block/unblock confirmation handler
    $('#confirmBlockBtn').on('click', async function() {
        try {
            const endpoint = currentDriverStatus === 'blocked' ? 'unblock' : 'block';
            const response = await fetch(`${window.API_CONFIG.API_BASE_URL}/drivers/${currentDriverId}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${window.API_CONFIG.TEST_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update driver status');
            }

            showAlert(`Driver ${endpoint}ed successfully`, 'success');
            $('#blockDriverModal').modal('hide');
            $('#dataTable').DataTable().ajax.reload();
        } catch (error) {
            console.error('Error updating driver status:', error);
            showAlert('Failed to update driver status', 'error');
        }
    });
}); 