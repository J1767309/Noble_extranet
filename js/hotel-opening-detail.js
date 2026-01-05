import { supabase } from './supabase-config.js';

let currentUser = null;
let currentProject = null;
let allTasks = [];
let projectId = null;
let assignedUsers = [];
let allUsers = [];

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
projectId = urlParams.get('id');

if (!projectId) {
    window.location.href = 'hotel-openings.html';
}

// Check authentication and load project
async function init() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const userId = session.user.id;
        const userEmail = session.user.email;

        // Get user data
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

            // Show User Management link for admins
            if (userData.role === 'admin') {
                const userMgmtLink = document.getElementById('user-management-link');
                if (userMgmtLink) userMgmtLink.style.display = 'flex';
            }

            // Show Hotel Tracker and BI Tools link for internal users
            if (userData.user_type === 'internal') {
                const hotelTrackerLink = document.getElementById('hotel-tracker-link');
                const biToolsLink = document.getElementById('bi-tools-link');
                const hotelFactSheetsLink = document.getElementById('hotel-fact-sheets-link');
                if (hotelTrackerLink) hotelTrackerLink.style.display = 'flex';
                if (biToolsLink) biToolsLink.style.display = 'flex';
                if (hotelFactSheetsLink) hotelFactSheetsLink.style.display = 'flex';
            }

            // Show add task button for admins, creators, and editors
            if (['admin', 'creator', 'editor'].includes(userData.role)) {
                document.getElementById('add-task-btn').classList.add('show');
            }

            // Show assign users button for admins and creators
            if (['admin', 'creator'].includes(userData.role)) {
                document.getElementById('assign-users-btn').classList.add('show');
            }

            // Show archive and delete buttons for admins and creators
            if (['admin', 'creator'].includes(userData.role)) {
                document.getElementById('archive-btn').classList.add('show');
                document.getElementById('delete-btn').classList.add('show');
            }
        }

        // Load project and tasks
        await loadProject();
        await loadTasks();
        await loadAssignedUsers();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load project details
async function loadProject() {
    try {
        const { data: project, error } = await supabase
            .from('hotel_projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) throw error;

        currentProject = project;

        // Update UI
        document.getElementById('project-name').textContent = project.name;
        document.getElementById('project-status').textContent = project.status;

        if (project.opening_date) {
            const date = new Date(project.opening_date);
            document.getElementById('opening-date').textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Update archive button text based on archived status
        const archiveBtnText = document.getElementById('archive-btn-text');
        if (archiveBtnText) {
            archiveBtnText.textContent = project.archived ? 'Unarchive' : 'Archive';
        }

    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project: ' + error.message);
        window.location.href = 'hotel-openings.html';
    }
}

// Load tasks for the project
async function loadTasks() {
    try {
        const { data: tasks, error } = await supabase
            .from('project_tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('department', { ascending: true })
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) throw error;

        allTasks = tasks || [];
        updateTasksProgress();
        populateDepartmentFilter();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Error loading tasks: ' + error.message);
    }
}

// Update tasks progress display and stats dashboard
function updateTasksProgress() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'Complete').length;
    const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
    const notStarted = allTasks.filter(t => t.status === 'Not Started').length;
    const needResources = allTasks.filter(t => t.status === 'Need Resources').length;
    const notApplicable = allTasks.filter(t => t.status === 'Not Applicable').length;

    // Update progress text
    document.getElementById('tasks-progress').textContent = `${completed} of ${total} tasks complete`;

    // Update stats dashboard
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-complete').textContent = completed;
    document.getElementById('stat-in-progress').textContent = inProgress;
    document.getElementById('stat-not-started').textContent = notStarted;
    document.getElementById('stat-need-resources').textContent = needResources;
    document.getElementById('stat-not-applicable').textContent = notApplicable;

    // Update percentages
    if (total > 0) {
        document.getElementById('stat-complete-pct').textContent = `${Math.round((completed / total) * 100)}%`;
        document.getElementById('stat-in-progress-pct').textContent = `${Math.round((inProgress / total) * 100)}%`;
        document.getElementById('stat-not-started-pct').textContent = `${Math.round((notStarted / total) * 100)}%`;
        document.getElementById('stat-need-resources-pct').textContent = `${Math.round((needResources / total) * 100)}%`;
        document.getElementById('stat-not-applicable-pct').textContent = `${Math.round((notApplicable / total) * 100)}%`;
    }
}

// Populate department filter with unique departments
function populateDepartmentFilter() {
    const departments = [...new Set(allTasks.map(t => t.department))].sort();
    const filter = document.getElementById('department-filter');

    // Keep the "All Departments" option
    filter.innerHTML = '<option value="all">All Departments</option>';

    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = formatDepartmentName(dept);
        filter.appendChild(option);
    });
}

// Format department name for display
function formatDepartmentName(dept) {
    return dept.replace(/_/g, ' ').replace(/Opening /g, 'Opening - ');
}

