// Dashboard - Editor de Blocos

let currentPage = null;
let blocks = [];

/**
 * Inicializa o dashboard
 */
async function initDashboard() {
  if (!requireAuth()) return;

  await loadPage();
  await loadPresetBadges();
  await loadUserBadges();
  updateBadgesToggleButton();
  loadProfileSettings();
  setupEventListeners();
  updateUserUI();
}

/**
 * Carrega a página do usuário
 */
async function loadPage() {
  try {
    const response = await pagesAPI.getMyPage();

    if (response.success) {
      currentPage = response.data;
      blocks = response.data.blocks || [];

      renderBlocks();
      updatePublicUrl();
      updatePublishButton();
    }
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    showError('Erro ao carregar sua página');
  }
}

/**
 * Renderiza todos os blocos
 */
function renderBlocks() {
  const container = document.getElementById('blocksContainer');

  if (!container) return;

  if (blocks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3 class="empty-state-title">Nenhum bloco ainda</h3>
        <p class="empty-state-description">
          Adicione seu primeiro bloco usando os botões acima
        </p>
      </div>
    `;
    return;
  }

  // Ordenar blocos por posição
  blocks.sort((a, b) => a.position - b.position);

  container.innerHTML = blocks.map((block, index) => createBlockHTML(block, index)).join('');

  // Setup drag and drop
  setupDragAndDrop();
}

/**
 * Cria HTML de um bloco
 */
function createBlockHTML(block, index) {
  const typeIcons = {
    text: '📝',
    link: '🔗',
    image: '🖼️',
    spotify: '🎵',
    discord: '💬',
    divider: '➖'
  };

  return `
    <div class="block-item" data-block-id="${block.id}" data-position="${block.position}" draggable="true">
      <div class="block-header">
        <div class="block-type">
          <span>${typeIcons[block.type] || '📦'}</span>
          <span>${block.type.charAt(0).toUpperCase() + block.type.slice(1)}</span>
        </div>
        <div class="block-actions">
          <button class="icon-btn" onclick="moveBlockUp(${index})" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button class="icon-btn" onclick="moveBlockDown(${index})" ${index === blocks.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="icon-btn" onclick="editBlock('${block.id}')">✏️</button>
          <button class="icon-btn danger" onclick="deleteBlock('${block.id}')">🗑️</button>
        </div>
      </div>
      <div class="block-content">
        ${renderBlockPreview(block)}
      </div>
    </div>
  `;
}

/**
 * Renderiza preview do bloco
 */
function renderBlockPreview(block) {
  switch (block.type) {
    case 'text':
      return `<p>${sanitizeHTML(block.data.content || 'Texto vazio')}</p>`;

    case 'link':
      return `
        <strong>${sanitizeHTML(block.data.title || 'Link sem título')}</strong><br>
        <small class="text-muted">${block.data.url || '#'}</small>
      `;

    case 'image':
      return `<img src="${block.data.url}" alt="${block.data.alt || ''}" style="max-width: 200px; border-radius: 8px;">`;

    case 'spotify':
      return `<p>Playlist: ${sanitizeHTML(block.data.playlistName || 'Sem nome')}</p>`;

    case 'discord':
      return `<p>Discord: ${sanitizeHTML(block.data.username || 'Usuário')}#${block.data.discriminator || '0000'}</p>`;

    case 'divider':
      return `<hr style="border-color: ${block.data.color || '#ccc'};">`;

    default:
      return '<p>Tipo desconhecido</p>';
  }
}

/**
 * Adiciona novo bloco
 */
async function addBlock(type) {
  if (!currentPage) return;

  const blockData = getDefaultBlockData(type);

  try {
    const response = await blocksAPI.createBlock(currentPage.id, {
      type,
      position: blocks.length,
      data: blockData
    });

    if (response.success) {
      blocks.push(response.data);
      renderBlocks();
      showSuccess('Bloco adicionado!');
    }
  } catch (error) {
    console.error('Erro ao adicionar bloco:', error);
    showError(error.message || 'Erro ao adicionar bloco');
  }
}

/**
 * Retorna dados padrão para cada tipo de bloco
 */
function getDefaultBlockData(type) {
  switch (type) {
    case 'text':
      return { content: 'Seu texto aqui', fontSize: 'medium', alignment: 'center' };
    case 'link':
      return { title: 'Novo Link', url: 'https://', icon: null };
    case 'image':
      return { url: 'https://via.placeholder.com/400', alt: '', width: '100%' };
    case 'spotify':
      return { playlistId: null, playlistName: '', playlistImage: '' };
    case 'discord':
      return { username: 'Usuario', discriminator: '0000', avatar: '', userId: '' };
    case 'divider':
      return { style: 'solid', color: '#cccccc' };
    default:
      return {};
  }
}

/**
 * Edita um bloco
 */
function editBlock(blockId) {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return;

  const formHTML = createBlockEditForm(block);

  // Criar modal sem botões primeiro
  const { modal, closeModal } = createModal(`Editar ${block.type}`, formHTML, [
    {
      text: 'Cancelar',
      class: 'btn-secondary',
      onClick: () => closeModal()
    },
    {
      text: 'Salvar',
      class: 'btn-primary',
      onClick: () => saveBlockEdit(blockId, closeModal)
    }
  ]);
}

/**
 * Cria formulário de edição para bloco
 */
function createBlockEditForm(block) {
  const container = document.createElement('div');

  switch (block.type) {
    case 'text':
      container.innerHTML = `
        <div class="form-group">
          <label>Conteúdo</label>
          <textarea id="blockContent" rows="4">${block.data.content || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Tamanho do Texto</label>
          <select id="blockFontSize">
            <option value="small" ${block.data.fontSize === 'small' ? 'selected' : ''}>Pequeno</option>
            <option value="medium" ${block.data.fontSize === 'medium' ? 'selected' : ''}>Médio</option>
            <option value="large" ${block.data.fontSize === 'large' ? 'selected' : ''}>Grande</option>
          </select>
        </div>
        <div class="form-group">
          <label>Alinhamento</label>
          <select id="blockAlignment">
            <option value="left" ${block.data.alignment === 'left' ? 'selected' : ''}>Esquerda</option>
            <option value="center" ${block.data.alignment === 'center' ? 'selected' : ''}>Centro</option>
            <option value="right" ${block.data.alignment === 'right' ? 'selected' : ''}>Direita</option>
          </select>
        </div>
      `;
      break;

    case 'link':
      container.innerHTML = `
        <div class="form-group">
          <label>Título</label>
          <input type="text" id="blockTitle" value="${block.data.title || ''}" placeholder="Nome do link">
        </div>
        <div class="form-group">
          <label>URL</label>
          <input type="url" id="blockUrl" value="${block.data.url || ''}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>Ícone (emoji)</label>
          <input type="text" id="blockIcon" value="${block.data.icon || ''}" placeholder="🔗" maxlength="2">
        </div>
      `;
      break;

    case 'image':
      container.innerHTML = `
        <div class="form-group">
          <label>URL da Imagem</label>
          <input type="url" id="blockUrl" value="${block.data.url || ''}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>Texto Alternativo</label>
          <input type="text" id="blockAlt" value="${block.data.alt || ''}" placeholder="Descrição da imagem">
        </div>
        <div class="form-group">
          <label>Largura</label>
          <input type="text" id="blockWidth" value="${block.data.width || '100%'}" placeholder="100%">
        </div>
      `;
      break;

    case 'spotify':
      container.innerHTML = `
        <div class="form-group">
          <label>ID da Playlist</label>
          <input type="text" id="blockPlaylistId" value="${block.data.playlistId || ''}" placeholder="37i9dQZF1DXcBWIGoYBM5M">
          <small class="text-muted">Copie da URL do Spotify</small>
        </div>
        <div class="form-group">
          <label>Nome da Playlist</label>
          <input type="text" id="blockPlaylistName" value="${block.data.playlistName || ''}" placeholder="Minha Playlist">
        </div>
      `;
      break;

    case 'discord':
      container.innerHTML = `
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="blockUsername" value="${block.data.username || ''}" placeholder="Usuario">
        </div>
        <div class="form-group">
          <label>Discriminator</label>
          <input type="text" id="blockDiscriminator" value="${block.data.discriminator || ''}" placeholder="0000" maxlength="4">
        </div>
        <div class="form-group">
          <label>User ID</label>
          <input type="text" id="blockUserId" value="${block.data.userId || ''}" placeholder="123456789">
        </div>
      `;
      break;

    case 'divider':
      container.innerHTML = `
        <div class="form-group">
          <label>Estilo</label>
          <select id="blockStyle">
            <option value="solid" ${block.data.style === 'solid' ? 'selected' : ''}>Sólido</option>
            <option value="dashed" ${block.data.style === 'dashed' ? 'selected' : ''}>Tracejado</option>
            <option value="dotted" ${block.data.style === 'dotted' ? 'selected' : ''}>Pontilhado</option>
          </select>
        </div>
        <div class="form-group">
          <label>Cor</label>
          <input type="color" id="blockColor" value="${block.data.color || '#cccccc'}">
        </div>
      `;
      break;
  }

  return container;
}

/**
 * Salva edição do bloco
 */
async function saveBlockEdit(blockId, closeModal) {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return;

  const updatedData = getBlockDataFromForm(block.type);

  try {
    const response = await blocksAPI.updateBlock(blockId, {
      data: updatedData
    });

    if (response.success) {
      const index = blocks.findIndex(b => b.id === blockId);
      blocks[index] = response.data;
      renderBlocks();
      closeModal();
      showSuccess('Bloco atualizado!');
    }
  } catch (error) {
    console.error('Erro ao atualizar bloco:', error);
    showError(error.message || 'Erro ao atualizar bloco');
  }
}

/**
 * Obtém dados do formulário
 */
function getBlockDataFromForm(type) {
  switch (type) {
    case 'text':
      return {
        content: document.getElementById('blockContent').value,
        fontSize: document.getElementById('blockFontSize').value,
        alignment: document.getElementById('blockAlignment').value
      };

    case 'link':
      return {
        title: document.getElementById('blockTitle').value,
        url: document.getElementById('blockUrl').value,
        icon: document.getElementById('blockIcon').value || null
      };

    case 'image':
      return {
        url: document.getElementById('blockUrl').value,
        alt: document.getElementById('blockAlt').value,
        width: document.getElementById('blockWidth').value
      };

    case 'spotify':
      return {
        playlistId: document.getElementById('blockPlaylistId').value,
        playlistName: document.getElementById('blockPlaylistName').value
      };

    case 'discord':
      return {
        username: document.getElementById('blockUsername').value,
        discriminator: document.getElementById('blockDiscriminator').value,
        userId: document.getElementById('blockUserId').value
      };

    case 'divider':
      return {
        style: document.getElementById('blockStyle').value,
        color: document.getElementById('blockColor').value
      };

    default:
      return {};
  }
}

/**
 * Deleta um bloco
 */
async function deleteBlock(blockId) {
  if (!confirm('Tem certeza que deseja deletar este bloco?')) return;

  try {
    const response = await blocksAPI.deleteBlock(blockId);

    if (response.success) {
      blocks = blocks.filter(b => b.id !== blockId);
      renderBlocks();
      showSuccess('Bloco deletado!');
    }
  } catch (error) {
    console.error('Erro ao deletar bloco:', error);
    showError(error.message || 'Erro ao deletar bloco');
  }
}

/**
 * Move bloco para cima
 */
function moveBlockUp(index) {
  if (index === 0) return;

  [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
  saveBlocksOrder();
}

/**
 * Move bloco para baixo
 */
function moveBlockDown(index) {
  if (index === blocks.length - 1) return;

  [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
  saveBlocksOrder();
}

/**
 * Salva ordem dos blocos
 */
async function saveBlocksOrder() {
  if (!currentPage) return;

  const order = blocks.map((block, index) => ({
    id: block.id,
    position: index
  }));

  try {
    const response = await blocksAPI.reorderBlocks(currentPage.id, order);

    if (response.success) {
      blocks = response.data;
      renderBlocks();
    }
  } catch (error) {
    console.error('Erro ao reordenar blocos:', error);
    showError('Erro ao reordenar blocos');
  }
}

/**
 * Publica/despublica página
 */
async function togglePublish() {
  if (!currentPage) return;

  const newState = !currentPage.isPublished;

  try {
    const response = await pagesAPI.updatePage(currentPage.id, {
      isPublished: newState
    });

    if (response.success) {
      currentPage = response.data;
      updatePublishButton();
      showSuccess(newState ? 'Página publicada!' : 'Página despublicada');
    }
  } catch (error) {
    console.error('Erro ao publicar:', error);
    showError('Erro ao publicar página');
  }
}

/**
 * Atualiza botão de publicar
 */
function updatePublishButton() {
  const btn = document.getElementById('publishBtn');
  if (!btn || !currentPage) return;

  if (currentPage.isPublished) {
    btn.textContent = '✓ Publicado';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
  } else {
    btn.textContent = 'Publicar';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-primary');
  }
}

/**
 * Atualiza URL pública
 */
function updatePublicUrl() {
  const user = getUser();
  if (!user) return;

  const urlElements = document.querySelectorAll('.public-url');
  const publicUrl = `${window.location.origin}/${user.slug}`;

  urlElements.forEach(el => {
    el.textContent = publicUrl;
    el.href = publicUrl;
  });
}

/**
 * Copia URL pública
 */
async function copyPublicUrl() {
  const user = getUser();
  if (!user) return;

  const publicUrl = `${window.location.origin}/${user.slug}`;

  const success = await copyToClipboard(publicUrl);

  if (success) {
    showSuccess('Link copiado!');
  } else {
    showError('Erro ao copiar link');
  }
}

/**
 * Setup drag and drop
 */
function setupDragAndDrop() {
  const container = document.getElementById('blocksContainer');
  if (!container) return;

  new DragDropHelper(container, saveBlocksOrder);
}

// ===== PROFILE SETTINGS =====

/**
 * Carrega configurações de perfil
 */
function loadProfileSettings() {
  if (!currentPage) return;

  const avatarPreview = document.getElementById('avatarPreview');
  const displayNameInput = document.getElementById('displayNameInput');

  // Carregar avatar
  if (currentPage.avatarUrl) {
    avatarPreview.innerHTML = `<img src="${currentPage.avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
  }

  // Carregar displayName
  if (currentPage.displayName) {
    displayNameInput.value = currentPage.displayName;
  }
}

/**
 * Abre modal para alterar avatar
 */
function openChangeAvatarModal() {
  const formHTML = `
    <div class="form-group">
      <label>Método de Upload</label>
      <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem;">
        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
          <input type="radio" name="uploadMethod" value="url" checked style="cursor: pointer;">
          <span>URL da Imagem</span>
        </label>
        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
          <input type="radio" name="uploadMethod" value="file" style="cursor: pointer;">
          <span>Upload de Arquivo</span>
        </label>
      </div>
    </div>

    <div id="urlUploadSection">
      <div class="form-group">
        <label>URL da Imagem</label>
        <input type="url" id="avatarUrlInput" placeholder="https://..." value="${currentPage?.avatarUrl || ''}">
        <small class="text-muted">Cole a URL de uma imagem (recomendado: 200x200px)</small>
      </div>
    </div>

    <div id="fileUploadSection" style="display: none;">
      <div class="form-group">
        <label>Selecionar Imagem</label>
        <input type="file" id="avatarFileInput" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style="display: block; width: 100%; padding: 0.5rem; background: var(--bg-darker); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer;">
        <small class="text-muted">Formatos: JPEG, PNG, GIF, WEBP (máx. 5MB)</small>
      </div>
    </div>

    <div class="form-group">
      <label>Preview</label>
      <div style="display: flex; justify-content: center; padding: 1rem;">
        <div id="avatarModalPreview" style="width: 100px; height: 100px; border-radius: 50%; background: var(--bg-darker); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; border: 2px solid var(--border-color); overflow: hidden;">
          👤
        </div>
      </div>
    </div>
  `;

  const { modal, closeModal } = createModal('Alterar Avatar', formHTML, [
    {
      text: 'Cancelar',
      class: 'btn-secondary',
      onClick: () => closeModal()
    },
    {
      text: 'Salvar',
      class: 'btn-primary',
      onClick: () => {} // Will be overridden below
    }
  ]);

  // Setup elements
  const avatarUrlInput = document.getElementById('avatarUrlInput');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const avatarModalPreview = document.getElementById('avatarModalPreview');
  const urlUploadSection = document.getElementById('urlUploadSection');
  const fileUploadSection = document.getElementById('fileUploadSection');
  const uploadMethodRadios = document.querySelectorAll('input[name="uploadMethod"]');

  // Store uploaded file URL
  let uploadedFileUrl = null;

  // Set initial preview
  if (currentPage?.avatarUrl) {
    avatarModalPreview.innerHTML = `<img src="${currentPage.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
  }

  // Toggle between URL and file upload sections
  uploadMethodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'url') {
        urlUploadSection.style.display = 'block';
        fileUploadSection.style.display = 'none';
        // Clear file input
        avatarFileInput.value = '';
        uploadedFileUrl = null;
        // Restore URL preview
        const url = avatarUrlInput.value.trim();
        if (url) {
          avatarModalPreview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
          avatarModalPreview.innerHTML = '👤';
        }
      } else {
        urlUploadSection.style.display = 'none';
        fileUploadSection.style.display = 'block';
        // Clear URL input
        avatarUrlInput.value = '';
        if (!uploadedFileUrl) {
          avatarModalPreview.innerHTML = '👤';
        }
      }
    });
  });

  // Preview URL input
  avatarUrlInput.addEventListener('input', () => {
    const url = avatarUrlInput.value.trim();
    if (url) {
      avatarModalPreview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      avatarModalPreview.innerHTML = '👤';
    }
  });

  // Handle file upload
  avatarFileInput.addEventListener('change', async () => {
    const file = avatarFileInput.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('A imagem deve ter no máximo 5MB');
      avatarFileInput.value = '';
      return;
    }

    // Show loading state
    avatarModalPreview.innerHTML = '<div style="font-size: 1rem; color: var(--text-secondary);">Enviando...</div>';

    try {
      // Upload file
      const response = await uploadAPI.uploadAvatar(file);

      if (response.success) {
        uploadedFileUrl = response.data.url;
        // Preview uploaded image
        avatarModalPreview.innerHTML = `<img src="${uploadedFileUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
        showSuccess('Imagem enviada! Clique em Salvar para aplicar.');
      } else {
        showError(response.error || 'Erro ao enviar imagem');
        avatarModalPreview.innerHTML = '👤';
        avatarFileInput.value = '';
        uploadedFileUrl = null;
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      showError('Erro ao enviar imagem');
      avatarModalPreview.innerHTML = '👤';
      avatarFileInput.value = '';
      uploadedFileUrl = null;
    }
  });

  // Override the save button click handler to use our custom logic
  const saveButton = modal.querySelectorAll('.btn-primary')[0];
  saveButton.onclick = async () => {
    const selectedMethod = document.querySelector('input[name="uploadMethod"]:checked').value;
    const finalUrl = selectedMethod === 'url'
      ? avatarUrlInput.value.trim()
      : uploadedFileUrl;

    if (!currentPage) return;

    try {
      const response = await pagesAPI.updatePage(currentPage.id, {
        avatarUrl: finalUrl || '',
      });

      if (response.success) {
        currentPage.avatarUrl = finalUrl;
        const avatarPreview = document.getElementById('avatarPreview');

        if (finalUrl) {
          avatarPreview.innerHTML = `<img src="${finalUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
          avatarPreview.innerHTML = '👤';
        }

        closeModal();
        showSuccess('Avatar atualizado!');
      }
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      showError('Erro ao salvar avatar');
    }
  };
}


