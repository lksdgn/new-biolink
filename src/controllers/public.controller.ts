import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { LeaderboardService } from '../services/leaderboard.service';
import { AppError } from '../middleware/error.middleware';

const leaderboardService = new LeaderboardService();

export class PublicController {
  /**
   * GET /public/:slug
   * Retorna a página pública de um usuário
   */
  async getPublicPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      // Buscar usuário pelo slug
      const user = await prisma.user.findUnique({
        where: { slug },
        select: {
          id: true,
          username: true,
          slug: true,
        },
      });

      if (!user) {
        throw new AppError('Página não encontrada', 404);
      }

      // Buscar página do usuário
      const page = await prisma.pages.findFirst({
        where: {
          userId: user.id,
          isPublished: true, // Apenas páginas publicadas
        },
        include: {
          blocks: {
            orderBy: { position: 'asc' },
          },
          badges: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!page) {
        throw new AppError('Página não publicada ou não encontrada', 404);
      }

      // Capturar IP do visitante
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.headers['x-real-ip'] as string
        || req.socket.remoteAddress
        || 'unknown';

      // Incrementar visualização (async, não bloquear resposta)
      leaderboardService.incrementPageView(slug, ipAddress).catch(err => {
        console.error('Erro ao incrementar view:', err);
      });

      // Retornar página
      res.status(200).json({
        success: true,
        data: {
          slug: user.slug,
          username: user.username,
          displayName: page.displayName,
          avatarUrl: page.avatarUrl,
          theme: page.theme,
          blocks: page.blocks,
          badges: page.showBadges ? page.badges : [],
          showBadges: page.showBadges,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /public/:slug/views
   * Retorna o número de visualizações únicas de uma página
   */
  async getPageViews(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      // Buscar usuário pelo slug
      const user = await prisma.user.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!user) {
        throw new AppError('Página não encontrada', 404);
      }

      // Buscar página do usuário
      const page = await prisma.pages.findFirst({
        where: {
          userId: user.id,
          isPublished: true,
        },
        select: { id: true },
      });

      if (!page) {
        throw new AppError('Página não publicada ou não encontrada', 404);
      }

      // Contar visualizações únicas
      const viewsCount = await prisma.view.count({
        where: { pageId: page.id },
      });

      res.status(200).json({
        success: true,
        data: {
          slug,
          views: viewsCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /leaderboard
   * Retorna o ranking de páginas
   */
  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const leaderboard = await leaderboardService.getLeaderboard(limit);

      res.status(200).json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  }
}
