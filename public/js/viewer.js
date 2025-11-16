// Viewer - Página Pública (Estilo Zyo.se)

let currentSlug = null;
let pageData = null;

/**
 * Inicializa o viewer
 */
async function initViewer() {
  const slug = getSlugFromUrl();

  if (!slug) {
    showError('Slug não fornecido');
    showPageNotFound();
    return;
  }

  currentSlug = slug;
  await loadPublicPage(slug);
}

/**
 * Obtém slug da URL
 */
function getSlugFromUrl() {
  // Pegar slug do pathname (formato: /username)
  let slug = window.location.pathname.replace('/', '');

  // Fallback: se não tiver slug no pathname, tentar query param (retrocompatibilidade)
  if (!slug || slug === 'viewer.html') {
    const params = new URLSearchParams(window.location.search);
    slug = params.get('slug');
  }

  return slug;
}

/**
 * Carrega página pública
 */
async function loadPublicPage(slug) {
  try {
    const response = await publicAPI.getPublicPage(slug);

    if (response.success) {
      pageData = response.data;
      const { slug, username, theme, blocks } = response.data;

      // Atualizar título da página
      document.title = `${username} - NewLink`;

      // Aplicar tema e background
      if (theme) {
        applyViewerTheme(theme);
      }

      // Renderizar header
      renderHeader(slug, username);

      // Renderizar tags (se existirem)
      renderTags();

      // Renderizar badges
      await loadAndRenderBadges();

      // Renderizar blocos
      renderBlocks(blocks);

      // Carregar views (mock por enquanto)
      loadViewsCount();
    }
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    showPageNotFound();
  }
}

/**
 * Aplica tema do viewer (incluindo background)
 */
