import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const publicController = new PublicController();

// Rotas públicas (sem autenticação)
// IMPORTANTE: Rotas específicas devem vir ANTES da rota dinâmica :slug
router.get('/leaderboard', asyncHandler(publicController.getLeaderboard));
router.get('/:slug/views', asyncHandler(publicController.getPageViews));
router.get('/:slug', asyncHandler(publicController.getPublicPage));

export default router;
