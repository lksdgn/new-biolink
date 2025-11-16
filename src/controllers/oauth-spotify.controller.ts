import { Request, Response, NextFunction } from 'express';
import { OAuthSpotifyService } from '../services/oauth-spotify.service';

const oauthSpotifyService = new OAuthSpotifyService();

export class OAuthSpotifyController {
  /**
   * GET /oauth/spotify/login
   * Redireciona para a página de autorização do Spotify
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const authUrl = oauthSpotifyService.getAuthUrl();

      res.status(200).json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /oauth/spotify/callback
   * Processa o callback do Spotify
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

      const result = await oauthSpotifyService.connectSpotify(req.user.id, code);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /oauth/spotify/disconnect
   * Desconecta a conta do Spotify
   */
  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const result = await oauthSpotifyService.disconnectSpotify(req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /oauth/spotify/playlists
   * Lista as playlists do usuário
   */
  async getPlaylists(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const playlists = await oauthSpotifyService.getUserPlaylists(req.user.id);

      res.status(200).json({
        success: true,
        data: playlists,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /oauth/spotify/status
   * Retorna o status da conexão do Spotify
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const status = await oauthSpotifyService.getSpotifyStatus(req.user.id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
