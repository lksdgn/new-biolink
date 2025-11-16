// Authentication Management

// LocalStorage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Salva tokens no localStorage
 */
function saveTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Retorna o access token
 */
function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Retorna o refresh token
 */
function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Salva dados do usuário
 */
function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retorna dados do usuário
 */
function getUser() {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Remove todos os dados de autenticação
 */
function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Verifica se o usuário está autenticado
 */
function isAuthenticated() {
  return !!getAccessToken();
}

/**
 * Faz login do usuário
 */
async function login(email, password) {
  try {
    const response = await authAPI.login(email, password);

    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      saveTokens(accessToken, refreshToken);
      saveUser(user);
      return { success: true, user };
    }

    throw new Error('Erro ao fazer login');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Registra um novo usuário
 */
async function register(email, password, username) {
  try {
    const response = await authAPI.register(email, password, username);

    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      saveTokens(accessToken, refreshToken);
      saveUser(user);
      return { success: true, user };
    }

    throw new Error('Erro ao registrar');
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

/**
 * Faz logout do usuário
 */
async function logout() {
  try {
    if (isAuthenticated()) {
      await authAPI.logout();
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
    window.location.href = '/login.html';
  }
}

/**
 * Renova o access token usando o refresh token
 */
async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('Sem refresh token');
    }

    const response = await authAPI.refresh(refreshToken);

    if (response.success) {
      const { accessToken } = response.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      return accessToken;
    }

    throw new Error('Erro ao renovar token');
  } catch (error) {
    console.error('Refresh token error:', error);
    clearAuth();
    window.location.href = '/login.html';
    throw error;
  }
}

/**
 * Middleware para proteger páginas que requerem autenticação
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Redireciona para dashboard se já estiver autenticado
 */
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = '/dashboard.html';
  }
}

/**
 * Busca dados atualizados do usuário
 */
async function fetchCurrentUser() {
  try {
    const response = await authAPI.me();
    if (response.success) {
      saveUser(response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Fetch user error:', error);
    // Se falhar, tentar renovar token
    try {
      await refreshAccessToken();
      const response = await authAPI.me();
      if (response.success) {
        saveUser(response.data);
        return response.data;
      }
    } catch (refreshError) {
      clearAuth();
      window.location.href = '/login.html';
    }
  }
  return null;
}

/**
 * Atualiza informações do usuário na UI
 */
function updateUserUI() {
  const user = getUser();

  if (!user) return;

  // Atualizar elementos com classe .user-email
  document.querySelectorAll('.user-email').forEach(el => {
    el.textContent = user.email;
  });

  // Atualizar elementos com classe .user-username
  document.querySelectorAll('.user-username').forEach(el => {
    el.textContent = user.username || user.email.split('@')[0];
  });

  // Atualizar elementos com classe .user-slug
  document.querySelectorAll('.user-slug').forEach(el => {
    el.textContent = user.slug;
  });

  // Mostrar badge de premium
  if (user.isPremium) {
    document.querySelectorAll('.premium-badge').forEach(el => {
      el.classList.remove('hidden');
    });
  }
}

/**
 * Inicializa autenticação na página
 */
function initAuth() {
  // Adicionar listener no botão de logout se existir
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Atualizar UI com dados do usuário
  updateUserUI();
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
