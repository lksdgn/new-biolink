// Leaderboard

/**
 * Inicializa o leaderboard
 */
async function initLeaderboard() {
  await loadLeaderboard();
}

/**
 * Carrega dados do leaderboard
 */
async function loadLeaderboard() {
  const container = document.getElementById('leaderboardList');

  if (!container) return;

  try {
    // Mostrar loading
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div class="spinner" style="margin: 0 auto;"></div>
        <p style="margin-top: 1rem;">Carregando ranking...</p>
      </div>
    `;

    const response = await publicAPI.getLeaderboard(50);

    if (response.success && response.data.length > 0) {
      renderLeaderboard(response.data);
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3 class="empty-state-title">Nenhum dado ainda</h3>
          <p class="empty-state-description">
            O ranking será atualizado conforme as páginas forem acessadas.
          </p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erro ao carregar leaderboard:', error);
    container.innerHTML = `
      <div class="alert alert-error">
        Erro ao carregar ranking. Tente novamente mais tarde.
      </div>
    `;
  }
}

/**
 * Renderiza leaderboard
 */
function renderLeaderboard(entries) {
  const container = document.getElementById('leaderboardList');

  if (!container) return;

  container.innerHTML = entries.map((entry, index) => `
    <div class="leaderboard-item">
      <div class="leaderboard-position ${index < 3 ? `top-${index + 1}` : ''}">
        ${entry.position}
      </div>
      <div class="leaderboard-info">
        <div class="leaderboard-slug">@${entry.slug}</div>
        <div class="leaderboard-views">${formatNumber(entry.views)} visualizações</div>
      </div>
      <a href="/viewer.html?slug=${entry.slug}" class="btn btn-sm btn-outline">
        Ver Página
      </a>
    </div>
  `).join('');

  // Adicionar animação stagger
  container.classList.add('stagger-fade-in');
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeaderboard);
} else {
  initLeaderboard();
}
