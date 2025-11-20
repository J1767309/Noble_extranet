import { supabase } from './supabase-config.js';

let allEntries = [];
let allHotels = [];
let allManagementCompanies = [];
let currentUser = null;
let editingEntryId = null;
let entryToDelete = null;

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
        alert('Access denied. Hotel Tracker is only available to internal users.');
        window.location.href = 'dashboard.html';
        return;
    }

    currentUser = userData;

    // Show user management link if admin
    if (userData.role === 'admin') {
        document.getElementById('user-management-link').style.display = 'flex';
        // Show admin UI elements
        document.getElementById('create-entry-btn').style.display = 'inline-flex';
        document.getElementById('manage-lists-btn').style.display = 'inline-flex';
        document.getElementById('actions-header').classList.add('show');
    }

    document.getElementById('user-email').textContent = session.user.email;

    await loadLookupData();
    await loadEntries();
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

// Load hotels and management companies
async function loadLookupData() {
    try {
        // Load hotels
        const { data: hotels, error: hotelsError } = await supabase
            .from('hotels')
            .select('*')
            .order('name', { ascending: true });

        if (hotelsError) throw hotelsError;
        allHotels = hotels || [];

        // Load management companies
        const { data: companies, error: companiesError } = await supabase
            .from('management_companies')
            .select('*')
            .order('name', { ascending: true });

        if (companiesError) throw companiesError;
        allManagementCompanies = companies || [];

        // Populate dropdowns
        populateDropdowns();
    } catch (error) {
        console.error('Error loading lookup data:', error);
        alert('Error loading hotels and management companies. Please refresh the page.');
    }
}

// Populate all dropdown selects
function populateDropdowns() {
    // Hotel dropdowns
    const hotelSelects = [
        document.getElementById('entry-hotel'),
        document.getElementById('filter-hotel')
    ];

    hotelSelects.forEach(select => {
        const currentValue = select.value;
        const isFilter = select.id === 'filter-hotel';

        select.innerHTML = isFilter ? '<option value="">All Hotels</option>' : '<option value="">Select hotel...</option>';

        allHotels.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.id;
            option.textContent = hotel.name;
            select.appendChild(option);
        });

        if (currentValue) {
            select.value = currentValue;
        }
    });

    // Management company dropdowns
    const companySelects = [
        document.getElementById('entry-management-company'),
        document.getElementById('filter-company')
    ];

    companySelects.forEach(select => {
        const currentValue = select.value;
        const isFilter = select.id === 'filter-company';

        select.innerHTML = isFilter ? '<option value="">All Companies</option>' : '<option value="">Select company...</option>';

        allManagementCompanies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            select.appendChild(option);
        });

        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// Load tracker entries from database
async function loadEntries() {
    try {
        const { data, error } = await supabase
            .from('hotel_tracker')
            .select(`
                *,
                hotels (id, name),
                management_companies (id, name)
            `)
            .order('date_reported', { ascending: false });

        if (error) throw error;

        allEntries = data || [];
        displayEntries(allEntries);
    } catch (error) {
        console.error('Error loading entries:', error);
        alert('Error loading tracker entries. Please refresh the page.');
    }
}

