import { supabase } from './supabase-config.js';

let currentUser = null;
let allReports = [];
let allUsers = [];
let editingReportId = null;
let deletingReportId = null;

// Check authentication state and load user data
async function loadUserData() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        console.log('No session found, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    try {
        const userId = session.user.id;
        const userEmail = session.user.email;

        // Get user data from database
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
            document.getElementById('user-email').textContent = userEmail;
            return;
        }

        currentUser = userData;
        document.getElementById('user-email').textContent = userEmail;

        // Check if user is admin
        if (userData.role !== 'admin') {
            alert('You do not have permission to access this page.');
            window.location.href = 'dashboard.html';
            return;
        }

        // Show Bug Management link for admins
        const bugMgmtLink = document.getElementById('bug-management-link');
        if (bugMgmtLink) bugMgmtLink.style.display = 'flex';

        // Show User Management link for admins
        const userMgmtLink = document.getElementById('user-management-link');
        if (userMgmtLink) userMgmtLink.style.display = 'flex';

        // Show internal user links
        if (userData.user_type === 'internal') {
            const hotelTrackerLink = document.getElementById('hotel-tracker-link');
            const hotelTopAccountsLink = document.getElementById('hotel-top-accounts-link');
            const initiativesLink = document.getElementById('initiatives-link');
            const biToolsLink = document.getElementById('bi-tools-link');
            if (hotelTrackerLink) hotelTrackerLink.style.display = 'flex';
            if (hotelTopAccountsLink) hotelTopAccountsLink.style.display = 'flex';
            if (initiativesLink) initiativesLink.style.display = 'flex';
            if (biToolsLink) biToolsLink.style.display = 'flex';
        }

        // Load data
        await loadUsers();
        await loadReports();
    } catch (error) {
        console.error('Error:', error);
        const userEmail = session.user.email;
        document.getElementById('user-email').textContent = userEmail;
    }
}

// Load all users for the reporter filter
async function loadUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email')
            .order('name');

        if (error) throw error;

        allUsers = users || [];

        const filterReporter = document.getElementById('filter-reporter');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name || user.email;
            filterReporter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load all bug reports
