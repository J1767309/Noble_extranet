import { supabase } from './supabase-config.js';

let currentUser = null;

// Update form labels based on report type
function updateFormLabels() {
    const reportType = document.getElementById('report-type').value;
    const descriptionHelp = document.getElementById('description-help');
    const submitBtn = document.getElementById('submit-btn');

    if (reportType === 'feature') {
        descriptionHelp.textContent = 'Describe the feature you would like to see, why it would be useful, and how it should work';
        submitBtn.textContent = 'Submit Feature Request';
    } else {
        descriptionHelp.textContent = 'Include steps to reproduce, expected behavior, and actual behavior';
        submitBtn.textContent = 'Submit Bug Report';
    }
}

// Listen for type changes (only if element exists)
const reportTypeElement = document.getElementById('report-type');
if (reportTypeElement) {
    reportTypeElement.addEventListener('change', updateFormLabels);
}

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
        } else {
            currentUser = userData;
            document.getElementById('user-email').textContent = userEmail;

            // Show Bug Management link for admins
            if (userData.role === 'admin') {
                const bugMgmtLink = document.getElementById('bug-management-link');
                if (bugMgmtLink) bugMgmtLink.style.display = 'flex';
            }

            // Show User Management link for admins
            if (userData.role === 'admin') {
                const userMgmtLink = document.getElementById('user-management-link');
                if (userMgmtLink) userMgmtLink.style.display = 'flex';
            }

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
        }

        // Load user's bug reports
        await loadMyReports(userId);
    } catch (error) {
        console.error('Error:', error);
        const userEmail = session.user.email;
        document.getElementById('user-email').textContent = userEmail;
    }
}

// Load user's submitted bug reports
async function loadMyReports(userId) {
    try {
        const { data: reports, error } = await supabase
            .from('bug_reports')
            .select('*')
            .eq('reported_by', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const reportsList = document.getElementById('my-reports-list');

        if (!reports || reports.length === 0) {
            reportsList.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>You haven't submitted any reports yet.</p>
                </div>
            `;
            return;
        }

        reportsList.innerHTML = reports.map(report => {
            const createdDate = new Date(report.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const statusLabel = report.status.replace('_', ' ');
            const priorityLabel = report.priority.charAt(0).toUpperCase() + report.priority.slice(1);
            const typeLabel = report.type === 'feature' ? 'Feature' : 'Bug';
            const typeClass = report.type === 'feature' ? 'type-feature' : 'type-bug';

            return `
                <div class="report-item">
                    <div class="report-header">
                        <h3 class="report-title">${escapeHtml(report.title)}</h3>
                        <div class="report-badges">
                            <span class="badge ${typeClass}">${typeLabel}</span>
                            <span class="badge status-${report.status}">${statusLabel}</span>
                            <span class="badge priority-${report.priority}">${priorityLabel}</span>
                        </div>
                    </div>
                    <p class="report-description">${escapeHtml(report.description)}</p>
                    ${report.page_url ? `<div class="report-meta"><span>Page: ${escapeHtml(report.page_url)}</span></div>` : ''}
                    ${report.admin_notes ? `<div class="report-meta"><strong>Admin Notes:</strong> ${escapeHtml(report.admin_notes)}</div>` : ''}
                    <div class="report-meta">
                        <span>Reported: ${createdDate}</span>
                        ${report.resolved_at ? `<span>Resolved: ${new Date(report.resolved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('my-reports-list').innerHTML = `
            <div class="empty-state">
                <p>Error loading your reports. Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Handle form submission
document.getElementById('bug-report-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert('You must be logged in to submit a report');
        return;
    }

    const reportType = document.getElementById('report-type').value;
    const title = document.getElementById('bug-title').value.trim();
    const description = document.getElementById('bug-description').value.trim();
    const pageUrl = document.getElementById('bug-page').value.trim();
    const browser = document.getElementById('bug-browser').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;

    if (!title || !description) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('bug_reports')
            .insert([{
                type: reportType,
                title: title,
                description: description,
                page_url: pageUrl || null,
                browser: browser || null,
                priority: priority,
                status: 'open',
                reported_by: session.user.id
            }])
            .select();

        if (error) throw error;

        // Show success message
        const successMessage = document.getElementById('success-message');
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);

        // Reset form
        document.getElementById('bug-report-form').reset();

        // Reload reports
        await loadMyReports(session.user.id);

        // Scroll to reports section
        document.getElementById('my-reports-list').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('Error submitting report: ' + error.message);
    }
});

// Handle reset button
document.getElementById('reset-form-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the form?')) {
        document.getElementById('bug-report-form').reset();
    }
});

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
    console.log('Bug Report auth state changed:', event);
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
