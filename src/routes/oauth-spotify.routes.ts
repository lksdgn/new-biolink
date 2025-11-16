import { Router } from 'express';
import { OAuthSpotifyController } from '../controllers/oauth-spotify.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const oauthSpotifyController = new OAuthSpotifyController();

// Login retorna URL de autorização (pode ser público ou privado)
router.get('/login', asyncHandler(oauthSpotifyController.login));

// Callback e outras rotas requerem autenticação
router.get('/callback', authMiddleware, asyncHandler(oauthSpotifyController.callback));
router.delete('/disconnect', authMiddleware, asyncHandler(oauthSpotifyController.disconnect));
router.get('/playlists', authMiddleware, asyncHandler(oauthSpotifyController.getPlaylists));
router.get('/status', authMiddleware, asyncHandler(oauthSpotifyController.getStatus));

export default router;
