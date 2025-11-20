import { supabase } from './supabase-config.js';

let allInitiatives = [];
let currentUser = null;
let editingInitiativeId = null;
let initiativeToDelete = null;
let initiativeEditor = null;

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
        alert('Access denied. Initiatives is only available to internal users.');
        window.location.href = 'dashboard.html';
        return;
    }

    currentUser = userData;

    // Show internal links
    document.getElementById('hotel-tracker-link').style.display = 'flex';
    document.getElementById('hotel-top-accounts-link').style.display = 'flex';
    document.getElementById('hotel-partner-notes-link').style.display = 'flex';
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
        document.getElementById('create-initiative-btn').style.display = 'inline-flex';
    }

    if (canEdit || canDelete) {
        document.getElementById('actions-header').style.display = 'table-cell';
    }

    document.getElementById('user-email').textContent = session.user.email;

    await loadInitiatives();
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
    const editorContainer = document.getElementById('initiative-editor-container');
    if (!editorContainer) {
        console.log('Waiting for editor container...');
        setTimeout(initializeQuillEditor, 100);
        return;
    }

    console.log('Initializing Quill editor...');
    try {
        initiativeEditor = new Quill('#initiative-editor-container', {
            theme: 'snow',
            placeholder: 'Enter initiative details...',
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

// Load initiatives from database
async function loadInitiatives() {
    try {
        const { data, error } = await supabase
            .from('initiatives')
            .select('*')
            .order('hotel_name', { ascending: true })
            .order('initiative_type', { ascending: true });

        if (error) throw error;

        allInitiatives = data || [];
        updateStats(); // Populate hotel dropdown
        applyFilters(); // This will update stats and display initiatives
    } catch (error) {
        console.error('Error loading initiatives:', error);
        alert('Error loading initiatives. Please refresh the page.');
    }
}

// Populate hotel dropdown (called once on load)
function updateStats() {
    const uniqueHotels = [...new Set(allInitiatives.map(i => i.hotel_name))];

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

// Apply filters and display initiatives
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterHotel = document.getElementById('filter-hotel').value;
    const filterType = document.getElementById('filter-type').value;

    let filtered = allInitiatives.filter(initiative => {
        const matchesSearch = searchTerm === '' ||
            initiative.hotel_name.toLowerCase().includes(searchTerm) ||
            initiative.initiative_type.toLowerCase().includes(searchTerm) ||
            (initiative.initiative_text && initiative.initiative_text.toLowerCase().includes(searchTerm));

        const matchesHotel = filterHotel === '' || initiative.hotel_name === filterHotel;
        const matchesType = filterType === '' || initiative.initiative_type === filterType;

        return matchesSearch && matchesHotel && matchesType;
    });

    displayInitiatives(filtered);
    updateStatsForFiltered(filtered);
}

// Update statistics based on filtered initiatives
function updateStatsForFiltered(initiatives) {
    const uniqueHotels = [...new Set(initiatives.map(i => i.hotel_name))];
    const expenseInitiatives = initiatives.filter(i => i.initiative_type === 'Expense');
    const revenueInitiatives = initiatives.filter(i => i.initiative_type === 'Revenue');

    document.getElementById('stat-total').textContent = initiatives.length;
    document.getElementById('stat-expense').textContent = expenseInitiatives.length;
    document.getElementById('stat-revenue').textContent = revenueInitiatives.length;
    document.getElementById('stat-hotels').textContent = uniqueHotels.length;
}

// Display initiatives in table
function displayInitiatives(initiatives) {
    const tbody = document.getElementById('initiatives-table-body');
    tbody.innerHTML = '';

    if (initiatives.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No initiatives found</td></tr>`;
        return;
    }

    initiatives.forEach(initiative => {
        const tr = document.createElement('tr');

        // Initiative type badge
        const typeClass = initiative.initiative_type === 'Expense' ? 'type-expense' : 'type-revenue';
        const typeBadge = `<span class="initiative-type-badge ${typeClass}">${initiative.initiative_type}</span>`;

        // Status badge
        const statusClass = `status-${initiative.status.toLowerCase().replace(' ', '-')}`;
        const statusBadge = `<span class="status-badge ${statusClass}">${initiative.status}</span>`;

        // Format updated_at timestamp
        const updatedAt = initiative.updated_at ? new Date(initiative.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : '-';

        // Role-based actions
        let actionsHtml = '';
        const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'creator' || currentUser.role === 'editor');
        const canDelete = currentUser && currentUser.role === 'admin';

        if (canEdit || canDelete) {
            let buttonsHtml = '';
            if (canEdit) {
                buttonsHtml += `<button class="btn-icon btn-edit" onclick="window.editInitiative('${initiative.id}')">Edit</button>`;
            }
            if (canDelete) {
                buttonsHtml += `<button class="btn-icon btn-delete" onclick="window.deleteInitiative('${initiative.id}')">Delete</button>`;
            }
            actionsHtml = `
                <td>
                    <div class="initiative-actions">
                        ${buttonsHtml}
                    </div>
                </td>
            `;
        }

        tr.innerHTML = `
            <td>${initiative.hotel_name}</td>
            <td>${typeBadge}</td>
            <td><div class="rich-text-display">${initiative.initiative_text || '-'}</div></td>
            <td>${statusBadge}</td>
            <td>${updatedAt}</td>
            ${actionsHtml}
        `;

        tbody.appendChild(tr);
    });
}

// Event listeners for filters
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-hotel').addEventListener('change', applyFilters);
document.getElementById('filter-type').addEventListener('change', applyFilters);

// Create new initiative button
document.getElementById('create-initiative-btn')?.addEventListener('click', () => {
    editingInitiativeId = null;
    document.getElementById('modal-title').textContent = 'New Initiative';
    document.getElementById('initiative-form').reset();

    // Clear Quill editor
    if (initiativeEditor) {
        initiativeEditor.setText('');
    }

    document.getElementById('initiative-modal').classList.add('active');
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('initiative-modal').classList.remove('active');
});

// Form submission
document.getElementById('initiative-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const initiativeData = {
        hotel_name: document.getElementById('initiative-hotel').value,
        initiative_type: document.getElementById('initiative-type').value,
        initiative_text: initiativeEditor.root.innerHTML.trim() === '<p><br></p>' ? null : initiativeEditor.root.innerHTML,
        status: document.getElementById('initiative-status').value
    };

    try {
        if (editingInitiativeId) {
            // Update existing initiative
            const { error } = await supabase
                .from('initiatives')
                .update(initiativeData)
                .eq('id', editingInitiativeId);

            if (error) throw error;
            alert('Initiative updated successfully');
        } else {
            // Create new initiative
            const { error } = await supabase
                .from('initiatives')
                .insert([initiativeData]);

            if (error) throw error;
            alert('Initiative created successfully');
        }

        document.getElementById('initiative-modal').classList.remove('active');
        await loadInitiatives();
    } catch (error) {
        console.error('Error saving initiative:', error);
        alert('Error saving initiative: ' + error.message);
    }
});

// Edit initiative
window.editInitiative = async (initiativeId) => {
    const initiative = allInitiatives.find(i => i.id === initiativeId);
    if (!initiative) return;

    editingInitiativeId = initiativeId;
    document.getElementById('modal-title').textContent = 'Edit Initiative';

    document.getElementById('initiative-hotel').value = initiative.hotel_name;
    document.getElementById('initiative-type').value = initiative.initiative_type;
    document.getElementById('initiative-status').value = initiative.status;

    // Set Quill editor content
    if (initiative.initiative_text) {
        initiativeEditor.root.innerHTML = initiative.initiative_text;
    } else {
        initiativeEditor.setText('');
    }

    document.getElementById('initiative-modal').classList.add('active');
};

// Delete initiative
window.deleteInitiative = (initiativeId) => {
    initiativeToDelete = initiativeId;
    document.getElementById('delete-modal').classList.add('active');
};

// Cancel delete
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    initiativeToDelete = null;
    document.getElementById('delete-modal').classList.remove('active');
});

// Confirm delete
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!initiativeToDelete) return;

    try {
        const { error } = await supabase
            .from('initiatives')
            .delete()
            .eq('id', initiativeToDelete);

        if (error) throw error;

        alert('Initiative deleted successfully');
        document.getElementById('delete-modal').classList.remove('active');
        initiativeToDelete = null;
        await loadInitiatives();
    } catch (error) {
        console.error('Error deleting initiative:', error);
        alert('Error deleting initiative: ' + error.message);
    }
});
