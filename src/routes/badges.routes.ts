import { Router } from 'express';
import { BadgesController } from '../controllers/badges.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const badgesController = new BadgesController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /badges/presets - Lista badges pré-definidas (deve vir antes das rotas dinâmicas)
router.get('/presets', asyncHandler(badgesController.getPresetBadges));

// GET /badges/:pageId - Lista badges de uma página
router.get('/:pageId', asyncHandler(badgesController.getBadges));

// POST /badges/:pageId - Cria uma nova badge
router.post('/:pageId', asyncHandler(badgesController.createBadge));

// PUT /badges/:pageId/toggle - Alterna exibição de badges
router.put('/:pageId/toggle', asyncHandler(badgesController.toggleBadges));

// PUT /badges/:badgeId - Atualiza uma badge customizada
router.put('/:badgeId', asyncHandler(badgesController.updateBadge));

// DELETE /badges/:badgeId - Remove uma badge
router.delete('/:badgeId', asyncHandler(badgesController.deleteBadge));

export default router;
