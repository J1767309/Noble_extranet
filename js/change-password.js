import { supabase } from './supabase-config.js';

// Open change password modal
document.getElementById('change-password-btn')?.addEventListener('click', () => {
    document.getElementById('change-password-modal').style.display = 'block';
    document.getElementById('change-password-form').reset();
});

// Close change password modal
document.getElementById('cancel-password-btn')?.addEventListener('click', () => {
    document.getElementById('change-password-modal').style.display = 'none';
});

// Close modal when clicking outside
document.getElementById('change-password-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'change-password-modal') {
        document.getElementById('change-password-modal').style.display = 'none';
    }
});

// Handle password change form submission
document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    try {
        // Update password using Supabase Auth
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        // Success
        alert('Password changed successfully!');
        document.getElementById('change-password-modal').style.display = 'none';
        document.getElementById('change-password-form').reset();
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password: ' + error.message);
    }
});