/**
 * Salva nome de exibição
 */
async function saveDisplayName() {
  const displayName = document.getElementById('displayNameInput').value.trim();

  if (!currentPage) return;

  if (!displayName) {
    showError('Digite um nome de exibição');
    return;
  }

  try {
    const response = await pagesAPI.updatePage(currentPage.id, {
      displayName,
    });

    if (response.success) {
      currentPage.displayName = displayName;
      showSuccess('Nome de exibição atualizado!');
    }
  } catch (error) {
    console.error('Erro ao salvar nome:', error);
    showError(error.message || 'Erro ao salvar nome');
  }
}

// ===== BADGES MANAGEMENT =====

let presetBadges = [];
let userBadges = [];

/**
 * Carrega badges pré-definidas
 */
async function loadPresetBadges() {
  try {
    const response = await badgesAPI.getPresets();
    if (response.success) {
      presetBadges = response.data;
      renderPresetBadges();
    }
  } catch (error) {
    console.error('Erro ao carregar badges pré-definidas:', error);
  }
}

/**
 * Carrega badges do usuário
 */
async function loadUserBadges() {
  if (!currentPage) return;

  try {
    const response = await badgesAPI.getBadges(currentPage.id);
    if (response.success) {
      userBadges = response.data;
      renderPresetBadges(); // Re-renderizar para mostrar selecionadas
      renderCustomBadges();
    }
  } catch (error) {
    console.error('Erro ao carregar badges do usuário:', error);
  }
}

