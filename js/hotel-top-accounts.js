import { supabase } from './supabase-config.js';

let allAccounts = [];
let currentUser = null;
let editingAccountId = null;
let accountToDelete = null;
let descriptionEditor = null;

// Check authentication and restrict to internal users only
async function initPage() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Check if user is internal
    const { data: userData, error } = await supabase
        .from('users')
        .select('user_type, role')
        .eq('id', session.user.id)
        .single();

    if (error || !userData || userData.user_type !== 'internal') {
        // Not an internal user, redirect to dashboard
        alert('Access denied. Hotel Top Accounts is only available to internal users.');
        window.location.href = 'dashboard.html';
        return;
    }

    currentUser = userData;

    // Show internal links
    document.getElementById('hotel-tracker-link').style.display = 'flex';
    document.getElementById('hotel-top-accounts-link').style.display = 'flex';
    document.getElementById('initiatives-link').style.display = 'flex';
    document.getElementById('bi-tools-link').style.display = 'flex';

    // Show user management link if admin
    if (userData.role === 'admin') {
        document.getElementById('user-management-link').style.display = 'flex';
    }

    // Role-based permissions for actions
    // Admin: Full access (create, edit, delete)
    // Creator: Can create and edit
    // Editor: Can edit only
    // Read-only: View only
    const canCreate = userData.role === 'admin' || userData.role === 'creator';
    const canEdit = userData.role === 'admin' || userData.role === 'creator' || userData.role === 'editor';
    const canDelete = userData.role === 'admin';

    // Show/hide UI elements based on permissions
    if (canCreate) {
        document.getElementById('create-account-btn').style.display = 'inline-flex';
    }

    if (canEdit || canDelete) {
        document.getElementById('actions-header').style.display = 'table-cell';
    }

    document.getElementById('user-email').textContent = session.user.email;

    await loadAccounts();
    initializeQuillEditor();
}

// Initialize Quill Rich Text Editor
function initializeQuillEditor() {
    // Wait for Quill to be available
    if (typeof Quill === 'undefined') {
        console.log('Waiting for Quill to load...');
        setTimeout(initializeQuillEditor, 100);
        return;
    }

    // Check if editor container exists
    const editorContainer = document.getElementById('description-editor-container');
    if (!editorContainer) {
        console.log('Waiting for editor container...');
        setTimeout(initializeQuillEditor, 100);
        return;
    }

    console.log('Initializing Quill editor...');
    try {
        descriptionEditor = new Quill('#description-editor-container', {
            theme: 'snow',
            placeholder: 'Enter detailed description...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'align': [] }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    ['clean']
                ]
            }
        });
        console.log('Quill editor initialized successfully!');
    } catch (error) {
        console.error('Error initializing Quill editor:', error);
    }
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

// Load accounts from database
async function loadAccounts() {
    try {
        const { data, error } = await supabase
            .from('hotel_top_accounts')
            .select('*')
            .order('hotel_name', { ascending: true })
            .order('account_name', { ascending: true });

        if (error) throw error;

        allAccounts = data || [];
        updateStats(); // Populate hotel dropdown
        applyFilters(); // This will update stats and display accounts
    } catch (error) {
        console.error('Error loading accounts:', error);
        alert('Error loading accounts. Please refresh the page.');
    }
}

// Populate hotel dropdown (called once on load)
function updateStats() {
    const uniqueHotels = [...new Set(allAccounts.map(a => a.hotel_name))];

    // Populate hotel filter dropdown
    const filterHotel = document.getElementById('filter-hotel');
    filterHotel.innerHTML = '<option value="">All Hotels</option>';
    uniqueHotels.sort().forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel;
        option.textContent = hotel;
        filterHotel.appendChild(option);
    });
}

// Apply filters and display accounts
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterHotel = document.getElementById('filter-hotel').value;
    const filterType = document.getElementById('filter-type').value;
    const filterStatus = document.getElementById('filter-status').value;

    let filtered = allAccounts.filter(account => {
        const matchesSearch = searchTerm === '' ||
            account.account_name.toLowerCase().includes(searchTerm) ||
            account.hotel_name.toLowerCase().includes(searchTerm) ||
            (account.description_long && account.description_long.toLowerCase().includes(searchTerm));

        const matchesHotel = filterHotel === '' || account.hotel_name === filterHotel;
        const matchesType = filterType === '' || account.account_type === filterType;
        const matchesStatus = filterStatus === '' || account.status === filterStatus;

        return matchesSearch && matchesHotel && matchesType && matchesStatus;
    });

    displayAccounts(filtered);
    updateStatsForFiltered(filtered);
}

