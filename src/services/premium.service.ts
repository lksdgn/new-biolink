import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface CheckoutData {
  plan: 'monthly' | 'annual';
}

export class PremiumService {
  /**
   * Cria um checkout de premium (mockado)
   * Na produção, integraria com Stripe ou Mercado Pago
   */
  async createCheckout(userId: string, data: CheckoutData) {
    const prices = {
      monthly: 9.90,
      annual: 99.90,
    };

    const price = prices[data.plan];

    // Mock: retornar URL de checkout
    // Em produção, criaria uma sessão no Stripe/MP
    const checkoutUrl = `https://checkout.example.com/premium?user=${userId}&plan=${data.plan}`;

    return {
      checkoutUrl,
      plan: data.plan,
      price,
      currency: 'BRL',
    };
  }

  /**
   * Processa webhook de pagamento (mockado)
   * Na produção, validaria assinatura do webhook
   */
  async processWebhook(payload: any) {
    // Mock: validar e processar pagamento
    const { userId, plan, status } = payload;

    if (status === 'approved') {
      // Calcular data de expiração do premium
      const now = new Date();
      const premiumUntil = new Date(now);

      if (plan === 'monthly') {
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);
      } else if (plan === 'annual') {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);
      }

      // Atualizar usuário com premium
      await prisma.user.update({
        where: { id: userId },
        data: { premiumUntil },
      });

      return { success: true, message: 'Premium ativado com sucesso' };
    }

    return { success: false, message: 'Pagamento não aprovado' };
  }

  /**
   * Retorna o status do premium do usuário
   */
  async getPremiumStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        premiumUntil: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPremium = user.premiumUntil ? new Date(user.premiumUntil) > new Date() : false;

    return {
      isPremium,
      premiumUntil: user.premiumUntil,
      daysRemaining: isPremium
        ? Math.ceil((new Date(user.premiumUntil!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    };
  }

  /**
   * Cancela o premium do usuário (mock)
   */
  async cancelPremium(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { premiumUntil: null },
    });

    return { message: 'Premium cancelado com sucesso' };
  }
}