/**
 * Renderiza badges pré-definidas
 */
function renderPresetBadges() {
  const container = document.getElementById('presetBadgesContainer');
  if (!container) return;

  // Verificar quais badges já estão ativas
  const activeBadges = userBadges.filter(b => b.type === 'preset').map(b => b.presetKey);

  container.innerHTML = presetBadges.map(badge => {
    const isActive = activeBadges.includes(badge.key);
    const userBadge = userBadges.find(b => b.presetKey === badge.key);

    return `
      <div class="badge-preset-item ${isActive ? 'active' : ''}" data-badge-key="${badge.key}">
        <div class="badge-preset-icon" style="color: ${badge.color};">
          ${badge.icon}
        </div>
        <div class="badge-preset-name">${badge.name}</div>
        <button class="badge-preset-toggle" onclick="${isActive ? `removePresetBadge('${userBadge.id}')` : `addPresetBadge('${badge.key}', '${badge.name}')`}">
          ${isActive ? '✓ Ativa' : '+ Adicionar'}
        </button>
      </div>
    `;
  }).join('');
}

/**
 * Adiciona badge pré-definida
 */
async function addPresetBadge(presetKey, name) {
  if (!currentPage) return;

  try {
    const response = await badgesAPI.createBadge(currentPage.id, {
      type: 'preset',
      name,
      presetKey,
    });

    if (response.success) {
      userBadges.push(response.data);
      renderPresetBadges();
      showSuccess('Badge adicionada!');
    }
  } catch (error) {
    console.error('Erro ao adicionar badge:', error);
    showError(error.message || 'Erro ao adicionar badge');
  }
}

