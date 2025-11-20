import { supabase } from './supabase-config.js';

let allTools = [];
let currentUser = null;
let editingToolId = null;
let toolToDelete = null;

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
        alert('Access denied. Business Intelligence Tools are only available to internal users.');
        window.location.href = 'dashboard.html';
        return;
    }

    currentUser = userData;

    // Show Hotel Tracker link for internal users
    document.getElementById('hotel-tracker-link').style.display = 'flex';

    // Show user management link if admin
    if (userData.role === 'admin') {
        document.getElementById('user-management-link').style.display = 'flex';
        // Show admin UI elements
        document.getElementById('create-tool-btn').style.display = 'inline-flex';
        document.getElementById('actions-header').classList.add('show');
    }

    document.getElementById('user-email').textContent = session.user.email;
    await loadTools();
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

// Load tools from database
async function loadTools() {
    try {
        const { data, error } = await supabase
            .from('bi_tools')
            .select('*')
            .order('number', { ascending: true });

        if (error) throw error;

        allTools = data || [];
        displayTools(allTools);
    } catch (error) {
        console.error('Error loading tools:', error);
        alert('Error loading BI tools. Please refresh the page.');
    }
}

// Display tools in table
function displayTools(tools) {
    const tbody = document.getElementById('tools-table-body');
    tbody.innerHTML = '';

    if (tools.length === 0) {
        const colspan = currentUser?.role === 'admin' ? '6' : '5';
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 3rem; color: #6b7280;">No tools found</td></tr>`;
        return;
    }

    tools.forEach(tool => {
        const tr = document.createElement('tr');

        // Frequency badge
        let frequencyClass = 'frequency-monthly';
        if (tool.frequency === 'Daily') frequencyClass = 'frequency-daily';
        else if (tool.frequency === 'Weekly') frequencyClass = 'frequency-weekly';

        const frequencyBadge = `<span class="frequency-badge ${frequencyClass}">${tool.frequency}</span>`;

        // Location/Link
        let locationHtml = '';
        if (tool.link) {
            locationHtml = `<a href="${tool.link}" target="_blank" rel="noopener noreferrer">
                ${tool.location}
                <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>`;
        } else {
            locationHtml = tool.location.replace(/\n/g, '<br>');
        }

        // Admin actions
        let actionsHtml = '';
        if (currentUser?.role === 'admin') {
            actionsHtml = `
                <td class="tool-actions">
                    <button class="btn-icon btn-edit" onclick="window.editTool('${tool.id}')" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="window.deleteTool('${tool.id}')" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
        }

        tr.innerHTML = `
            <td class="tool-number">${tool.number}</td>
            <td class="tool-name">${tool.name}</td>
            <td class="tool-description">${tool.description.replace(/\n/g, '<br>')}</td>
            <td class="tool-frequency">${frequencyBadge}</td>
            <td class="tool-link">${locationHtml}</td>
            ${actionsHtml}
        `;

        tbody.appendChild(tr);
    });
}

// Search functionality
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();

    if (!searchQuery) {
        displayTools(allTools);
        return;
    }

    const filtered = allTools.filter(tool => {
        const name = tool.name.toLowerCase();
        const description = tool.description.toLowerCase();
        return name.includes(searchQuery) || description.includes(searchQuery);
    });

    displayTools(filtered);
});

// Create tool button
document.getElementById('create-tool-btn')?.addEventListener('click', () => {
    editingToolId = null;
    document.getElementById('tool-modal-title').textContent = 'Create New Tool';
    document.getElementById('tool-form').reset();
    document.getElementById('tool-modal').classList.add('active');
});

// Cancel tool button
document.getElementById('cancel-tool-btn').addEventListener('click', () => {
    document.getElementById('tool-modal').classList.remove('active');
});

// Tool form submission
document.getElementById('tool-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const toolData = {
        number: parseInt(document.getElementById('tool-number').value),
        name: document.getElementById('tool-name').value,
        description: document.getElementById('tool-description').value,
        frequency: document.getElementById('tool-frequency').value,
        location: document.getElementById('tool-location').value,
        link: document.getElementById('tool-link').value || null
    };

    try {
        if (editingToolId) {
            // Update existing tool
            const { error } = await supabase
                .from('bi_tools')
                .update(toolData)
                .eq('id', editingToolId);

            if (error) throw error;
            alert('Tool updated successfully!');
        } else {
            // Create new tool
            const { error } = await supabase
                .from('bi_tools')
                .insert([toolData]);

            if (error) throw error;
            alert('Tool created successfully!');
        }

        document.getElementById('tool-modal').classList.remove('active');
        await loadTools();
    } catch (error) {
        console.error('Error saving tool:', error);
        if (error.code === '23505') {
            alert('A tool with this number already exists. Please use a different number.');
        } else {
            alert('Error saving tool: ' + error.message);
        }
    }
});

// Edit tool function (exposed to window for onclick)
window.editTool = async (toolId) => {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    editingToolId = toolId;
    document.getElementById('tool-modal-title').textContent = 'Edit Tool';
    document.getElementById('tool-number').value = tool.number;
    document.getElementById('tool-name').value = tool.name;
    document.getElementById('tool-description').value = tool.description;
    document.getElementById('tool-frequency').value = tool.frequency;
    document.getElementById('tool-location').value = tool.location;
    document.getElementById('tool-link').value = tool.link || '';
    document.getElementById('tool-modal').classList.add('active');
};

// Delete tool function (exposed to window for onclick)
window.deleteTool = (toolId) => {
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;

    toolToDelete = toolId;
    document.getElementById('delete-tool-name').textContent = tool.name;
    document.getElementById('delete-tool-modal').classList.add('active');
};

// Cancel delete button
document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-tool-modal').classList.remove('active');
    toolToDelete = null;
});

// Confirm delete button
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!toolToDelete) return;

    try {
        const { error } = await supabase
            .from('bi_tools')
            .delete()
            .eq('id', toolToDelete);

        if (error) throw error;

        alert('Tool deleted successfully!');
        document.getElementById('delete-tool-modal').classList.remove('active');
        toolToDelete = null;
        await loadTools();
    } catch (error) {
        console.error('Error deleting tool:', error);
        alert('Error deleting tool: ' + error.message);
    }
});

// Close modals when clicking outside
document.getElementById('tool-modal').addEventListener('click', (e) => {
    if (e.target.id === 'tool-modal') {
        document.getElementById('tool-modal').classList.remove('active');
    }
});

document.getElementById('delete-tool-modal').addEventListener('click', (e) => {
    if (e.target.id === 'delete-tool-modal') {
        document.getElementById('delete-tool-modal').classList.remove('active');
    }
});