// Update statistics based on filtered accounts
function updateStatsForFiltered(accounts) {
    const uniqueHotels = [...new Set(accounts.map(a => a.hotel_name))];
    const topAccounts = accounts.filter(a => a.account_type === 'Top');
    const targetAccounts = accounts.filter(a => a.account_type === 'Target');

    document.getElementById('stat-total').textContent = accounts.length;
    document.getElementById('stat-top').textContent = topAccounts.length;
    document.getElementById('stat-target').textContent = targetAccounts.length;
    document.getElementById('stat-hotels').textContent = uniqueHotels.length;
}

// Display accounts in table
function displayAccounts(accounts) {
    const tbody = document.getElementById('accounts-table-body');
    tbody.innerHTML = '';

    if (accounts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 2rem;">No accounts found</td></tr>`;
        return;
    }

    accounts.forEach(account => {
        const tr = document.createElement('tr');

        // Format values
        const rnsSold = account.rns_sold_2025 || '-';
        const adr2025 = account.adr_2025 ? `$${parseFloat(account.adr_2025).toFixed(0)}` : '-';
        const rnsForecast = account.rns_forecasted_2026 || '-';
        const adr2026 = account.adr_2026 ? `$${parseFloat(account.adr_2026).toFixed(0)}` : '-';
        const segment = account.segment_type || '-';
        const descriptionLong = account.description_long || '-';

        // Account type badge
        const typeClass = account.account_type === 'Top' ? 'type-top' : 'type-target';
        const typeBadge = `<span class="account-type-badge ${typeClass}">${account.account_type}</span>`;

        // Status badge
        const statusClass = `status-${account.status.toLowerCase()}`;
        const statusBadge = `<span class="status-badge ${statusClass}">${account.status}</span>`;

        // Role-based actions
        let actionsHtml = '';
        const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'creator' || currentUser.role === 'editor');
        const canDelete = currentUser && currentUser.role === 'admin';

        if (canEdit || canDelete) {
            let buttonsHtml = '';
            if (canEdit) {
                buttonsHtml += `<button class="btn-icon btn-edit" onclick="window.editAccount('${account.id}')">Edit</button>`;
            }
            if (canDelete) {
                buttonsHtml += `<button class="btn-icon btn-delete" onclick="window.deleteAccount('${account.id}')">Delete</button>`;
            }
            actionsHtml = `
                <td>
                    <div class="account-actions">
                        ${buttonsHtml}
                    </div>
                </td>
            `;
        }

        tr.innerHTML = `
            <td>${account.hotel_name}</td>
            <td>${account.account_name}</td>
            <td>${typeBadge}</td>
            <td>${rnsSold}</td>
            <td>${adr2025}</td>
            <td>${rnsForecast}</td>
            <td>${adr2026}</td>
            <td>${segment}</td>
            <td>${statusBadge}</td>
            <td><div class="rich-text-display">${descriptionLong}</div></td>
            ${actionsHtml}
        `;

        tbody.appendChild(tr);
    });
}

// Event listeners for filters
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-hotel').addEventListener('change', applyFilters);
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change', applyFilters);

// Show/hide form fields based on account type
document.getElementById('account-type').addEventListener('change', (e) => {
    const topFields = document.getElementById('top-account-fields');
    const targetFields = document.getElementById('target-account-fields');

    if (e.target.value === 'Top') {
        topFields.style.display = 'block';
        targetFields.style.display = 'none';
    } else if (e.target.value === 'Target') {
        topFields.style.display = 'none';
        targetFields.style.display = 'block';
    } else {
        topFields.style.display = 'none';
        targetFields.style.display = 'none';
    }
});

// Create new account button
document.getElementById('create-account-btn')?.addEventListener('click', () => {
    editingAccountId = null;
    document.getElementById('modal-title').textContent = 'New Account';
    document.getElementById('account-form').reset();
    document.getElementById('top-account-fields').style.display = 'none';
    document.getElementById('target-account-fields').style.display = 'none';

    // Clear Quill editor
    if (descriptionEditor) {
        descriptionEditor.setText('');
    }

    document.getElementById('account-modal').classList.add('active');
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('account-modal').classList.remove('active');
});

