// API Configuration and Communication

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Faz uma requisição HTTP para a API
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Faz uma requisição autenticada (com JWT)
 */
async function authRequest(endpoint, options = {}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Não autenticado');
  }

  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}

// Auth API
const authAPI = {
  async register(email, password, username) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  },

  async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return authRequest('/auth/logout', {
      method: 'POST',
    });
  },

  async refresh(refreshToken) {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async me() {
    return authRequest('/auth/me');
  },
};

// Pages API
const pagesAPI = {
  async getMyPage() {
    return authRequest('/pages/me');
  },

  async getPageById(id) {
    return authRequest(`/pages/${id}`);
  },

  async createPage(data) {
    return authRequest('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePage(id, data) {
    return authRequest(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePage(id) {
    return authRequest(`/pages/${id}`, {
      method: 'DELETE',
    });
  },
};

// Blocks API
const blocksAPI = {
  async createBlock(pageId, data) {
    return authRequest(`/blocks/${pageId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBlock(blockId, data) {
    return authRequest(`/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBlock(blockId) {
    return authRequest(`/blocks/${blockId}`, {
      method: 'DELETE',
    });
  },

  async reorderBlocks(pageId, blocks) {
    return authRequest(`/blocks/${pageId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ blocks }),
    });
  },
};

// Badges API
const badgesAPI = {
  async getPresets() {
    return authRequest('/badges/presets');
  },

  async getBadges(pageId) {
    return authRequest(`/badges/${pageId}`);
  },

  async createBadge(pageId, data) {
    return authRequest(`/badges/${pageId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBadge(badgeId, data) {
    return authRequest(`/badges/${badgeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBadge(badgeId) {
    return authRequest(`/badges/${badgeId}`, {
      method: 'DELETE',
    });
  },

  async toggleBadges(pageId) {
    return authRequest(`/badges/${pageId}/toggle`, {
      method: 'PUT',
    });
  },
};

// Upload API
const uploadAPI = {
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAccessToken();
    if (!token) {
      throw new Error('Não autenticado');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },
};

// Public API
const publicAPI = {
  async getPublicPage(slug) {
    return apiRequest(`/public/${slug}`);
  },

  async getPageViews(slug) {
    return apiRequest(`/public/${slug}/views`);
  },

  async getLeaderboard(limit = 50) {
    return apiRequest(`/public/leaderboard?limit=${limit}`);
  },
};

// Premium API
const premiumAPI = {
  async createCheckout(plan) {
    return authRequest('/premium/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async getStatus() {
    return authRequest('/premium/status');
  },

  async cancel() {
    return authRequest('/premium/cancel', {
      method: 'DELETE',
    });
  },
};

// OAuth API
const oauthAPI = {
  discord: {
    async getLoginUrl() {
      return authRequest('/oauth/discord/login');
    },

    async callback(code) {
      return authRequest(`/oauth/discord/callback?code=${code}`);
    },

    async getStatus() {
      return authRequest('/oauth/discord/status');
    },

    async disconnect() {
      return authRequest('/oauth/discord/disconnect', {
        method: 'DELETE',
      });
    },
  },

  spotify: {
    async getLoginUrl() {
      return authRequest('/oauth/spotify/login');
    },

    async callback(code) {
      return authRequest(`/oauth/spotify/callback?code=${code}`);
    },

    async getPlaylists() {
      return authRequest('/oauth/spotify/playlists');
    },

    async getStatus() {
      return authRequest('/oauth/spotify/status');
    },

    async disconnect() {
      return authRequest('/oauth/spotify/disconnect', {
        method: 'DELETE',
      });
    },
  },
};
