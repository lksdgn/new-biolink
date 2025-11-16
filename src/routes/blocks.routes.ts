import { Router } from 'express';
import { BlocksController } from '../controllers/blocks.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const blocksController = new BlocksController();

// Todas as rotas de blocos são protegidas
router.use(authMiddleware);

router.post('/:pageId', asyncHandler(blocksController.createBlock));
router.put('/:blockId', asyncHandler(blocksController.updateBlock));
router.delete('/:blockId', asyncHandler(blocksController.deleteBlock));
router.put('/:pageId/reorder', asyncHandler(blocksController.reorderBlocks));

export default router;
