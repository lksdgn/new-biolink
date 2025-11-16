import { Router } from 'express';
import { OAuthDiscordController } from '../controllers/oauth-discord.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const oauthDiscordController = new OAuthDiscordController();

// Login retorna URL de autorização (pode ser público ou privado)
router.get('/login', asyncHandler(oauthDiscordController.login));

// Callback e outras rotas requerem autenticação
router.get('/callback', authMiddleware, asyncHandler(oauthDiscordController.callback));
router.delete('/disconnect', authMiddleware, asyncHandler(oauthDiscordController.disconnect));
router.get('/status', authMiddleware, asyncHandler(oauthDiscordController.getStatus));

export default router;