async function loadReports() {
    try {
        const { data: reports, error } = await supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allReports = reports || [];
        updateStats();
        renderReports();
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('reports-table-body').innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <p>Error loading reports. Please try refreshing the page.</p>
                </td>
            </tr>
        `;
    }
}

// Update statistics
function updateStats() {
    const stats = {
        total: allReports.length,
        open: allReports.filter(r => r.status === 'open').length,
        in_progress: allReports.filter(r => r.status === 'in_progress').length,
        resolved: allReports.filter(r => r.status === 'resolved').length,
        critical: allReports.filter(r => r.priority === 'critical').length
    };

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-open').textContent = stats.open;
    document.getElementById('stat-in-progress').textContent = stats.in_progress;
    document.getElementById('stat-resolved').textContent = stats.resolved;
    document.getElementById('stat-critical').textContent = stats.critical;
}

// Render reports table
function renderReports() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const statusFilter = document.getElementById('filter-status').value;
    const priorityFilter = document.getElementById('filter-priority').value;
    const reporterFilter = document.getElementById('filter-reporter').value;

    let filteredReports = allReports.filter(report => {
        const matchesSearch = !searchTerm ||
            report.title.toLowerCase().includes(searchTerm) ||
            report.description.toLowerCase().includes(searchTerm) ||
            (report.page_url && report.page_url.toLowerCase().includes(searchTerm));

        const matchesType = !typeFilter || report.type === typeFilter;
        const matchesStatus = !statusFilter || report.status === statusFilter;
        const matchesPriority = !priorityFilter || report.priority === priorityFilter;
        const matchesReporter = !reporterFilter || report.reported_by === reporterFilter;

        return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesReporter;
    });

    const tbody = document.getElementById('reports-table-body');

    if (filteredReports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No reports found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredReports.map(report => {
        const createdDate = new Date(report.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const reporter = allUsers.find(u => u.id === report.reported_by);
        const reporterName = reporter ? (reporter.name || reporter.email) : 'Unknown';

        const statusLabel = report.status.replace('_', ' ');
        const priorityLabel = report.priority.charAt(0).toUpperCase() + report.priority.slice(1);
        const typeLabel = report.type === 'feature' ? 'Feature' : 'Bug';
        const typeClass = report.type === 'feature' ? 'type-feature' : 'type-bug';

        return `
            <tr data-report-id="${report.id}">
                <td>
                    <div style="max-width: 250px;">
                        <strong>${escapeHtml(report.title)}</strong>
                        <div class="description-cell" title="${escapeHtml(report.description)}">
                            ${escapeHtml(report.description)}
                        </div>
                    </div>
                </td>
                <td><span class="badge ${typeClass}">${typeLabel}</span></td>
                <td><span class="badge status-${report.status}">${statusLabel}</span></td>
                <td><span class="badge priority-${report.priority}">${priorityLabel}</span></td>
                <td>${escapeHtml(reporterName)}</td>
                <td>${report.page_url ? escapeHtml(report.page_url) : '-'}</td>
                <td>${createdDate}</td>
                <td>
                    <div class="report-actions">
                        <button class="btn-icon btn-edit" onclick="window.editReport('${report.id}')" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="window.deleteReport('${report.id}')" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Edit report
window.editReport = function(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    editingReportId = reportId;

    const reporter = allUsers.find(u => u.id === report.reported_by);
    const reporterName = reporter ? (reporter.name || reporter.email) : 'Unknown';

    const createdDate = new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('view-reporter').textContent = reporterName;
    document.getElementById('view-created').textContent = createdDate;
    document.getElementById('view-browser').textContent = report.browser || 'Not specified';
    document.getElementById('view-title').value = report.title;
    document.getElementById('view-description').value = report.description;
    document.getElementById('view-page').value = report.page_url || '';
    document.getElementById('edit-status').value = report.status;
    document.getElementById('edit-priority').value = report.priority;
    document.getElementById('edit-admin-notes').value = report.admin_notes || '';

    document.getElementById('edit-modal').classList.add('active');
};

// Delete report
window.deleteReport = function(reportId) {
    deletingReportId = reportId;
    document.getElementById('delete-modal').classList.add('active');
};

// Handle edit form submission
document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!editingReportId) return;

    const status = document.getElementById('edit-status').value;
    const priority = document.getElementById('edit-priority').value;
    const adminNotes = document.getElementById('edit-admin-notes').value.trim();

    try {
        const updateData = {
            status: status,
            priority: priority,
            admin_notes: adminNotes || null
        };

        // If status is resolved, set resolved_at
        if (status === 'resolved' || status === 'closed') {
            const report = allReports.find(r => r.id === editingReportId);
            if (report && !report.resolved_at) {
                updateData.resolved_at = new Date().toISOString();
            }
        }

        const { error } = await supabase
            .from('bug_reports')
            .update(updateData)
            .eq('id', editingReportId);

        if (error) throw error;

        // Close modal
        document.getElementById('edit-modal').classList.remove('active');
        editingReportId = null;

        // Reload reports
        await loadReports();
    } catch (error) {
        console.error('Error updating report:', error);
        alert('Error updating report: ' + error.message);
    }
});

// Handle delete confirmation
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!deletingReportId) return;

    try {
        const { error } = await supabase
            .from('bug_reports')
            .delete()
            .eq('id', deletingReportId);

        if (error) throw error;

        // Close modal
        document.getElementById('delete-modal').classList.remove('active');
        deletingReportId = null;

        // Reload reports
        await loadReports();
    } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error deleting report: ' + error.message);
    }
});

// Cancel edit
document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.remove('active');
    editingReportId = null;
});

// Cancel delete
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-modal').classList.remove('active');
    deletingReportId = null;
});

// Close modals on background click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            editingReportId = null;
            deletingReportId = null;
        }
    });
});

// Filter changes
document.getElementById('search-input').addEventListener('input', renderReports);
document.getElementById('filter-type').addEventListener('change', renderReports);
document.getElementById('filter-status').addEventListener('change', renderReports);
document.getElementById('filter-priority').addEventListener('change', renderReports);
document.getElementById('filter-reporter').addEventListener('change', renderReports);

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Load user data on page load
loadUserData();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Bug Management auth state changed:', event);
    if (event === 'SIGNED_OUT') {
        console.log('Sign out detected, redirecting to login');
        window.location.href = 'index.html';
    }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Logout button clicked');
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Sign out successful');
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out: ' + error.message);
    }
});
