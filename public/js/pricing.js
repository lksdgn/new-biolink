// Pricing

/**
 * Inicia checkout de premium
 */
async function startCheckout(plan) {
  // Verificar se está autenticado
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await premiumAPI.createCheckout(plan);

    if (response.success) {
      const { checkoutUrl } = response.data;

      // Redirecionar para URL de checkout (mock)
      showSuccess(`Redirecionando para checkout do plano ${plan}...`);

      setTimeout(() => {
        // Em produção, redirecionar para checkoutUrl real
        // window.location.href = checkoutUrl;
        alert(`Checkout mockado para plano ${plan}\nURL: ${checkoutUrl}`);
      }, 1500);
    }
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    showError(error.message || 'Erro ao iniciar checkout');
  }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Botões de checkout
  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      startCheckout(plan);
    });
  });
});
