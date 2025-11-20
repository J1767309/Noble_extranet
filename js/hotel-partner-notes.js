import { supabase } from './supabase-config.js';

let allNotes = [];
let currentUser = null;
let editingNoteId = null;
let noteToDelete = null;

// Quill editors
let editors = {};

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
        alert('Access denied. Hotel Partner Notes is only available to internal users.');
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
    const canCreate = userData.role === 'admin' || userData.role === 'creator';

    // Show/hide UI elements based on permissions
    if (canCreate) {
        document.getElementById('create-note-btn').style.display = 'inline-flex';
    }

    document.getElementById('user-email').textContent = session.user.email;

    await loadNotes();
    initializeQuillEditors();
}

// Initialize Quill Rich Text Editors
function initializeQuillEditors() {
    // Wait for Quill to be available
    if (typeof Quill === 'undefined') {
        console.log('Waiting for Quill to load...');
        setTimeout(initializeQuillEditors, 100);
        return;
    }

    const editorIds = [
        'keys-to-success-editor',
        'new-supply-editor',
        'market-updates-editor',
        'str-revenue-market-editor',
        'str-revenue-hotel-editor',
        'accounts-top-editor',
        'accounts-target-editor',
        'expense-gop-editor',
        'capital-editor',
        'notes-editor'
    ];

    const toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
    ];

    editorIds.forEach(editorId => {
        const container = document.getElementById(editorId);
        if (container && !editors[editorId]) {
            try {
                editors[editorId] = new Quill(`#${editorId}`, {
                    theme: 'snow',
                    placeholder: 'Enter content...',
                    modules: {
                        toolbar: toolbarOptions
                    }
                });
                console.log(`Initialized editor: ${editorId}`);
            } catch (error) {
                console.error(`Error initializing editor ${editorId}:`, error);
            }
        }
    });
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

// Load notes from database
async function loadNotes() {
    try {
        const { data, error } = await supabase
            .from('hotel_partner_notes')
            .select('*')
            .order('review_date', { ascending: false })
            .order('hotel_name', { ascending: true });

        if (error) throw error;

        allNotes = data || [];
        populateFilters();
        applyFilters();
    } catch (error) {
        console.error('Error loading notes:', error);
        alert('Error loading partner notes. Please refresh the page.');
    }
}

// Populate filter dropdowns
function populateFilters() {
    const uniqueHotels = [...new Set(allNotes.map(n => n.hotel_name))];
    const uniquePeriods = [...new Set(allNotes.map(n => n.review_period).filter(p => p))];

    // Populate hotel filter
    const filterHotel = document.getElementById('filter-hotel');
    filterHotel.innerHTML = '<option value="">All Hotels</option>';
    uniqueHotels.sort().forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel;
        option.textContent = hotel;
        filterHotel.appendChild(option);
    });

    // Populate period filter
    const filterPeriod = document.getElementById('filter-period');
    filterPeriod.innerHTML = '<option value="">All Periods</option>';
    uniquePeriods.sort().reverse().forEach(period => {
        const option = document.createElement('option');
        option.value = period;
        option.textContent = period;
        filterPeriod.appendChild(option);
    });
}

// Apply filters and display notes
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterHotel = document.getElementById('filter-hotel').value;
    const filterPeriod = document.getElementById('filter-period').value;

    let filtered = allNotes.filter(note => {
        const matchesSearch = searchTerm === '' ||
            note.hotel_name.toLowerCase().includes(searchTerm) ||
            (note.review_period && note.review_period.toLowerCase().includes(searchTerm));

        const matchesHotel = filterHotel === '' || note.hotel_name === filterHotel;
        const matchesPeriod = filterPeriod === '' || note.review_period === filterPeriod;

        return matchesSearch && matchesHotel && matchesPeriod;
    });

    displayNotes(filtered);
}

// Display notes in grid
function displayNotes(notes) {
    const grid = document.getElementById('notes-grid');
    grid.innerHTML = '';

    if (notes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3>No partner notes found</h3>
                <p>Create a new partner note to get started.</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const card = createNoteCard(note);
        grid.appendChild(card);
    });
}

// Create note card element
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';

    // Format date
    const reviewDate = note.review_date ? new Date(note.review_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }) : 'No date specified';

    const updatedAt = note.updated_at ? new Date(note.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : '';

    // Role-based actions
    let actionsHtml = '';
    const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'creator' || currentUser.role === 'editor');
    const canDelete = currentUser && currentUser.role === 'admin';

    if (canEdit || canDelete) {
        let buttonsHtml = '';
        if (canEdit) {
            buttonsHtml += `<button class="btn-icon btn-edit" onclick="window.editNote('${note.id}')">Edit</button>`;
        }
        if (canDelete) {
            buttonsHtml += `<button class="btn-icon btn-delete" onclick="window.deleteNote('${note.id}')">Delete</button>`;
        }
        actionsHtml = `<div class="note-card-actions">${buttonsHtml}</div>`;
    }

    card.innerHTML = `
        <div class="note-card-header">
            <div class="note-card-title">
                <h2>${note.hotel_name}</h2>
                <div class="note-card-meta">
                    ${note.review_period || 'No period specified'} • ${reviewDate} • Updated ${updatedAt}
                </div>
            </div>
            ${actionsHtml}
        </div>

        ${createSection('Keys to Success', note.keys_to_success)}
        ${createSection('New Supply', note.new_supply)}
        ${createSection('Market Updates', note.market_updates)}
        ${createSection('STR/Revenue - Market', note.str_revenue_market)}
        ${createSection('STR/Revenue - Hotel', note.str_revenue_hotel)}
        ${createSection('Accounts - Top', note.accounts_top)}
        ${createSection('Accounts - Target', note.accounts_target)}
        ${createSection('Expense/GOP Update', note.expense_gop_update)}
        ${createSection('Capital', note.capital)}
        ${note.notes ? createSection('Additional Notes', note.notes) : ''}
    `;

    return card;
}

