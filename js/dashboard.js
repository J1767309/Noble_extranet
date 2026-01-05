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

            // Show User Management and Bug Management link and card only for admins
            if (userData.role === 'admin') {
                const userMgmtLink = document.getElementById('user-management-link');
                const userMgmtCard = document.getElementById('user-management-card');
                const bugMgmtLink = document.getElementById('bug-management-link');
                const bugMgmtCard = document.getElementById('bug-management-card');
                if (userMgmtLink) userMgmtLink.style.display = 'flex';
                if (userMgmtCard) userMgmtCard.style.display = 'flex';
                if (bugMgmtLink) bugMgmtLink.style.display = 'flex';
                if (bugMgmtCard) bugMgmtCard.style.display = 'flex';
            }

            // Show Hotel Tracker, Hotel Top Accounts, Initiatives, BI Tools, and Hotel Fact Sheets link and card only for internal users
            if (userData.user_type === 'internal') {
                const hotelTrackerLink = document.getElementById('hotel-tracker-link');
                const hotelTrackerCard = document.getElementById('hotel-tracker-card');
                const hotelTopAccountsLink = document.getElementById('hotel-top-accounts-link');
                const hotelTopAccountsCard = document.getElementById('hotel-top-accounts-card');
                const initiativesLink = document.getElementById('initiatives-link');
                const initiativesCard = document.getElementById('initiatives-card');
                const biToolsLink = document.getElementById('bi-tools-link');
                const biToolsCard = document.getElementById('bi-tools-card');
                const hotelFactSheetsLink = document.getElementById('hotel-fact-sheets-link');
                const hotelFactSheetsCard = document.getElementById('hotel-fact-sheets-card');
                if (hotelTrackerLink) hotelTrackerLink.style.display = 'flex';
                if (hotelTrackerCard) hotelTrackerCard.style.display = 'flex';
                if (hotelTopAccountsLink) hotelTopAccountsLink.style.display = 'flex';
                if (hotelTopAccountsCard) hotelTopAccountsCard.style.display = 'flex';
                if (initiativesLink) initiativesLink.style.display = 'flex';
                if (initiativesCard) initiativesCard.style.display = 'flex';
                if (biToolsLink) biToolsLink.style.display = 'flex';
                if (biToolsCard) biToolsCard.style.display = 'flex';
                if (hotelFactSheetsLink) hotelFactSheetsLink.style.display = 'flex';
                if (hotelFactSheetsCard) hotelFactSheetsCard.style.display = 'flex';
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
