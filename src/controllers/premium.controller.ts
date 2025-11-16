import { Request, Response, NextFunction } from 'express';
import { PremiumService } from '../services/premium.service';
import { z } from 'zod';

const premiumService = new PremiumService();

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
});

export class PremiumController {
  /**
   * POST /premium/checkout
   */
  async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const data = checkoutSchema.parse(req.body);
      const result = await premiumService.createCheckout(req.user.id, data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /premium/webhook
   */
  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Em produção, validar assinatura do webhook aqui
      const payload = req.body;

      const result = await premiumService.processWebhook(payload);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /premium/status
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const status = await premiumService.getPremiumStatus(req.user.id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /premium/cancel
   */
  async cancelPremium(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const result = await premiumService.cancelPremium(req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