function applyViewerTheme(theme) {
  if (!theme) return;

  const body = document.body;

  // Aplicar cores customizadas
  if (theme.backgroundColor) {
    body.style.setProperty('--bg-dark', theme.backgroundColor);
  }

  if (theme.textColor) {
    body.style.setProperty('--text-primary', theme.textColor);
  }

  if (theme.buttonColor || theme.accentColor) {
    body.style.setProperty('--primary', theme.buttonColor || theme.accentColor);
  }

  // Aplicar background image
  if (theme.backgroundImage) {
    const bgImageEl = document.getElementById('backgroundImage');
    if (bgImageEl) {
      bgImageEl.style.backgroundImage = `url(${theme.backgroundImage})`;
    }
  }

  // Aplicar CSS customizado
  if (theme.customCss) {
    let styleEl = document.getElementById('custom-viewer-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-viewer-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = theme.customCss;
  }
}

/**
 * Renderiza header da página
 */
function renderHeader(slug, username) {
  // Avatar
  const avatarEl = document.getElementById('avatar');

  // Se tiver avatarUrl customizado, usar imagem
  if (pageData.avatarUrl) {
    avatarEl.innerHTML = `<img src="${pageData.avatarUrl}" alt="${username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
  } else {
    // Caso contrário, mostrar iniciais
    const initials = getInitials(username);
    avatarEl.textContent = initials;
  }

  // Username ou DisplayName
  const usernameEl = document.getElementById('username');
  const displayName = pageData.displayName || username;
  usernameEl.textContent = displayName;

  // Bio (opcional - pode vir do backend depois)
  const bioEl = document.getElementById('bio');
  const bio = pageData.bio || `@${slug}`;
  bioEl.textContent = bio;
}

/**
 * Renderiza tags (Pills)
 */
function renderTags() {
  const tagsEl = document.getElementById('tags');

  // Mock de tags - depois pode vir do backend
  const tags = pageData.tags || [];

  if (tags.length === 0) {
    tagsEl.style.display = 'none';
    return;
  }

  tagsEl.innerHTML = tags.map(tag => `
    <span class="tag-pill">
      ${tag.icon ? `<span class="tag-pill-icon">${tag.icon}</span>` : ''}
      <span>${sanitizeHTML(tag.label)}</span>
    </span>
  `).join('');
}

/**
 * Carrega e renderiza badges
 */
async function loadAndRenderBadges() {
  const badgesEl = document.getElementById('badges');

  try {
    // As badges já vêm no pageData da API
    const badges = pageData.badges || [];
    const showBadges = pageData.showBadges !== false;

    // Se showBadges está false, esconder seção
    if (!showBadges || badges.length === 0) {
      badgesEl.style.display = 'none';
      return;
    }

    // Definir badges pré-definidas (para obter ícone e cor)
    const presetBadges = {
      'verified': { icon: '✓', color: '#3b82f6' },
      'premium': { icon: '💎', color: '#8b5cf6' },
      'gold': { icon: '👑', color: '#fbbf24' },
      'silver': { icon: '⭐', color: '#d1d5db' },
      'bronze': { icon: '🥉', color: '#cd7f32' },
      'diamond': { icon: '💠', color: '#06b6d4' },
      'legendary': { icon: '🔥', color: '#ef4444' },
      'creator': { icon: '🎨', color: '#ec4899' },
      'developer': { icon: '💻', color: '#10b981' },
      'gamer': { icon: '🎮', color: '#6366f1' },
    };

    badgesEl.innerHTML = badges.map(badge => {
      if (badge.type === 'preset') {
        const preset = presetBadges[badge.presetKey] || { icon: '⭐', color: '#6366f1' };
        return `
          <div class="badge ${badge.presetKey}" style="background: ${preset.color};">
            <span class="badge-icon">${preset.icon}</span>
            <span>${sanitizeHTML(badge.name)}</span>
          </div>
        `;
      } else {
        // Badge customizada
        return `
          <div class="badge custom">
            <img src="${badge.imageUrl}" alt="${sanitizeHTML(badge.name)}" class="badge-custom-image">
            <span>${sanitizeHTML(badge.name)}</span>
          </div>
        `;
      }
    }).join('');

  } catch (error) {
    console.error('Erro ao carregar badges:', error);
    badgesEl.style.display = 'none';
  }
}


/**
 * Renderiza blocos
 */
function renderBlocks(blocks) {
  const container = document.getElementById('blocksContainer');

  if (!container) return;

  if (!blocks || blocks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 2rem;">
        <p>Esta página ainda não tem conteúdo.</p>
      </div>
    `;
    return;
  }

  // Ordenar por posição
  blocks.sort((a, b) => a.position - b.position);

  // Renderizar cada bloco
  container.innerHTML = '';
  blocks.forEach(block => {
    const blockEl = renderBlock(block);
    container.appendChild(blockEl);
  });
}

/**
 * Renderiza um bloco individual (sobrescrito para novo visual)
 */
function renderBlock(block) {
  const wrapper = document.createElement('div');
  wrapper.className = `block-card ${block.type}`;
  wrapper.dataset.blockId = block.id;

  switch (block.type) {
    case 'text':
      wrapper.innerHTML = `
        <div class="block-content">
          <span class="block-icon">📝</span>
          <div class="block-text">${sanitizeHTML(block.data.content || '')}</div>
        </div>
      `;
      break;

    case 'link':
      wrapper.innerHTML = `
        <a href="${block.data.url || '#'}" target="_blank" rel="noopener noreferrer">
          <div class="block-content">
            <span class="block-icon">${block.data.icon || '🔗'}</span>
            <div>
              <div class="block-text">${sanitizeHTML(block.data.title || 'Link')}</div>
            </div>
          </div>
        </a>
      `;
      break;

    case 'image':
      wrapper.classList.remove('block-card');
      wrapper.classList.add('block-card', 'image');
      wrapper.innerHTML = `
        <img src="${block.data.url}" alt="${sanitizeHTML(block.data.alt || '')}" loading="lazy">
      `;
      break;

    case 'spotify':
      if (block.data.playlistId) {
        wrapper.classList.add('spotify');
        wrapper.innerHTML = `
          <div class="block-content">
            <span class="block-icon">🎵</span>
            <div class="block-text">${sanitizeHTML(block.data.playlistName || 'Spotify Playlist')}</div>
          </div>
          <iframe
            src="https://open.spotify.com/embed/playlist/${block.data.playlistId}"
            width="100%"
            height="380"
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media"
            loading="lazy">
          </iframe>
        `;
      }
      break;

    case 'discord':
      wrapper.classList.add('discord');
      wrapper.innerHTML = `
        <div class="discord-info">
          <div class="discord-avatar" ${block.data.avatar && block.data.userId ? `style="background-image: url(https://cdn.discordapp.com/avatars/${block.data.userId}/${block.data.avatar}.png)"` : ''}></div>
          <div class="discord-details">
            <div class="discord-username">${sanitizeHTML(block.data.username || 'Usuario')}</div>
            <div class="discord-tag">#${block.data.discriminator || '0000'}</div>
          </div>
        </div>
      `;
      break;

    case 'divider':
      wrapper.innerHTML = '';
      break;

    default:
      wrapper.innerHTML = `
        <div class="block-content">
          <span class="block-icon">❓</span>
          <div class="block-text">Tipo desconhecido</div>
        </div>
      `;
  }

  return wrapper;
}

/**
 * Carrega contador de views (real, baseado em IPs únicos)
 */
async function loadViewsCount() {
  const viewsEl = document.getElementById('viewsCount');

  try {
    // Buscar visualizações reais do backend
    const response = await publicAPI.getPageViews(currentSlug);

    if (response.success) {
      const viewsCount = response.data.views || 0;

      // Animar contador
      animateCounter(viewsEl, viewsCount);
    } else {
      // Fallback em caso de erro
      viewsEl.textContent = '0';
    }
  } catch (error) {
    console.error('Erro ao carregar views:', error);
    // Mostrar 0 em caso de erro
    viewsEl.textContent = '0';
  }
}

/**
 * Anima contador de views
 */
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 30;
  const duration = 1000;
  const stepTime = duration / 30;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(target);
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.floor(current));
    }
  }, stepTime);
}

/**
 * Mostra página não encontrada
 */
function showPageNotFound() {
  const viewerPage = document.querySelector('.viewer-page');

  if (!viewerPage) return;

  viewerPage.innerHTML = `
    <div class="profile-container" style="text-align: center;">
      <div style="font-size: 5rem; margin-bottom: 1rem;">😕</div>
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">Página Não Encontrada</h1>
      <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
        Esta página não existe ou ainda não foi publicada.
      </p>
      <a href="/" class="btn btn-primary">
        Voltar para Home
      </a>
    </div>
  `;
}

// Adicionar estilos do botão se necessário
function addButtonStyles() {
  if (!document.getElementById('viewer-button-styles')) {
    const style = document.createElement('style');
    style.id = 'viewer-button-styles';
    style.textContent = `
      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: var(--primary);
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
      }
    `;
    document.head.appendChild(style);
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addButtonStyles();
    initViewer();
  });
} else {
  addButtonStyles();
  initViewer();
}
