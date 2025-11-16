// Utility Functions

/**
 * Cria container de toasts se não existir
 */
function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Mostra toast (genérico)
 */
function showToast(message, type = 'info') {
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remover após 4 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
  showToast(message, 'error');
}

/**
 * Mostra mensagem de sucesso
 */
function showSuccess(message) {
  showToast(message, 'success');
}

/**
 * Mostra/esconde loading spinner
 */
function toggleLoading(show, buttonElement) {
  if (!buttonElement) return;

  if (show) {
    buttonElement.disabled = true;
    buttonElement.dataset.originalText = buttonElement.textContent;
    buttonElement.innerHTML = '<span class="spinner"></span> Carregando...';
  } else {
    buttonElement.disabled = false;
    buttonElement.textContent = buttonElement.dataset.originalText;
  }
}

/**
 * Valida email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida senha (mínimo 8 caracteres)
 */
function validatePassword(password) {
  return password.length >= 8;
}

/**
 * Valida username (3-30 caracteres)
 */
function validateUsername(username) {
  return username.length >= 3 && username.length <= 30;
}

/**
 * Sanitiza HTML para prevenir XSS
 */
function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Formata número com separador de milhares
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Copia texto para clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar:', error);
    return false;
  }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Gera ID único
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Obtém iniciais do nome
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substr(0, 2);
}

/**
 * Formata data para exibição
 */
function formatDate(date) {
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return d.toLocaleDateString('pt-BR', options);
}

/**
 * Aplica tema na página
 */
function applyTheme(theme) {
  const body = document.body;

  // Remover temas anteriores
  body.removeAttribute('data-theme');
  body.removeAttribute('data-bg-image');
  body.style.removeProperty('background-image');

  if (!theme) return;

  // Aplicar cor de fundo
  if (theme.backgroundColor) {
    body.style.setProperty('--bg-dark', theme.backgroundColor);
  }

  // Aplicar cor de texto
  if (theme.textColor) {
    body.style.setProperty('--text-primary', theme.textColor);
  }

  // Aplicar cor de botão
  if (theme.buttonColor) {
    body.style.setProperty('--primary', theme.buttonColor);
  }

  // Aplicar imagem de fundo
  if (theme.backgroundImage) {
    body.style.backgroundImage = `url(${theme.backgroundImage})`;
    body.setAttribute('data-bg-image', 'true');
  }

  // Aplicar tema pré-definido
  if (theme.preset) {
    body.setAttribute('data-theme', theme.preset);
  }

  // Aplicar CSS customizado
  if (theme.customCss) {
    let styleEl = document.getElementById('custom-theme-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-theme-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = theme.customCss;
  }
}

/**
 * Renderiza bloco com base no tipo
 */
function renderBlock(block) {
  const container = document.createElement('div');
  container.className = `viewer-block ${block.type}`;
  container.dataset.blockId = block.id;

  switch (block.type) {
    case 'text':
      container.innerHTML = `
        <div class="text-${block.data.fontSize || 'base'} text-${block.data.alignment || 'center'}">
          ${sanitizeHTML(block.data.content || '')}
        </div>
      `;
      break;

    case 'link':
      container.innerHTML = `
        <a href="${block.data.url || '#'}" target="_blank" rel="noopener noreferrer" class="viewer-block link">
          ${block.data.icon ? `<span>${block.data.icon}</span>` : ''}
          <span>${sanitizeHTML(block.data.title || 'Link')}</span>
        </a>
      `;
      break;

    case 'image':
      container.innerHTML = `
        <img src="${block.data.url}"
             alt="${sanitizeHTML(block.data.alt || '')}"
             style="width: ${block.data.width || '100%'}">
      `;
      break;

    case 'spotify':
      if (block.data.playlistId) {
        container.innerHTML = `
          <iframe
            src="https://open.spotify.com/embed/playlist/${block.data.playlistId}"
            width="100%"
            height="380"
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media">
          </iframe>
        `;
      }
      break;

    case 'discord':
      container.innerHTML = `
        <div class="discord-avatar"></div>
        <div class="discord-info">
          <div class="discord-username">${sanitizeHTML(block.data.username || 'Usuario')}</div>
          <div class="discord-tag">#${block.data.discriminator || '0000'}</div>
        </div>
      `;
      // Aplicar avatar se tiver
      if (block.data.avatar && block.data.userId) {
        const avatarEl = container.querySelector('.discord-avatar');
        avatarEl.style.backgroundImage = `url(https://cdn.discordapp.com/avatars/${block.data.userId}/${block.data.avatar}.png)`;
        avatarEl.style.backgroundSize = 'cover';
      }
      break;

    case 'divider':
      container.style.borderTop = `${block.data.style || 'solid'} 1px ${block.data.color || 'var(--border-color)'}`;
      break;

    default:
      container.innerHTML = '<p>Tipo de bloco desconhecido</p>';
  }

  return container;
}

/**
 * Drag and drop helper
 */
class DragDropHelper {
  constructor(container, onReorder) {
    this.container = container;
    this.onReorder = onReorder;
    this.draggedElement = null;

    this.init();
  }

  init() {
    this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
    this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
    this.container.addEventListener('dragover', this.handleDragOver.bind(this));
    this.container.addEventListener('drop', this.handleDrop.bind(this));
  }

  handleDragStart(e) {
    if (!e.target.hasAttribute('draggable')) return;

    this.draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedElement = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const afterElement = this.getDragAfterElement(e.clientY);
    const draggable = this.draggedElement;

    if (afterElement == null) {
      this.container.appendChild(draggable);
    } else {
      this.container.insertBefore(draggable, afterElement);
    }
  }

  handleDrop(e) {
    e.preventDefault();

    if (this.onReorder) {
      const items = Array.from(this.container.children);
      const order = items.map((item, index) => ({
        id: item.dataset.blockId,
        position: index
      }));
      this.onReorder(order);
    }
  }

  getDragAfterElement(y) {
    const draggableElements = [
      ...this.container.querySelectorAll('[draggable="true"]:not(.dragging)')
    ];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

/**
 * Modal helper
 */
function createModal(title, content, buttons = []) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal animate-scale-in';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h3 class="modal-title">${title}</h3>
    <button class="modal-close">&times;</button>
  `;

  const body = document.createElement('div');
  body.className = 'modal-body';
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  const footer = document.createElement('div');
  footer.className = 'modal-footer';

  // Definir closeModal antes de criar os botões
  const closeModal = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  };

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = `btn ${btn.class || 'btn-primary'}`;
    button.textContent = btn.text;
    button.onclick = () => {
      if (btn.onClick) {
        btn.onClick();
      }
    };
    footer.appendChild(button);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  if (buttons.length > 0) {
    modal.appendChild(footer);
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  header.querySelector('.modal-close').onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  return { modal, closeModal };
}