// Display entries in table
function displayEntries(entries) {
    const tbody = document.getElementById('tracker-table-body');
    tbody.innerHTML = '';

    if (entries.length === 0) {
        const colspan = currentUser?.role === 'admin' ? '8' : '7';
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 3rem; color: #6b7280;">No entries found</td></tr>`;
        return;
    }

    entries.forEach(entry => {
        const tr = document.createElement('tr');

        // Type badge
        const typeClass = entry.type === 'Issue' ? 'type-issue' : 'type-tactic';
        const typeBadge = `<span class="type-badge ${typeClass}">${entry.type}</span>`;

        // Current badge
        const currentClass = entry.is_current ? 'current-yes' : 'current-no';
        const currentText = entry.is_current ? 'Yes' : 'No';
        const currentBadge = `<span class="current-badge ${currentClass}">${currentText}</span>`;

        // Format date
        const dateFormatted = new Date(entry.date_reported).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Description long
        const descriptionLong = entry.description_long ? entry.description_long.replace(/\n/g, '<br>') : '<span style="color: #9ca3af;">-</span>';

        // Admin actions
        let actionsHtml = '';
        if (currentUser?.role === 'admin') {
            actionsHtml = `
                <td class="tracker-actions">
                    <button class="btn-icon btn-edit" onclick="window.editEntry('${entry.id}')" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="window.deleteEntry('${entry.id}')" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
        }

        tr.innerHTML = `
            <td style="font-weight: 500;">${entry.hotels.name}</td>
            <td>${entry.management_companies.name}</td>
            <td style="white-space: nowrap;">${dateFormatted}</td>
            <td>${currentBadge}</td>
            <td>${typeBadge}</td>
            <td>${entry.description_short}</td>
            <td style="max-width: 300px;">${descriptionLong}</td>
            ${actionsHtml}
        `;

        tbody.appendChild(tr);
    });
}

// Filter and search functionality
function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-type').value;
    const filterCurrent = document.getElementById('filter-current').value;
    const filterHotel = document.getElementById('filter-hotel').value;
    const filterCompany = document.getElementById('filter-company').value;

    let filtered = allEntries;

    // Apply search
    if (searchQuery) {
        filtered = filtered.filter(entry => {
            const hotelName = entry.hotels.name.toLowerCase();
            const descShort = entry.description_short.toLowerCase();
            const descLong = (entry.description_long || '').toLowerCase();
            return hotelName.includes(searchQuery) ||
                   descShort.includes(searchQuery) ||
                   descLong.includes(searchQuery);
        });
    }

    // Apply type filter
    if (filterType) {
        filtered = filtered.filter(entry => entry.type === filterType);
    }

    // Apply current filter
    if (filterCurrent !== '') {
        const isCurrent = filterCurrent === 'true';
        filtered = filtered.filter(entry => entry.is_current === isCurrent);
    }

    // Apply hotel filter
    if (filterHotel) {
        filtered = filtered.filter(entry => entry.hotel_id === filterHotel);
    }

    // Apply management company filter
    if (filterCompany) {
        filtered = filtered.filter(entry => entry.management_company_id === filterCompany);
    }

    displayEntries(filtered);
}

// Attach filter event listeners
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('filter-current').addEventListener('change', applyFilters);
document.getElementById('filter-hotel').addEventListener('change', applyFilters);
document.getElementById('filter-company').addEventListener('change', applyFilters);

// Create entry button
document.getElementById('create-entry-btn')?.addEventListener('click', () => {
    editingEntryId = null;
    document.getElementById('entry-modal-title').textContent = 'Create New Entry';
    document.getElementById('entry-form').reset();
    // Set default date to today
    document.getElementById('entry-date').valueAsDate = new Date();
    document.getElementById('entry-modal').classList.add('active');
});

// Cancel entry button
document.getElementById('cancel-entry-btn').addEventListener('click', () => {
    document.getElementById('entry-modal').classList.remove('active');
});

// Entry form submission
document.getElementById('entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const entryData = {
        hotel_id: document.getElementById('entry-hotel').value,
        management_company_id: document.getElementById('entry-management-company').value,
        date_reported: document.getElementById('entry-date').value,
        type: document.getElementById('entry-type').value,
        is_current: document.getElementById('entry-current').value === 'true',
        description_short: document.getElementById('entry-description-short').value,
        description_long: document.getElementById('entry-description-long').value || null
    };

    try {
        if (editingEntryId) {
            // Update existing entry
            const { error } = await supabase
                .from('hotel_tracker')
                .update(entryData)
                .eq('id', editingEntryId);

            if (error) throw error;
            alert('Entry updated successfully!');
        } else {
            // Create new entry
            const { error } = await supabase
                .from('hotel_tracker')
                .insert([entryData]);

            if (error) throw error;
            alert('Entry created successfully!');
        }

        document.getElementById('entry-modal').classList.remove('active');
        await loadEntries();
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Error saving entry: ' + error.message);
    }
});

// Edit entry function (exposed to window for onclick)
window.editEntry = async (entryId) => {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return;

    editingEntryId = entryId;
    document.getElementById('entry-modal-title').textContent = 'Edit Entry';
    document.getElementById('entry-hotel').value = entry.hotel_id;
    document.getElementById('entry-management-company').value = entry.management_company_id;
    document.getElementById('entry-date').value = entry.date_reported;
    document.getElementById('entry-type').value = entry.type;
    document.getElementById('entry-current').value = entry.is_current.toString();
    document.getElementById('entry-description-short').value = entry.description_short;
    document.getElementById('entry-description-long').value = entry.description_long || '';
    document.getElementById('entry-modal').classList.add('active');
};

// Delete entry function (exposed to window for onclick)
window.deleteEntry = (entryId) => {
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return;

    entryToDelete = entryId;
    document.getElementById('delete-entry-name').textContent = `${entry.hotels.name} - ${entry.description_short}`;
    document.getElementById('delete-entry-modal').classList.add('active');
};

// Cancel delete button
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-entry-modal').classList.remove('active');
    entryToDelete = null;
});

// Confirm delete button
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!entryToDelete) return;

    try {
        const { error } = await supabase
            .from('hotel_tracker')
            .delete()
            .eq('id', entryToDelete);

        if (error) throw error;

        alert('Entry deleted successfully!');
        document.getElementById('delete-entry-modal').classList.remove('active');
        entryToDelete = null;
        await loadEntries();
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry: ' + error.message);
    }
});

// Manage lists button
document.getElementById('manage-lists-btn')?.addEventListener('click', () => {
    loadManageLists();
    document.getElementById('manage-lists-modal').classList.add('active');
});

// Close manage lists button
document.getElementById('close-manage-lists-btn').addEventListener('click', () => {
    document.getElementById('manage-lists-modal').classList.remove('active');
});

// Load manage lists modal content
async function loadManageLists() {
    await loadLookupData();
    displayHotelsList();
    displayCompaniesList();
}

// Display hotels list in manage modal
function displayHotelsList() {
    const list = document.getElementById('hotels-list');
    list.innerHTML = '';

    if (allHotels.length === 0) {
        list.innerHTML = '<p style="color: #6b7280; padding: 1rem; text-align: center;">No hotels found</p>';
        return;
    }

    allHotels.forEach(hotel => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #e5e7eb;';
        item.innerHTML = `
            <span>${hotel.name}</span>
            <button class="btn-icon btn-delete" onclick="window.deleteHotel('${hotel.id}')" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        list.appendChild(item);
    });
}

// Display companies list in manage modal
function displayCompaniesList() {
    const list = document.getElementById('companies-list');
    list.innerHTML = '';

    if (allManagementCompanies.length === 0) {
        list.innerHTML = '<p style="color: #6b7280; padding: 1rem; text-align: center;">No companies found</p>';
        return;
    }

    allManagementCompanies.forEach(company => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #e5e7eb;';
        item.innerHTML = `
            <span>${company.name}</span>
            <button class="btn-icon btn-delete" onclick="window.deleteCompany('${company.id}')" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        list.appendChild(item);
    });
}

// Add hotel button
document.getElementById('add-hotel-btn').addEventListener('click', async () => {
    const nameInput = document.getElementById('new-hotel-name');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Please enter a hotel name');
        return;
    }

    try {
        const { error } = await supabase
            .from('hotels')
            .insert([{ name }]);

        if (error) {
            if (error.code === '23505') {
                alert('A hotel with this name already exists.');
            } else {
                throw error;
            }
            return;
        }

        nameInput.value = '';
        await loadManageLists();
        alert('Hotel added successfully!');
    } catch (error) {
        console.error('Error adding hotel:', error);
        alert('Error adding hotel: ' + error.message);
    }
});

// Add company button
document.getElementById('add-company-btn').addEventListener('click', async () => {
    const nameInput = document.getElementById('new-company-name');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Please enter a company name');
        return;
    }

    try {
        const { error } = await supabase
            .from('management_companies')
            .insert([{ name }]);

        if (error) {
            if (error.code === '23505') {
                alert('A company with this name already exists.');
            } else {
                throw error;
            }
            return;
        }

        nameInput.value = '';
        await loadManageLists();
        alert('Company added successfully!');
    } catch (error) {
        console.error('Error adding company:', error);
        alert('Error adding company: ' + error.message);
    }
});

// Delete hotel function
window.deleteHotel = async (hotelId) => {
    if (!confirm('Are you sure you want to delete this hotel? This will also delete all tracker entries for this hotel.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('hotels')
            .delete()
            .eq('id', hotelId);

        if (error) throw error;

        await loadManageLists();
        await loadEntries();
        alert('Hotel deleted successfully!');
    } catch (error) {
        console.error('Error deleting hotel:', error);
        alert('Error deleting hotel: ' + error.message);
    }
};

// Delete company function
window.deleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company? This will also delete all tracker entries for this company.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('management_companies')
            .delete()
            .eq('id', companyId);

        if (error) throw error;

        await loadManageLists();
        await loadEntries();
        alert('Company deleted successfully!');
    } catch (error) {
        console.error('Error deleting company:', error);
        alert('Error deleting company: ' + error.message);
    }
};

// Close modals when clicking outside
document.getElementById('entry-modal').addEventListener('click', (e) => {
    if (e.target.id === 'entry-modal') {
        document.getElementById('entry-modal').classList.remove('active');
    }
});

document.getElementById('delete-entry-modal').addEventListener('click', (e) => {
    if (e.target.id === 'delete-entry-modal') {
        document.getElementById('delete-entry-modal').classList.remove('active');
    }
});

document.getElementById('manage-lists-modal').addEventListener('click', (e) => {
    if (e.target.id === 'manage-lists-modal') {
        document.getElementById('manage-lists-modal').classList.remove('active');
    }
});