/**
 * Remove badge pré-definida
 */
async function removePresetBadge(badgeId) {
  try {
    const response = await badgesAPI.deleteBadge(badgeId);

    if (response.success) {
      userBadges = userBadges.filter(b => b.id !== badgeId);
      renderPresetBadges();
      showSuccess('Badge removida!');
    }
  } catch (error) {
    console.error('Erro ao remover badge:', error);
    showError(error.message || 'Erro ao remover badge');
  }
}

/**
 * Renderiza badges customizadas
 */
function renderCustomBadges() {
  const container = document.getElementById('customBadgesContainer');
  if (!container) return;

  const customBadges = userBadges.filter(b => b.type === 'custom');

  if (customBadges.length === 0) {
    container.innerHTML = `
      <div class="empty-state-sm">
        <p class="text-muted">Nenhuma badge customizada ainda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = customBadges.map(badge => `
    <div class="custom-badge-item">
      <img src="${badge.imageUrl}" alt="${badge.name}" class="custom-badge-image">
      <div class="custom-badge-name">${sanitizeHTML(badge.name)}</div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="icon-btn" onclick="editCustomBadge('${badge.id}')" title="Editar">✏️</button>
        <button class="icon-btn danger" onclick="removeCustomBadge('${badge.id}')" title="Remover">🗑️</button>
      </div>
    </div>
  `).join('');
}

/**
 * Abre modal para adicionar badge customizada
 */
function openAddCustomBadgeModal() {
  const customBadges = userBadges.filter(b => b.type === 'custom');

  if (customBadges.length >= 3) {
    showError('Você já possui o máximo de 3 badges customizadas');
    return;
  }

  const formHTML = `
    <div class="form-group">
      <label>Nome da Badge</label>
      <input type="text" id="customBadgeName" placeholder="Ex: Top Contributor" maxlength="30">
    </div>
    <div class="form-group">
      <label>URL da Imagem</label>
      <input type="url" id="customBadgeImage" placeholder="https://...">
      <small class="text-muted">Recomendado: 100x100px, formato PNG ou SVG</small>
    </div>
    <div class="form-group">
      <label>Preview</label>
      <div id="badgePreview" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px;">
        <img id="previewImage" src="" alt="Preview" style="width: 32px; height: 32px; border-radius: 50%; display: none;">
        <span id="previewName" class="text-muted">Digite um nome e URL para ver o preview</span>
      </div>
    </div>
  `;

  const { modal, closeModal } = createModal('Adicionar Badge Customizada', formHTML, [
    {
      text: 'Cancelar',
      class: 'btn-secondary',
      onClick: () => closeModal()
    },
    {
      text: 'Adicionar',
      class: 'btn-primary',
      onClick: () => saveCustomBadge(closeModal)
    }
  ]);

  // Setup preview
  const nameInput = document.getElementById('customBadgeName');
  const imageInput = document.getElementById('customBadgeImage');
  const previewImage = document.getElementById('previewImage');
  const previewName = document.getElementById('previewName');

  function updatePreview() {
    const name = nameInput.value.trim();
    const imageUrl = imageInput.value.trim();

    if (name && imageUrl) {
      previewImage.src = imageUrl;
      previewImage.style.display = 'block';
      previewName.textContent = name;
      previewName.classList.remove('text-muted');
    } else {
      previewImage.style.display = 'none';
      previewName.textContent = 'Digite um nome e URL para ver o preview';
      previewName.classList.add('text-muted');
    }
  }

  nameInput.addEventListener('input', updatePreview);
  imageInput.addEventListener('input', updatePreview);
}

/**
 * Salva badge customizada
 */
async function saveCustomBadge(closeModal) {
  const name = document.getElementById('customBadgeName').value.trim();
  const imageUrl = document.getElementById('customBadgeImage').value.trim();

  if (!name || !imageUrl) {
    showError('Preencha todos os campos');
    return;
  }

  if (!currentPage) return;

  try {
    const response = await badgesAPI.createBadge(currentPage.id, {
      type: 'custom',
      name,
      imageUrl,
    });

    if (response.success) {
      userBadges.push(response.data);
      renderCustomBadges();
      closeModal();
      showSuccess('Badge customizada adicionada!');
    }
  } catch (error) {
    console.error('Erro ao adicionar badge customizada:', error);
    showError(error.message || 'Erro ao adicionar badge');
  }
}

/**
 * Abre modal para editar badge customizada
 */
function editCustomBadge(badgeId) {
  const badge = userBadges.find(b => b.id === badgeId);
  if (!badge || badge.type !== 'custom') return;

  const formHTML = `
    <div class="form-group">
      <label>Nome da Badge</label>
      <input type="text" id="editBadgeName" placeholder="Ex: Top Contributor" maxlength="30" value="${badge.name}">
    </div>
    <div class="form-group">
      <label>URL da Imagem</label>
      <input type="url" id="editBadgeImage" placeholder="https://..." value="${badge.imageUrl}">
      <small class="text-muted">Recomendado: 100x100px, formato PNG ou SVG</small>
    </div>
    <div class="form-group">
      <label>Preview</label>
      <div id="badgeEditPreview" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px;">
        <img id="editPreviewImage" src="${badge.imageUrl}" alt="Preview" style="width: 32px; height: 32px; border-radius: 50%;">
        <span id="editPreviewName">${sanitizeHTML(badge.name)}</span>
      </div>
    </div>
  `;

  const { modal, closeModal } = createModal('Editar Badge Customizada', formHTML, [
    {
      text: 'Cancelar',
      class: 'btn-secondary',
      onClick: () => closeModal()
    },
    {
      text: 'Salvar',
      class: 'btn-primary',
      onClick: () => updateCustomBadge(badgeId, closeModal)
    }
  ]);

  // Setup preview
  const nameInput = document.getElementById('editBadgeName');
  const imageInput = document.getElementById('editBadgeImage');
  const previewImage = document.getElementById('editPreviewImage');
  const previewName = document.getElementById('editPreviewName');

  function updatePreview() {
    const name = nameInput.value.trim();
    const imageUrl = imageInput.value.trim();

    if (imageUrl) {
      previewImage.src = imageUrl;
    }
    if (name) {
      previewName.textContent = name;
    }
  }

  nameInput.addEventListener('input', updatePreview);
  imageInput.addEventListener('input', updatePreview);
}

/**
 * Atualiza badge customizada
 */
async function updateCustomBadge(badgeId, closeModal) {
  const name = document.getElementById('editBadgeName').value.trim();
  const imageUrl = document.getElementById('editBadgeImage').value.trim();

  if (!name || !imageUrl) {
    showError('Preencha todos os campos');
    return;
  }

  try {
    const response = await badgesAPI.updateBadge(badgeId, {
      name,
      imageUrl,
    });

    if (response.success) {
      const index = userBadges.findIndex(b => b.id === badgeId);
      if (index !== -1) {
        userBadges[index] = response.data;
      }
      renderCustomBadges();
      closeModal();
      showSuccess('Badge atualizada!');
    }
  } catch (error) {
    console.error('Erro ao atualizar badge:', error);
    showError(error.message || 'Erro ao atualizar badge');
  }
}

/**
 * Remove badge customizada
 */
async function removeCustomBadge(badgeId) {
  if (!confirm('Tem certeza que deseja remover esta badge?')) return;

  try {
    const response = await badgesAPI.deleteBadge(badgeId);

    if (response.success) {
      userBadges = userBadges.filter(b => b.id !== badgeId);
      renderCustomBadges();
      showSuccess('Badge removida!');
    }
  } catch (error) {
    console.error('Erro ao remover badge:', error);
    showError(error.message || 'Erro ao remover badge');
  }
}

/**
 * Alterna exibição de badges
 */
async function toggleShowBadges() {
  if (!currentPage) return;

  try {
    const response = await badgesAPI.toggleBadges(currentPage.id);

    if (response.success) {
      currentPage.showBadges = response.data.showBadges;
      updateBadgesToggleButton();
      showSuccess(response.data.showBadges ? 'Badges exibidas!' : 'Badges ocultadas!');
    }
  } catch (error) {
    console.error('Erro ao alternar badges:', error);
    showError('Erro ao alternar exibição de badges');
  }
}

/**
 * Atualiza botão de toggle de badges
 */
function updateBadgesToggleButton() {
  const btn = document.getElementById('toggleBadgesBtn');
  const text = document.getElementById('badgesToggleText');

  if (!btn || !text || !currentPage) return;

  if (currentPage.showBadges) {
    text.textContent = 'Ocultar Badges';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
  } else {
    text.textContent = 'Exibir Badges';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Botões de adicionar bloco
  document.querySelectorAll('[data-add-block]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.addBlock;
      addBlock(type);
    });
  });

  // Botão publicar
  const publishBtn = document.getElementById('publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', togglePublish);
  }

  // Botão copiar URL
  const copyBtn = document.getElementById('copyUrlBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyPublicUrl);
  }

  // Botão toggle badges
  const toggleBadgesBtn = document.getElementById('toggleBadgesBtn');
  if (toggleBadgesBtn) {
    toggleBadgesBtn.addEventListener('click', toggleShowBadges);
  }

  // Botão adicionar badge customizada
  const addCustomBadgeBtn = document.getElementById('addCustomBadgeBtn');
  if (addCustomBadgeBtn) {
    addCustomBadgeBtn.addEventListener('click', openAddCustomBadgeModal);
  }

  // Botão alterar avatar
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener('click', openChangeAvatarModal);
  }

  // Botão salvar displayName
  const saveDisplayNameBtn = document.getElementById('saveDisplayNameBtn');
  if (saveDisplayNameBtn) {
    saveDisplayNameBtn.addEventListener('click', saveDisplayName);
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
