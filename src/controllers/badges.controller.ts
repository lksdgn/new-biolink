import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class BadgesController {
  /**
   * GET /badges/:pageId
   * Retorna todas as badges de uma página
   */
  async getBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id;

      // Verificar se a página pertence ao usuário
      const page = await prisma.pages.findFirst({
        where: {
          id: pageId,
          userId,
        },
      });

      if (!page) {
        throw new AppError('Página não encontrada', 404);
      }

      // Buscar badges
      const badges = await prisma.badge.findMany({
        where: { pageId },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json({
        success: true,
        data: badges,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /badges/:pageId
   * Cria uma nova badge
   */
  async createBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id;
      const { type, name, imageUrl, presetKey } = req.body;

      // Validação básica
      if (!type || !name) {
        throw new AppError('Tipo e nome são obrigatórios', 400);
      }

      if (type !== 'preset' && type !== 'custom') {
        throw new AppError('Tipo deve ser "preset" ou "custom"', 400);
      }

      // Verificar se a página pertence ao usuário
      const page = await prisma.pages.findFirst({
        where: {
          id: pageId,
          userId,
        },
      });

      if (!page) {
        throw new AppError('Página não encontrada', 404);
      }

      // Verificar limite de badges customizadas (3)
      if (type === 'custom') {
        const customBadgesCount = await prisma.badge.count({
          where: {
            pageId,
            type: 'custom',
          },
        });

        if (customBadgesCount >= 3) {
          throw new AppError('Você já possui o máximo de 3 badges customizadas', 400);
        }

        // Badge customizada precisa de imageUrl
        if (!imageUrl) {
          throw new AppError('Badge customizada requer uma URL de imagem', 400);
        }
      }

      // Criar badge
      const badge = await prisma.badge.create({
        data: {
          pageId,
          type,
          name,
          imageUrl: type === 'custom' ? imageUrl : null,
          presetKey: type === 'preset' ? presetKey : null,
        },
      });

      res.status(201).json({
        success: true,
        data: badge,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /badges/:badgeId
   * Atualiza uma badge customizada
   */
  async updateBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const { badgeId } = req.params;
      const userId = req.user?.id;
      const { name, imageUrl } = req.body;

      // Buscar badge e verificar propriedade
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
        include: {
          page: true,
        },
      });

      if (!badge) {
        throw new AppError('Badge não encontrada', 404);
      }

      if (badge.page.userId !== userId) {
        throw new AppError('Sem permissão para editar esta badge', 403);
      }

      // Apenas badges customizadas podem ser editadas
      if (badge.type !== 'custom') {
        throw new AppError('Apenas badges customizadas podem ser editadas', 400);
      }

      // Validar campos
      if (!name || !imageUrl) {
        throw new AppError('Nome e URL da imagem são obrigatórios', 400);
      }

      // Atualizar badge
      const updatedBadge = await prisma.badge.update({
        where: { id: badgeId },
        data: {
          name,
          imageUrl,
        },
      });

      res.status(200).json({
        success: true,
        data: updatedBadge,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /badges/:badgeId
   * Remove uma badge
   */
  async deleteBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const { badgeId } = req.params;
      const userId = req.user?.id;

      // Buscar badge e verificar propriedade
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
        include: {
          page: true,
        },
      });

      if (!badge) {
        throw new AppError('Badge não encontrada', 404);
      }

      if (badge.page.userId !== userId) {
        throw new AppError('Sem permissão para deletar esta badge', 403);
      }

      // Deletar badge
      await prisma.badge.delete({
        where: { id: badgeId },
      });

      res.status(200).json({
        success: true,
        message: 'Badge deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /badges/:pageId/toggle
   * Alterna exibição de badges
   */
  async toggleBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id;

      // Verificar se a página pertence ao usuário
      const page = await prisma.pages.findFirst({
        where: {
          id: pageId,
          userId,
        },
      });

      if (!page) {
        throw new AppError('Página não encontrada', 404);
      }

      // Alternar showBadges
      const updatedPage = await prisma.pages.update({
        where: { id: pageId },
        data: {
          showBadges: !page.showBadges,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          showBadges: updatedPage.showBadges,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /badges/presets
   * Retorna badges pré-definidas disponíveis
   */
  async getPresetBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const presets = [
        { key: 'verified', name: 'Verificado', icon: '✓', color: '#3b82f6' },
        { key: 'premium', name: 'Premium', icon: '💎', color: '#8b5cf6' },
        { key: 'gold', name: 'Gold', icon: '👑', color: '#fbbf24' },
        { key: 'silver', name: 'Silver', icon: '⭐', color: '#d1d5db' },
        { key: 'bronze', name: 'Bronze', icon: '🥉', color: '#cd7f32' },
        { key: 'diamond', name: 'Diamond', icon: '💠', color: '#06b6d4' },
        { key: 'legendary', name: 'Legendary', icon: '🔥', color: '#ef4444' },
        { key: 'creator', name: 'Creator', icon: '🎨', color: '#ec4899' },
        { key: 'developer', name: 'Developer', icon: '💻', color: '#10b981' },
        { key: 'gamer', name: 'Gamer', icon: '🎮', color: '#6366f1' },
      ];

      res.status(200).json({
        success: true,
        data: presets,
      });
    } catch (error) {
      next(error);
    }
  }
}