// Render tasks grouped by department
function renderTasks() {
    const statusFilter = document.getElementById('status-filter').value;
    const departmentFilter = document.getElementById('department-filter').value;

    // Filter tasks
    let filteredTasks = allTasks;

    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.department === departmentFilter);
    }

    const container = document.getElementById('tasks-container');

    if (filteredTasks.length === 0) {
        container.innerHTML = '<div class="empty-tasks">No tasks found matching the filters</div>';
        return;
    }

    // Group tasks by department
    const tasksByDepartment = filteredTasks.reduce((acc, task) => {
        if (!acc[task.department]) {
            acc[task.department] = [];
        }
        acc[task.department].push(task);
        return acc;
    }, {});

    // Render each department section
    container.innerHTML = Object.keys(tasksByDepartment).sort().map(department => {
        const tasks = tasksByDepartment[department];
        const completedCount = tasks.filter(t => t.status === 'Complete').length;

        return `
            <div class="department-section">
                <div class="department-header">
                    <span class="department-title">${formatDepartmentName(department)}</span>
                    <span class="department-count">${completedCount}/${tasks.length} complete</span>
                </div>
                <table class="tasks-table">
                    <thead>
                        <tr>
                            <th style="width: 30%;">Task Name</th>
                            <th style="width: 15%;">Status</th>
                            <th style="width: 12%;">Target Date</th>
                            <th style="width: 15%;">Responsible</th>
                            <th style="width: 8%;">Steps</th>
                            <th style="width: 20%;">Additional Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map(task => renderTaskRow(task)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}

// Render a single task row
function renderTaskRow(task) {
    const targetDate = task.target_date
        ? new Date(task.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
        : '—';

    const statusClass = task.status.toLowerCase().replace(/\s+/g, '-');

    return `
        <tr onclick="editTask('${task.id}')" style="cursor: pointer;">
            <td class="task-name">${escapeHtml(task.task_name)}</td>
            <td><span class="task-status status-${statusClass}">${escapeHtml(task.status)}</span></td>
            <td class="task-date">${targetDate}</td>
            <td>${escapeHtml(task.responsible || '—')}</td>
            <td>${escapeHtml(task.steps_done || '—')}</td>
            <td style="font-size: 0.8125rem; color: #6b7280;">${escapeHtml(truncate(task.additional_info || '', 50))}</td>
        </tr>
    `;
}

// Truncate text with ellipsis
function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Edit task
window.editTask = async function(taskId) {
    // Only allow editing for users with appropriate permissions
    if (!currentUser || !['admin', 'creator', 'editor'].includes(currentUser.role)) {
        return;
    }

    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    // Populate form
    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-name').value = task.task_name;
    document.getElementById('task-department').value = task.department;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-target-date').value = task.target_date || '';
    document.getElementById('task-responsible').value = task.responsible || '';
    document.getElementById('task-additional-info').value = task.additional_info || '';
    document.getElementById('task-steps').value = task.steps_done || '';
    document.getElementById('task-tag').value = task.tag || '';

    document.getElementById('task-modal').classList.add('active');
};

// Load assigned users for the project
async function loadAssignedUsers() {
    try {
        const { data: assignments, error } = await supabase
            .from('project_users')
            .select(`
                user_id,
                users (
                    id,
                    name,
                    email
                )
            `)
            .eq('project_id', projectId);

        if (error) throw error;

        assignedUsers = assignments ? assignments.map(a => a.users) : [];
        renderAssignedUsers();
    } catch (error) {
        console.error('Error loading assigned users:', error);
    }
}

// Render assigned users in the header
function renderAssignedUsers() {
    const container = document.getElementById('assigned-users');
    const assignBtn = document.getElementById('assign-users-btn');

    // Clear existing badges (keep the button)
    const existingBadges = container.querySelectorAll('.user-badge');
    existingBadges.forEach(badge => badge.remove());

    if (assignedUsers.length === 0) {
        // Just show the assign button
        return;
    }

    // Add user badges before the assign button
    assignedUsers.forEach(user => {
        const badge = document.createElement('div');
        badge.className = 'user-badge';
        badge.innerHTML = `
            <span>${escapeHtml(user.name)}</span>
            ${currentUser && ['admin', 'creator'].includes(currentUser.role) ? `
                <button class="user-badge-remove" onclick="removeUserFromProject('${user.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            ` : ''}
        `;
        container.insertBefore(badge, assignBtn);
    });
}

// Load all users for assignment modal
async function loadAllUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('name');

        if (error) throw error;

        allUsers = users || [];
        renderUsersList();
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users: ' + error.message);
    }
}

// Render users list in assignment modal
function renderUsersList() {
    const container = document.getElementById('users-list');

    if (allUsers.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #6b7280;">No users found</div>';
        return;
    }

    const assignedUserIds = new Set(assignedUsers.map(u => u.id));

    container.innerHTML = allUsers.map(user => `
        <div class="user-item">
            <div class="user-info-item">
                <span class="user-name">${escapeHtml(user.name)}</span>
                <span class="user-email">${escapeHtml(user.email)}</span>
            </div>
            <div class="checkbox-container">
                <input
                    type="checkbox"
                    id="user-${user.id}"
                    ${assignedUserIds.has(user.id) ? 'checked' : ''}
                    onchange="toggleUserAssignment('${user.id}', this.checked)"
                >
            </div>
        </div>
    `).join('');
}

// Toggle user assignment
window.toggleUserAssignment = async function(userId, isAssigned) {
    try {
        if (isAssigned) {
            // Assign user to project
            const { error } = await supabase
                .from('project_users')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    assigned_by: currentUser.id
                });

            if (error) throw error;
        } else {
            // Remove user from project
            const { error } = await supabase
                .from('project_users')
                .delete()
                .eq('project_id', projectId)
                .eq('user_id', userId);

            if (error) throw error;
        }

        // Reload assigned users
        await loadAssignedUsers();
    } catch (error) {
        console.error('Error toggling user assignment:', error);
        alert('Error updating assignment: ' + error.message);
        // Reload the list to reset checkbox state
        renderUsersList();
    }
};

// Remove user from project
window.removeUserFromProject = async function(userId) {
    if (!confirm('Remove this user from the project?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('project_users')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) throw error;

        await loadAssignedUsers();

        // Update modal if it's open
        if (allUsers.length > 0) {
            renderUsersList();
        }
    } catch (error) {
        console.error('Error removing user:', error);
        alert('Error removing user: ' + error.message);
    }
};

// Archive project
async function archiveProject() {
    if (!currentProject) return;

    const action = currentProject.archived ? 'unarchive' : 'archive';
    const confirmMsg = currentProject.archived
        ? 'Are you sure you want to unarchive this project? It will appear in the active projects list.'
        : 'Are you sure you want to archive this project? It will be moved to the archived section.';

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('hotel_projects')
            .update({ archived: !currentProject.archived })
            .eq('id', projectId);

        if (error) throw error;

        // Redirect back to hotel openings page
        window.location.href = 'hotel-openings.html';
    } catch (error) {
        console.error(`Error ${action}ing project:`, error);
        alert(`Error ${action}ing project: ` + error.message);
    }
}

// Delete project
async function deleteProject() {
    if (!currentProject) return;

    const confirmMsg = `Are you sure you want to DELETE this project?\n\n"${currentProject.name}"\n\nThis will permanently delete the project and all ${allTasks.length} tasks. This action cannot be undone.`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // Double confirmation for safety
    if (!confirm('This is your final confirmation. Are you absolutely sure you want to delete this project?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('hotel_projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;

        // Redirect back to hotel openings page
        window.location.href = 'hotel-openings.html';
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project: ' + error.message);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
document.getElementById('assign-users-btn').addEventListener('click', async () => {
    await loadAllUsers();
    document.getElementById('assign-users-modal').classList.add('active');
});

document.getElementById('cancel-assign-btn').addEventListener('click', () => {
    document.getElementById('assign-users-modal').classList.remove('active');
});

document.getElementById('assign-users-modal').addEventListener('click', (e) => {
    if (e.target.id === 'assign-users-modal') {
        document.getElementById('assign-users-modal').classList.remove('active');
    }
});

document.getElementById('add-task-btn').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add Task';
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-status').value = 'Not Started';
    document.getElementById('task-modal').classList.add('active');
});

document.getElementById('cancel-task-btn').addEventListener('click', () => {
    document.getElementById('task-modal').classList.remove('active');
});

document.getElementById('task-modal').addEventListener('click', (e) => {
    if (e.target.id === 'task-modal') {
        document.getElementById('task-modal').classList.remove('active');
    }
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const taskData = {
        task_name: document.getElementById('task-name').value.trim(),
        department: document.getElementById('task-department').value,
        status: document.getElementById('task-status').value,
        target_date: document.getElementById('task-target-date').value || null,
        responsible: document.getElementById('task-responsible').value.trim() || null,
        additional_info: document.getElementById('task-additional-info').value.trim() || null,
        steps_done: document.getElementById('task-steps').value.trim() || null,
        tag: document.getElementById('task-tag').value.trim() || null
    };

    try {
        if (taskId) {
            // Update existing task
            const { error } = await supabase
                .from('project_tasks')
                .update(taskData)
                .eq('id', taskId);

            if (error) throw error;
        } else {
            // Create new task
            const { error } = await supabase
                .from('project_tasks')
                .insert({
                    ...taskData,
                    project_id: projectId
                });

            if (error) throw error;
        }

        document.getElementById('task-modal').classList.remove('active');
        await loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task: ' + error.message);
    }
});

// Filter change handlers
document.getElementById('status-filter').addEventListener('change', renderTasks);
document.getElementById('department-filter').addEventListener('change', renderTasks);

// Archive button
document.getElementById('archive-btn').addEventListener('click', archiveProject);

// Delete button
document.getElementById('delete-btn').addEventListener('click', deleteProject);

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out: ' + error.message);
    }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
    }
});

// Initialize
init();
