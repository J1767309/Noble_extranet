import { supabase } from './supabase-config.js';

let allUsers = [];
let currentUserId = null;
let userToDelete = null;

// Check authentication and load users
async function initPage() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Check if user is admin
    const { data: userData, error } = await supabase
        .from('users')
        .select('role, user_type')
        .eq('id', session.user.id)
        .single();

    if (error || !userData || userData.role !== 'admin') {
        // Not an admin, redirect to dashboard
        alert('Access denied. User Management is only available to administrators.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Show BI Tools link for internal users
    if (userData.user_type === 'internal') {
        const biToolsLink = document.getElementById('bi-tools-link');
        if (biToolsLink) biToolsLink.style.display = 'flex';
    }

    document.getElementById('user-email').textContent = session.user.email;
    await loadUsers();
}

// Initialize page
initPage();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
    }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
});

// Load all users from database
async function loadUsers() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    try {
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allUsers = data || [];

        displayUsers(allUsers);
        loadingIndicator.style.display = 'none';
    } catch (error) {
        console.error('Error loading users:', error);
        loadingIndicator.style.display = 'none';
        showError('Error loading users. Please refresh the page.');
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-results">No users found</td></tr>';
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');

        const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
        const userTypeBadge = user.user_type === 'internal' ?
            '<span class="badge badge-internal">Internal</span>' :
            '<span class="badge badge-external">External</span>';

        // Role badge with different colors
        let roleBadge = '';
        if (user.role === 'admin') {
            roleBadge = '<span class="badge badge-admin">Admin</span>';
        } else if (user.role === 'creator') {
            roleBadge = '<span class="badge badge-creator">Creator</span>';
        } else if (user.role === 'editor') {
            roleBadge = '<span class="badge badge-editor">Editor</span>';
        } else {
            roleBadge = '<span class="badge badge-readonly">Read-only</span>';
        }

        tr.innerHTML = `
            <td>${user.name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${userTypeBadge}</td>
            <td>${roleBadge}</td>
            <td>${createdDate}</td>
            <td class="actions-cell">
                <button class="btn-icon btn-edit" data-user-id="${user.id}" title="Edit user">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon btn-reset-password" data-user-id="${user.id}" data-user-email="${user.email}" title="Reset password">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </button>
                <button class="btn-icon btn-delete" data-user-id="${user.id}" title="Delete user">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-user-id');
            openEditModal(userId);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-user-id');
            openDeleteModal(userId);
        });
    });

    // Add event listeners to reset password buttons
    document.querySelectorAll('.btn-reset-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-user-id');
            const userEmail = e.currentTarget.getAttribute('data-user-email');
            openResetPasswordModal(userId, userEmail);
        });
    });
}

// Filter users by type
document.getElementById('filter-type').addEventListener('change', (e) => {
    filterAndDisplayUsers();
});

// Search users
document.getElementById('search-input').addEventListener('input', (e) => {
    filterAndDisplayUsers();
});

function filterAndDisplayUsers() {
    const filterType = document.getElementById('filter-type').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    let filtered = allUsers;

    // Filter by type
    if (filterType !== 'all') {
        filtered = filtered.filter(user => user.user_type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
        filtered = filtered.filter(user => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            return name.includes(searchQuery) || email.includes(searchQuery);
        });
    }

    displayUsers(filtered);
}

// Create User Modal Functions
function openCreateModal() {
    document.getElementById('create-modal').style.display = 'block';
}

function closeCreateModal() {
    document.getElementById('create-modal').style.display = 'none';
    document.getElementById('create-user-form').reset();
}

// Handle create user button click
document.getElementById('create-user-btn').addEventListener('click', () => {
    openCreateModal();
});

// Handle create user form submission
document.getElementById('create-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('create-name').value;
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const userType = document.getElementById('create-user-type').value;
    const role = document.getElementById('create-role').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        // Call Edge Function to create user in both auth and database
        const { data, error } = await supabase.functions.invoke('create-user', {
            body: {
                email: email,
                password: password,
                name: name,
                userType: userType,
                role: role
            }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        // Add new user to local array
        allUsers.push({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            user_type: data.user.user_type,
            role: data.user.role,
            created_at: new Date().toISOString()
        });

        // Sort by creation date (newest first)
        allUsers.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        closeCreateModal();
        filterAndDisplayUsers();
        showSuccess('User created successfully!');
    } catch (error) {
        console.error('Error creating user:', error);
        showError('Error creating user: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Edit Modal Functions
function openEditModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-user-type').value = user.user_type || 'external';
    document.getElementById('edit-role').value = user.role || 'read-only';

    document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-user-form').reset();
}

// Handle edit form submission
document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-name').value;
    const userType = document.getElementById('edit-user-type').value;
    const role = document.getElementById('edit-role').value;

    try {
        const { error } = await supabase
            .from('users')
            .update({
                name: name,
                user_type: userType,
                role: role
            })
            .eq('id', userId);

        if (error) throw error;

        // Update local array
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            allUsers[userIndex].name = name;
            allUsers[userIndex].user_type = userType;
            allUsers[userIndex].role = role;
        }

        closeEditModal();
        filterAndDisplayUsers();
        showSuccess('User updated successfully!');
    } catch (error) {
        console.error('Error updating user:', error);
        showError('Error updating user. Please try again.');
    }
});

// Delete Modal Functions
function openDeleteModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    userToDelete = user;

    document.getElementById('delete-user-info').innerHTML = `
        <strong>Name:</strong> ${user.name || 'N/A'}<br>
        <strong>Email:</strong> ${user.email || 'N/A'}
    `;

    document.getElementById('delete-modal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    userToDelete = null;
}

// Handle delete confirmation
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!userToDelete) return;

    const deleteBtn = document.getElementById('confirm-delete-btn');
    const originalText = deleteBtn.textContent;
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';

    try {
        // Call Edge Function to delete user from both auth and database
        const { data, error } = await supabase.functions.invoke('delete-user', {
            body: { userId: userToDelete.id }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        // Remove from local array
        allUsers = allUsers.filter(u => u.id !== userToDelete.id);

        closeDeleteModal();
        filterAndDisplayUsers();
        showSuccess('User deleted successfully from both authentication and database!');
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Error deleting user: ' + error.message);
        deleteBtn.disabled = false;
        deleteBtn.textContent = originalText;
    }
});

// Reset Password Modal Functions
let userToResetPassword = null;

function openResetPasswordModal(userId, userEmail) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    userToResetPassword = user;

    document.getElementById('reset-user-info').innerHTML = `
        <strong>Name:</strong> ${user.name || 'N/A'}<br>
        <strong>Email:</strong> ${user.email || 'N/A'}
    `;

    document.getElementById('reset-password-modal').style.display = 'block';
    document.getElementById('reset-password-form').reset();
}

function closeResetPasswordModal() {
    document.getElementById('reset-password-modal').style.display = 'none';
    document.getElementById('reset-password-form').reset();
    userToResetPassword = null;
}

// Handle reset password form submission
document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!userToResetPassword) return;

    const newPassword = document.getElementById('admin-new-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    try {
        // Save email before closing modal (since closeResetPasswordModal sets userToResetPassword to null)
        const userEmail = userToResetPassword.email;

        // Call Edge Function to reset user password
        const { data, error } = await supabase.functions.invoke('reset-user-password', {
            body: {
                userId: userToResetPassword.id,
                newPassword: newPassword
            }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        closeResetPasswordModal();
        showSuccess(`Password reset successfully for ${userEmail}!`);
    } catch (error) {
        console.error('Error resetting password:', error);
        showError('Error resetting password: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Modal close handlers
document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeCreateModal();
        closeEditModal();
        closeDeleteModal();
        closeResetPasswordModal();
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeCreateModal();
        closeEditModal();
        closeDeleteModal();
        closeResetPasswordModal();
    }
});

// Error and Success messages
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.className = 'success-message';
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorDiv.className = 'error-message';
    }, 3000);
}
