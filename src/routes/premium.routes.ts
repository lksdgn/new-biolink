import { Router } from 'express';
import { PremiumController } from '../controllers/premium.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();
const premiumController = new PremiumController();

// Checkout e status requerem autenticação
router.post('/checkout', authMiddleware, asyncHandler(premiumController.createCheckout));
router.get('/status', authMiddleware, asyncHandler(premiumController.getStatus));
router.delete('/cancel', authMiddleware, asyncHandler(premiumController.cancelPremium));

// Webhook é público (validação via assinatura no controller)
router.post('/webhook', asyncHandler(premiumController.webhook));

export default router;
