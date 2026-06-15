/**
 * FoodieHub - Auth Page JavaScript
 * Login and Registration with validation
 */

// ===== FORM DETECTION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if already logged in
    const user = await checkAuth();
    if (user) {
        window.location.href = '../index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) setupLoginForm(loginForm);
    if (registerForm) setupRegisterForm(registerForm);
});

// ===== LOGIN =====
function setupLoginForm(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validate
        let valid = true;
        if (!email || !validateEmail(email)) {
            showFieldError('login-email', 'Please enter a valid email address');
            valid = false;
        }
        if (!password) {
            showFieldError('login-password', 'Password is required');
            valid = false;
        }
        if (!valid) return;

        const btn = document.getElementById('login-btn');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const response = await apiCall('/auth/login.php', 'POST', { email, password });
            if (response.success) {
                sessionStorage.setItem('foodiehub_user', JSON.stringify(response.data));
                showToast('Login successful! Welcome back 👋', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 800);
            }
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    });
}

// ===== REGISTER =====
function setupRegisterForm(form) {
    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            updatePasswordStrength(passwordInput.value);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const agreeTerms = document.getElementById('agree-terms')?.checked;

        // Validate
        let valid = true;
        if (!name || name.length < 2) {
            showFieldError('register-name', 'Name must be at least 2 characters');
            valid = false;
        }
        if (!email || !validateEmail(email)) {
            showFieldError('register-email', 'Please enter a valid email address');
            valid = false;
        }
        if (phone && !validatePhone(phone)) {
            showFieldError('register-phone', 'Please enter a valid phone number');
            valid = false;
        }
        if (!password || password.length < 6) {
            showFieldError('register-password', 'Password must be at least 6 characters');
            valid = false;
        }
        if (password !== confirm) {
            showFieldError('register-confirm', 'Passwords do not match');
            valid = false;
        }
        if (!agreeTerms) {
            showToast('Please agree to the Terms of Service', 'warning');
            valid = false;
        }
        if (!valid) return;

        const btn = document.getElementById('register-btn');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const response = await apiCall('/auth/register.php', 'POST', { name, email, phone, password });
            if (response.success) {
                sessionStorage.setItem('foodiehub_user', JSON.stringify(response.data));
                showToast('Account created successfully! 🎉', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 800);
            }
        } catch (error) {
            showToast(error.message || 'Registration failed', 'error');
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    });
}

// ===== VALIDATION HELPERS =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\+]?[\d\s\-\(\)]{7,15}$/.test(phone);
}

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(`${inputId}-error`);
    if (input) input.classList.add('error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(`${inputId}-error`);
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.classList.remove('show');
}

function clearAllErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('input.error').forEach(el => el.classList.remove('error'));
}

// ===== PASSWORD STRENGTH =====
function updatePasswordStrength(password) {
    const bar = document.getElementById('password-strength-bar');
    if (!bar) return;

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const widths = ['0%', '20%', '40%', '60%', '80%', '100%'];
    const colors = ['', 'var(--error)', 'var(--error)', 'var(--warning)', 'var(--success)', 'var(--success)'];

    bar.style.width = widths[strength];
    bar.style.background = colors[strength];
}

// ===== CLEAR ERRORS ON INPUT =====
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
        const errorEl = document.getElementById(`${e.target.id}-error`);
        if (errorEl) errorEl.classList.remove('show');
        e.target.classList.remove('error');
    }
});
