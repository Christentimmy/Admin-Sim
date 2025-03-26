// Constants
const API_BASE_URL = 'http://192.168.1.108:5000/admin';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YWE5NDVjMTVjMTk5OGQ4NTUzODVjZSIsInJvbGUiOiJzdXBlciIsImlhdCI6MTc0Mjk5MjU4NywiZXhwIjoxNzQzMDc4OTg3fQ.bwJn7uEU7WzH9lITqGw4LzWAnLkpk7SXHN3p_g-6O2I';

let currentUserId = null;
let currentUserStatus = null;

// Initialize DataTable
$(document).ready(function() {
    const userTable = $('#dataTableHover').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: `${API_BASE_URL}/users`,
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            },
            data: function(d) {
                return {
                    page: (d.start / d.length) + 1,
                    limit: d.length
                };
            },
            dataSrc: function(response) {
                // Update the DataTables pagination info
                const totalRecords = response.totalUsers;
                const totalPages = response.totalPages;
                
                userTable.page.info().recordsTotal = totalRecords;
                userTable.page.info().recordsFiltered = totalRecords;
                userTable.page.info().pages = totalPages;

                return response.users.map(user => [
                    `<div class="d-flex align-items-center">
                        <img src="${user.profile_picture || 'img/boy.png'}" class="rounded-circle mr-2" width="32" height="32">
                        ${user.first_name || ''} ${user.last_name || ''}
                     </div>`,
                    user.email,
                    user.phone_number || 'N/A',
                    `<span class="badge badge-${getStatusBadgeClass(user.status)}">${user.status}</span>`,
                    new Date(user.createdAt).toLocaleDateString(),
                    `<div class="btn-group">
                        <button class="btn btn-sm ${user.status === 'blocked' ? 'btn-success' : 'btn-danger'}" 
                                onclick="handleBlockUser('${user._id}', '${user.status}')">
                            <i class="fas fa-${user.status === 'blocked' ? 'unlock' : 'ban'}"></i>
                            ${user.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>
                     </div>`
                ]);
            },
            error: function(xhr, error, thrown) {
                console.error('Error loading users:', error);
                showAlert('Error loading users data', 'error');
            }
        },
        columns: [
            { title: 'Name' },
            { title: 'Email' },
            { title: 'Phone' },
            { title: 'Status' },
            { title: 'Joined Date' },
            { title: 'Actions' }
        ],
        order: [[4, 'desc']], // Sort by joined date by default
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        language: {
            processing: '<i class="fas fa-spinner fa-spin"></i> Loading users...',
            emptyTable: 'No users found',
            zeroRecords: 'No matching users found',
            info: "Showing _START_ to _END_ of _TOTAL_ users",
            infoEmpty: "Showing 0 to 0 of 0 users",
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

            // Update pagination UI
            if (pageInfo.pages <= 1) {
                $('.dataTables_paginate').hide();
            } else {
                $('.dataTables_paginate').show();
            }

            // Add loading state to pagination buttons during processing
            $('.paginate_button').prop('disabled', settings.bProcessing);
        }
    });

    // Add loading state handling
    userTable.on('processing.dt', function(e, settings, processing) {
        if (processing) {
            $('#dataTableHover_wrapper').addClass('processing');
        } else {
            $('#dataTableHover_wrapper').removeClass('processing');
        }
    });
});

// Handle block/unblock user
function handleBlockUser(userId, status) {
    currentUserId = userId;
    currentUserStatus = status;
    const isBlocking = status !== 'blocked';
    const modal = $('#blockUserModal');
    const actionText = isBlocking ? 'block' : 'unblock';
    
    modal.find('#blockUserModalLabel').text(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} User`);
    modal.find('#blockActionText').text(actionText);
    modal.find('#confirmBlockBtn')
        .text(`Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`)
        .removeClass('btn-danger btn-success')
        .addClass(isBlocking ? 'btn-danger' : 'btn-success');
    
    modal.modal('show');
}

// Confirm block/unblock action
$('#confirmBlockBtn').on('click', async function() {
    try {
        const action = currentUserStatus === 'blocked' ? 'unblock' : 'block';
        const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/${action}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to ${action} user`);
        }

        const data = await response.json();
        
        if (data.success) {
            showAlert(`User ${action}ed successfully`, 'success');
            $('#blockUserModal').modal('hide');
            $('#dataTableHover').DataTable().ajax.reload(null, false); // Reload current page
        } else {
            throw new Error(data.message || `Failed to ${action} user`);
        }
    } catch (error) {
        console.error(`Error ${currentUserStatus === 'blocked' ? 'unblocking' : 'blocking'} user:`, error);
        showAlert(error.message, 'error');
    }
});

// Helper Functions
function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'active': return 'success';
        case 'blocked': return 'danger';
        case 'pending': return 'warning';
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

// Add some CSS for loading state
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
`;
document.head.appendChild(style); 