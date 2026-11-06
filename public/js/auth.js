export class AuthManager {
  constructor() {
    this.baseUrl = window.APP_CONFIG?.baseUrl || '';
    this.currentUser = null;
    this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    this.onAuthStateChange = null;

    this.cacheElements();
    this.bindEvents();
    this.checkAuthStatus();
  }

  cacheElements() {
    this.elements = {
      modalAuth: document.getElementById('modal-auth'),
      btnCloseAuthModal: document.getElementById('btn-close-auth-modal'),
      btnOpenAuthModal: document.getElementById('btn-auth-modal'),
      userProfileMenu: document.getElementById('user-profile-menu'),
      userNameDisplay: document.getElementById('user-name-display'),
      userAvatar: document.getElementById('user-avatar'),
      btnLogout: document.getElementById('btn-logout'),

      // Tabs
      tabBtnLogin: document.getElementById('tab-btn-login'),
      tabBtnRegister: document.getElementById('tab-btn-register'),
      formLogin: document.getElementById('form-login'),
      formRegister: document.getElementById('form-register'),

      // Inputs
      loginEmail: document.getElementById('login-email'),
      loginPassword: document.getElementById('login-password'),
      regName: document.getElementById('reg-name'),
      regEmail: document.getElementById('reg-email'),
      regPassword: document.getElementById('reg-password'),

      // Alerts
      authErrorMsg: document.getElementById('auth-error-msg'),
      authSuccessMsg: document.getElementById('auth-success-msg'),
    };
  }

  bindEvents() {
    const { elements } = this;

    // Open & Close Modal
    elements.btnOpenAuthModal?.addEventListener('click', () => {
      this.openModal('login');
    });

    elements.btnCloseAuthModal?.addEventListener('click', () => {
      this.closeModal();
    });

    elements.modalAuth?.addEventListener('click', (e) => {
      if (e.target === elements.modalAuth) {
        this.closeModal();
      }
    });

    // Tab Switches
    elements.tabBtnLogin?.addEventListener('click', () => this.switchTab('login'));
    elements.tabBtnRegister?.addEventListener('click', () => this.switchTab('register'));

    // Submit Login
    elements.formLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.login(elements.loginEmail.value, elements.loginPassword.value);
    });

    // Submit Register
    elements.formRegister?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.register(elements.regName.value, elements.regEmail.value, elements.regPassword.value);
    });

    // Logout
    elements.btnLogout?.addEventListener('click', async () => {
      await this.logout();
    });
  }

  openModal(tab = 'login') {
    this.clearAlerts();
    this.switchTab(tab);
    this.elements.modalAuth.classList.remove('hidden');
  }

  closeModal() {
    this.elements.modalAuth.classList.add('hidden');
    this.clearAlerts();
  }

  switchTab(tab) {
    this.clearAlerts();
    if (tab === 'login') {
      this.elements.tabBtnLogin.classList.add('active');
      this.elements.tabBtnRegister.classList.remove('active');
      this.elements.formLogin.classList.remove('hidden');
      this.elements.formRegister.classList.add('hidden');
    } else {
      this.elements.tabBtnRegister.classList.add('active');
      this.elements.tabBtnLogin.classList.remove('active');
      this.elements.formRegister.classList.remove('hidden');
      this.elements.formLogin.classList.add('hidden');
    }
  }

  showError(message) {
    this.elements.authErrorMsg.textContent = message;
    this.elements.authErrorMsg.classList.remove('hidden');
    this.elements.authSuccessMsg.classList.add('hidden');
  }

  showSuccess(message) {
    this.elements.authSuccessMsg.textContent = message;
    this.elements.authSuccessMsg.classList.remove('hidden');
    this.elements.authErrorMsg.classList.add('hidden');
  }

  clearAlerts() {
    this.elements.authErrorMsg.classList.add('hidden');
    this.elements.authSuccessMsg.classList.add('hidden');
  }

  async checkAuthStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.authenticated) {
        this.setAuthenticatedUser(data.user);
      } else {
        this.setGuest();
      }
    } catch {
      this.setGuest();
    }
  }

  async login(email, password) {
    this.clearAlerts();
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.showSuccess('Login berhasil! Menghubungkan ke pustaka...');
        this.setAuthenticatedUser(data.user);
        setTimeout(() => this.closeModal(), 600);
      } else {
        this.showError(data.message || 'Gagal login.');
      }
    } catch (err) {
      this.showError('Terjadi kesalahan jaringan: ' + err.message);
    }
  }

  async register(name, email, password) {
    this.clearAlerts();
    try {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.showSuccess('Akun berhasil dibuat! Selamat datang di 3D Studio.');
        this.setAuthenticatedUser(data.user);
        setTimeout(() => this.closeModal(), 600);
      } else {
        this.showError(data.message || 'Gagal registrasi.');
      }
    } catch (err) {
      this.showError('Terjadi kesalahan jaringan: ' + err.message);
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.csrfToken
        }
      });
      this.setGuest();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  setAuthenticatedUser(user) {
    this.currentUser = user;
    this.elements.btnOpenAuthModal.classList.add('hidden');
    this.elements.userProfileMenu.classList.remove('hidden');
    this.elements.userNameDisplay.textContent = user.name;
    this.elements.userAvatar.textContent = user.name.charAt(0).toUpperCase();

    if (this.onAuthStateChange) {
      this.onAuthStateChange(user);
    }
  }

  setGuest() {
    this.currentUser = null;
    this.elements.btnOpenAuthModal.classList.remove('hidden');
    this.elements.userProfileMenu.classList.add('hidden');

    if (this.onAuthStateChange) {
      this.onAuthStateChange(null);
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

