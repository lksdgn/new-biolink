import { Router } from 'express';
import { PagesController } from '../controllers/pages.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const pagesController = new PagesController();

// Todas as rotas de páginas são protegidas
router.use(authMiddleware);

router.get('/me', asyncHandler(pagesController.getMyPage));
router.get('/:id', asyncHandler(pagesController.getPageById));
router.post('/', asyncHandler(pagesController.createPage));
router.put('/:id', asyncHandler(pagesController.updatePage));
router.delete('/:id', asyncHandler(pagesController.deletePage));

export default router;
