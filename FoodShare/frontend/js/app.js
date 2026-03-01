document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    const donorBtn = document.getElementById('donorBtn');
    const receiverBtn = document.getElementById('receiverBtn');
    const closeBtn = document.querySelector('.close');
    const authRoleTitle = document.getElementById('authRoleTitle');
    const signupRole = document.getElementById('signupRole');

    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const msgEl = document.getElementById('authMessage');

    let currentSelectedRole = '';

    const showModal = (role) => {
        currentSelectedRole = role;
        authRoleTitle.textContent = `${role} Access`;
        signupRole.value = role;
        modal.style.display = 'block';
    };

    const closeModal = () => { modal.style.display = 'none'; msgEl.textContent = ''; };

    if (donorBtn) donorBtn.onclick = () => showModal('Donor');
    if (receiverBtn) receiverBtn.onclick = () => showModal('Receiver');
    if (closeBtn) closeBtn.onclick = closeModal;

    window.onclick = (e) => {
        if (e.target == modal) closeModal();
    };

    if (tabLogin) {
        tabLogin.onclick = () => {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
        };
    }

    if (tabSignup) {
        tabSignup.onclick = () => {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
        };
    }

    const API_URL = 'http://localhost:5000/api';

    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    msgEl.textContent = 'Login successful! Redirecting...';
                    msgEl.className = 'message success';

                    setTimeout(() => {
                        if (data.role === 'Donor') window.location.href = 'donor.html';
                        else if (data.role === 'Receiver') window.location.href = 'receiver.html';
                        else if (data.role === 'Admin') window.location.href = 'admin.html';
                    }, 1000);
                } else {
                    msgEl.textContent = data.msg || 'Login failed';
                    msgEl.className = 'message error';
                }
            } catch (err) {
                msgEl.textContent = 'Server error. Please try again.';
                msgEl.className = 'message error';
            }
        };
    }

    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const role = document.getElementById('signupRole').value;

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await res.json();

                if (res.ok) {
                    msgEl.textContent = 'Registration successful! Please login.';
                    msgEl.className = 'message success';
                    signupForm.reset();
                    setTimeout(() => tabLogin.click(), 1500);
                } else {
                    msgEl.textContent = data.msg || 'Registration failed';
                    msgEl.className = 'message error';
                }
            } catch (err) {
                msgEl.textContent = 'Server error. Please try again.';
                msgEl.className = 'message error';
            }
        };
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}
