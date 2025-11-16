import { Router } from 'express';
import { UploadController, upload } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const uploadController = new UploadController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// POST /upload/avatar - Upload de avatar
router.post('/avatar', upload.single('avatar'), asyncHandler(uploadController.uploadAvatar));

export default router;
