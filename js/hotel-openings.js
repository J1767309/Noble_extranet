import { supabase } from './supabase-config.js';

let currentUser = null;

// Check authentication and load projects
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

            // Show User Management and Bug Management link for admins
            if (userData.role === 'admin') {
                const userMgmtLink = document.getElementById('user-management-link');
                const bugMgmtLink = document.getElementById('bug-management-link');
                if (userMgmtLink) userMgmtLink.style.display = 'flex';
                if (bugMgmtLink) bugMgmtLink.style.display = 'flex';
            }

            // Show Hotel Tracker, Hotel Top Accounts, Initiatives, and BI Tools link for internal users
            if (userData.user_type === 'internal') {
                const hotelTrackerLink = document.getElementById('hotel-tracker-link');
                const hotelTopAccountsLink = document.getElementById('hotel-top-accounts-link');
                const initiativesLink = document.getElementById('initiatives-link');
                const biToolsLink = document.getElementById('bi-tools-link');
                const hotelFactSheetsLink = document.getElementById('hotel-fact-sheets-link');
                if (hotelTrackerLink) hotelTrackerLink.style.display = 'flex';
                if (hotelTopAccountsLink) hotelTopAccountsLink.style.display = 'flex';
                if (initiativesLink) initiativesLink.style.display = 'flex';
                if (biToolsLink) biToolsLink.style.display = 'flex';
                if (hotelFactSheetsLink) hotelFactSheetsLink.style.display = 'flex';
            }

            // Show create button for admins and creators
            if (userData.role === 'admin' || userData.role === 'creator') {
                document.getElementById('create-project-btn').classList.add('show');
            }

            // Update subtitle based on role
            const subtitle = document.querySelector('.subtitle');
            if (subtitle) {
                if (['editor', 'read-only'].includes(userData.role)) {
                    subtitle.textContent = 'Your assigned hotel opening projects';
                } else {
                    subtitle.textContent = 'Manage hotel opening projects and critical paths';
                }
            }
        }

        // Load projects
        await loadProjects();

        // Setup archived section toggle
        setupArchivedToggle();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load all hotel projects
async function loadProjects() {
    try {
        const { data: allProjects, error } = await supabase
            .from('hotel_projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Separate active and archived projects
        const activeProjects = allProjects ? allProjects.filter(p => !p.archived) : [];
        const archivedProjects = allProjects ? allProjects.filter(p => p.archived) : [];

        // Render active projects
        await renderActiveProjects(activeProjects);

        // Render archived projects
        await renderArchivedProjects(archivedProjects);

    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Error loading projects: ' + error.message);
    }
}

// Render active projects
async function renderActiveProjects(projects) {
    const container = document.getElementById('projects-container');
    const emptyState = document.getElementById('empty-state');

    if (!projects || projects.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';

        // Update empty state message based on role
        const emptyStateTitle = emptyState.querySelector('h3');
        const emptyStateText = emptyState.querySelector('p');

        if (currentUser && ['editor', 'read-only'].includes(currentUser.role)) {
            emptyStateTitle.textContent = 'No assigned projects';
            emptyStateText.textContent = 'You haven\'t been assigned to any hotel projects yet. Contact an admin to be added to a project.';
        } else {
            emptyStateTitle.textContent = 'No hotel projects yet';
            emptyStateText.textContent = 'Create your first hotel opening project to get started';
        }
        return;
    }

    emptyState.style.display = 'none';

    // Load task counts for each project
    const projectsWithProgress = await Promise.all(
        projects.map(async (project) => {
            const { data: tasks, error: tasksError } = await supabase
                .from('project_tasks')
                .select('status')
                .eq('project_id', project.id);

            if (tasksError) {
                console.error('Error loading tasks for project:', tasksError);
                return { ...project, totalTasks: 0, completedTasks: 0 };
            }

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'Complete').length;

            return { ...project, totalTasks, completedTasks };
        })
    );

    // Render projects
    container.innerHTML = projectsWithProgress.map(project => renderProjectCard(project, false)).join('');
}

// Render archived projects
async function renderArchivedProjects(projects) {
    const archivedSection = document.getElementById('archived-section');
    const archivedContainer = document.getElementById('archived-projects-container');
    const archivedCount = document.getElementById('archived-count');

    if (!projects || projects.length === 0) {
        archivedSection.style.display = 'none';
        return;
    }

    archivedSection.style.display = 'block';
    archivedCount.textContent = projects.length;

    // Load task counts for each project
    const projectsWithProgress = await Promise.all(
        projects.map(async (project) => {
            const { data: tasks, error: tasksError } = await supabase
                .from('project_tasks')
                .select('status')
                .eq('project_id', project.id);

            if (tasksError) {
                return { ...project, totalTasks: 0, completedTasks: 0 };
            }

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'Complete').length;

            return { ...project, totalTasks, completedTasks };
        })
    );

    // Render archived projects
    archivedContainer.innerHTML = projectsWithProgress.map(project => renderProjectCard(project, true)).join('');
}

// Render a single project card
function renderProjectCard(project, isArchived) {
    const progress = project.totalTasks > 0
        ? Math.round((project.completedTasks / project.totalTasks) * 100)
        : 0;

    const openingDate = project.opening_date
        ? new Date(project.opening_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'No date set';

    const archivedClass = isArchived ? 'project-card-archived' : '';
    const archivedBadge = isArchived ? '<span class="archived-badge">Archived</span>' : '';

    return `
        <a href="hotel-opening-detail.html?id=${project.id}" class="project-card ${archivedClass}">
            <div class="project-card-header">
                <div>
                    <h3 class="project-name">${escapeHtml(project.name)}</h3>
                    <p class="project-date">Target Opening: ${openingDate}</p>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                    <span class="project-status status-${project.status.toLowerCase().replace(' ', '-')}">
                        ${escapeHtml(project.status)}
                    </span>
                    ${archivedBadge}
                </div>
            </div>
            <div class="project-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}%</span>
            </div>
            <p class="project-date" style="margin-top: 0.5rem;">
                ${project.completedTasks} of ${project.totalTasks} tasks complete
            </p>
        </a>
    `;
}

// Setup archived section toggle
function setupArchivedToggle() {
    const header = document.getElementById('archived-header');
    const content = document.getElementById('archived-content');
    const toggle = document.getElementById('archived-toggle');

    header.addEventListener('click', () => {
        content.classList.toggle('show');
        toggle.classList.toggle('expanded');
    });
}

// Create new project
async function createProject(name, openingDate, status) {
    try {
        const { data, error } = await supabase
            .from('hotel_projects')
            .insert({
                name: name,
                opening_date: openingDate || null,
                status: status,
                created_by: currentUser.id,
                archived: false
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
document.getElementById('create-project-btn').addEventListener('click', () => {
    document.getElementById('create-modal').classList.add('active');
    document.getElementById('create-project-form').reset();
});

document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('create-modal').classList.remove('active');
});

document.getElementById('create-modal').addEventListener('click', (e) => {
    if (e.target.id === 'create-modal') {
        document.getElementById('create-modal').classList.remove('active');
    }
});

document.getElementById('create-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('project-name').value.trim();
    const openingDate = document.getElementById('opening-date').value;
    const status = document.getElementById('project-status').value;

    if (!name) {
        alert('Please enter a project name');
        return;
    }

    try {
        const project = await createProject(name, openingDate, status);
        document.getElementById('create-modal').classList.remove('active');

        // Redirect to the new project detail page
        window.location.href = `hotel-opening-detail.html?id=${project.id}`;
    } catch (error) {
        alert('Error creating project: ' + error.message);
    }
});

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
