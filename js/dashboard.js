import { supabase } from './supabase-config.js';

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
            // Fallback to email
            document.getElementById('welcome-message').textContent = `Welcome, ${userEmail}`;
            document.getElementById('user-email').textContent = userEmail;
        } else {
            // Display user data
            const userName = userData.name || userEmail;
            document.getElementById('welcome-message').textContent = `Welcome, ${userName}`;
            document.getElementById('user-email').textContent = userEmail;

            // Show User Management link and card only for admins
            if (userData.role === 'admin') {
                const userMgmtLink = document.getElementById('user-management-link');
                const userMgmtCard = document.getElementById('user-management-card');
                if (userMgmtLink) userMgmtLink.style.display = 'flex';
                if (userMgmtCard) userMgmtCard.style.display = 'flex';
            }

            // Show BI Tools link only for internal users
            if (userData.user_type === 'internal') {
                const biToolsLink = document.getElementById('bi-tools-link');
                if (biToolsLink) biToolsLink.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        const userEmail = session.user.email;
        document.getElementById('welcome-message').textContent = `Welcome, ${userEmail}`;
        document.getElementById('user-email').textContent = userEmail;
    }
}

// Load user data on page load
loadUserData();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Dashboard auth state changed:', event);
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
        // Redirect will happen automatically via onAuthStateChange
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out: ' + error.message);
    }
});