// Form submission
document.getElementById('account-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const accountType = document.getElementById('account-type').value;

    const accountData = {
        hotel_name: document.getElementById('account-hotel').value,
        account_name: document.getElementById('account-name').value,
        account_type: accountType,
        status: document.getElementById('account-status').value,
        description_long: descriptionEditor.root.innerHTML.trim() === '<p><br></p>' ? null : descriptionEditor.root.innerHTML
    };

    // Add type-specific fields
    if (accountType === 'Top') {
        accountData.rns_sold_2025 = document.getElementById('rns-sold-2025').value ? parseInt(document.getElementById('rns-sold-2025').value) : null;
        accountData.adr_2025 = document.getElementById('adr-2025').value ? parseFloat(document.getElementById('adr-2025').value) : null;
        accountData.rns_forecasted_2026 = document.getElementById('rns-forecasted-2026').value ? parseInt(document.getElementById('rns-forecasted-2026').value) : null;
        accountData.adr_2026 = document.getElementById('adr-2026').value ? parseFloat(document.getElementById('adr-2026').value) : null;
        accountData.segment_type = null;
    } else if (accountType === 'Target') {
        accountData.segment_type = document.getElementById('segment-type').value || null;
        accountData.rns_sold_2025 = null;
        accountData.adr_2025 = null;
        accountData.rns_forecasted_2026 = null;
        accountData.adr_2026 = null;
    }

    try {
        if (editingAccountId) {
            // Update existing account
            const { error } = await supabase
                .from('hotel_top_accounts')
                .update(accountData)
                .eq('id', editingAccountId);

            if (error) throw error;
            alert('Account updated successfully');
        } else {
            // Create new account
            const { error } = await supabase
                .from('hotel_top_accounts')
                .insert([accountData]);

            if (error) throw error;
            alert('Account created successfully');
        }

        document.getElementById('account-modal').classList.remove('active');
        await loadAccounts();
    } catch (error) {
        console.error('Error saving account:', error);
        alert('Error saving account: ' + error.message);
    }
});

// Edit account
window.editAccount = async (accountId) => {
    const account = allAccounts.find(a => a.id === accountId);
    if (!account) return;

    editingAccountId = accountId;
    document.getElementById('modal-title').textContent = 'Edit Account';

    document.getElementById('account-hotel').value = account.hotel_name;
    document.getElementById('account-name').value = account.account_name;
    document.getElementById('account-type').value = account.account_type;
    document.getElementById('account-status').value = account.status;

    // Set Quill editor content
    if (account.description_long) {
        descriptionEditor.root.innerHTML = account.description_long;
    } else {
        descriptionEditor.setText('');
    }

    if (account.account_type === 'Top') {
        document.getElementById('top-account-fields').style.display = 'block';
        document.getElementById('target-account-fields').style.display = 'none';
        document.getElementById('rns-sold-2025').value = account.rns_sold_2025 || '';
        document.getElementById('adr-2025').value = account.adr_2025 || '';
        document.getElementById('rns-forecasted-2026').value = account.rns_forecasted_2026 || '';
        document.getElementById('adr-2026').value = account.adr_2026 || '';
    } else if (account.account_type === 'Target') {
        document.getElementById('top-account-fields').style.display = 'none';
        document.getElementById('target-account-fields').style.display = 'block';
        document.getElementById('segment-type').value = account.segment_type || '';
    }

    document.getElementById('account-modal').classList.add('active');
};

// Delete account
window.deleteAccount = (accountId) => {
    accountToDelete = accountId;
    document.getElementById('delete-modal').classList.add('active');
};

// Cancel delete
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    accountToDelete = null;
    document.getElementById('delete-modal').classList.remove('active');
});

// Confirm delete
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!accountToDelete) return;

    try {
        const { error } = await supabase
            .from('hotel_top_accounts')
            .delete()
            .eq('id', accountToDelete);

        if (error) throw error;

        alert('Account deleted successfully');
        document.getElementById('delete-modal').classList.remove('active');
        accountToDelete = null;
        await loadAccounts();
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account: ' + error.message);
    }
});
