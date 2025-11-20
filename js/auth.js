import { supabase } from './supabase-config.js';

// Check if user is already logged in
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
    }
})();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    if (event === 'SIGNED_IN' && session) {
        console.log('Sign in detected, redirecting to dashboard');
        window.location.href = 'dashboard.html';
    }
});

// Toggle between login and signup forms
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    clearError();
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearError();
});

// Handle Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        console.log('Attempting to sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('Sign in successful, waiting for redirect...');
        // Redirect will happen automatically via onAuthStateChange
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    }
});

// Handle Signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const userType = document.getElementById('signup-user-type').value;

    try {
        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    user_type: userType
                }
            }
        });

        if (authError) throw authError;

        // Insert user data into users table
        const { error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    name: name,
                    email: email,
                    user_type: userType,
                    created_at: new Date().toISOString()
                }
            ]);

        if (dbError) throw dbError;

        // Redirect will happen automatically via onAuthStateChange
    } catch (error) {
        showError(error.message);
    }
});

// Error handling
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}
