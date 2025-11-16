import { Request, Response, NextFunction } from 'express';
import { OAuthDiscordService } from '../services/oauth-discord.service';

const oauthDiscordService = new OAuthDiscordService();

export class OAuthDiscordController {
  /**
   * GET /oauth/discord/login
   * Redireciona para a página de autorização do Discord
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const authUrl = oauthDiscordService.getAuthUrl();

      res.status(200).json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /oauth/discord/callback
   * Processa o callback do Discord
   */
  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Código de autorização não fornecido',
        });
        return;
      }

      const result = await oauthDiscordService.connectDiscord(req.user.id, code);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /oauth/discord/disconnect
   * Desconecta a conta do Discord
   */
  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const result = await oauthDiscordService.disconnectDiscord(req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /oauth/discord/status
   * Retorna o status da conexão do Discord
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const status = await oauthDiscordService.getDiscordInfo(req.user.id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