// Create section HTML
function createSection(title, content) {
    if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
        return '';
    }

    return `
        <div class="note-section">
            <div class="note-section-title">${title}</div>
            <div class="note-section-content">${content}</div>
        </div>
    `;
}

// Event listeners for filters
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-hotel').addEventListener('change', applyFilters);
document.getElementById('filter-period').addEventListener('change', applyFilters);

// Create new note button
document.getElementById('create-note-btn')?.addEventListener('click', () => {
    editingNoteId = null;
    document.getElementById('modal-title').textContent = 'New Partner Note';
    document.getElementById('note-form').reset();

    // Clear all Quill editors
    Object.values(editors).forEach(editor => {
        if (editor) {
            editor.setText('');
        }
    });

    document.getElementById('note-modal').classList.add('active');
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('note-modal').classList.remove('active');
});

// Form submission
document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();

    const getEditorContent = (editorId) => {
        const editor = editors[editorId];
        if (!editor) return null;
        const content = editor.root.innerHTML.trim();
        return content === '<p><br></p>' ? null : content;
    };

    const noteData = {
        hotel_name: document.getElementById('note-hotel').value,
        review_period: document.getElementById('note-period').value || null,
        review_date: document.getElementById('note-review-date').value || null,
        keys_to_success: getEditorContent('keys-to-success-editor'),
        new_supply: getEditorContent('new-supply-editor'),
        market_updates: getEditorContent('market-updates-editor'),
        str_revenue_market: getEditorContent('str-revenue-market-editor'),
        str_revenue_hotel: getEditorContent('str-revenue-hotel-editor'),
        accounts_top: getEditorContent('accounts-top-editor'),
        accounts_target: getEditorContent('accounts-target-editor'),
        expense_gop_update: getEditorContent('expense-gop-editor'),
        capital: getEditorContent('capital-editor'),
        notes: getEditorContent('notes-editor')
    };

    try {
        if (editingNoteId) {
            // Update existing note
            noteData.updated_by = session.user.id;

            const { error } = await supabase
                .from('hotel_partner_notes')
                .update(noteData)
                .eq('id', editingNoteId);

            if (error) throw error;
            alert('Partner note updated successfully');
        } else {
            // Create new note
            noteData.created_by = session.user.id;
            noteData.updated_by = session.user.id;

            const { error } = await supabase
                .from('hotel_partner_notes')
                .insert([noteData]);

            if (error) throw error;
            alert('Partner note created successfully');
        }

        document.getElementById('note-modal').classList.remove('active');
        await loadNotes();
    } catch (error) {
        console.error('Error saving partner note:', error);
        alert('Error saving partner note: ' + error.message);
    }
});

// Edit note
window.editNote = async (noteId) => {
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;

    editingNoteId = noteId;
    document.getElementById('modal-title').textContent = 'Edit Partner Note';

    document.getElementById('note-hotel').value = note.hotel_name;
    document.getElementById('note-period').value = note.review_period || '';
    document.getElementById('note-review-date').value = note.review_date || '';

    // Set content for each editor
    const setEditorContent = (editorId, content) => {
        const editor = editors[editorId];
        if (editor) {
            if (content) {
                editor.root.innerHTML = content;
            } else {
                editor.setText('');
            }
        }
    };

    setEditorContent('keys-to-success-editor', note.keys_to_success);
    setEditorContent('new-supply-editor', note.new_supply);
    setEditorContent('market-updates-editor', note.market_updates);
    setEditorContent('str-revenue-market-editor', note.str_revenue_market);
    setEditorContent('str-revenue-hotel-editor', note.str_revenue_hotel);
    setEditorContent('accounts-top-editor', note.accounts_top);
    setEditorContent('accounts-target-editor', note.accounts_target);
    setEditorContent('expense-gop-editor', note.expense_gop_update);
    setEditorContent('capital-editor', note.capital);
    setEditorContent('notes-editor', note.notes);

    document.getElementById('note-modal').classList.add('active');
};

// Delete note
window.deleteNote = (noteId) => {
    noteToDelete = noteId;
    document.getElementById('delete-modal').classList.add('active');
};

// Cancel delete
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    noteToDelete = null;
    document.getElementById('delete-modal').classList.remove('active');
});

// Confirm delete
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!noteToDelete) return;

    try {
        const { error } = await supabase
            .from('hotel_partner_notes')
            .delete()
            .eq('id', noteToDelete);

        if (error) throw error;

        alert('Partner note deleted successfully');
        document.getElementById('delete-modal').classList.remove('active');
        noteToDelete = null;
        await loadNotes();
    } catch (error) {
        console.error('Error deleting partner note:', error);
        alert('Error deleting partner note: ' + error.message);
    }
});
