import prisma from '../config/database';
import { env } from '../utils/env';
import { AppError } from '../middleware/error.middleware';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
}

export class OAuthSpotifyService {
  /**
   * Gera a URL de autorização do Spotify
   */
  getAuthUrl(): string {
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_REDIRECT_URI) {
      throw new AppError('Spotify OAuth não configurado', 500);
    }

    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-private',
    ];

    const params = new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: env.SPOTIFY_REDIRECT_URI,
      scope: scopes.join(' '),
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens
   */
  async exchangeCode(code: string): Promise<SpotifyTokenResponse> {
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REDIRECT_URI) {
      throw new AppError('Spotify OAuth não configurado', 500);
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.SPOTIFY_REDIRECT_URI,
    });

    const authHeader = Buffer.from(
      `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new AppError('Erro ao obter token do Spotify', 400);
    }

    return response.json();
  }

  /**
   * Conecta a conta do Spotify ao usuário
   */
  async connectSpotify(userId: string, code: string) {
    // Trocar código por tokens
    const tokenData = await this.exchangeCode(code);

    // Criptografar tokens (em produção, use crypto)
    // Por simplicidade, vamos armazenar diretamente
    const encryptedAccessToken = tokenData.access_token;
    const encryptedRefreshToken = tokenData.refresh_token;

    // Salvar tokens no banco
    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: encryptedAccessToken,
        spotifyRefreshToken: encryptedRefreshToken,
        spotifyScopes: tokenData.scope,
      },
    });

    return {
      connected: true,
      scopes: tokenData.scope.split(' '),
    };
  }

  /**
   * Desconecta a conta do Spotify
   */
  async disconnectSpotify(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        spotifyScopes: null,
      },
    });

    return { message: 'Spotify desconectado com sucesso' };
  }

  /**
   * Lista as playlists do usuário
   */
  async getUserPlaylists(userId: string): Promise<SpotifyPlaylist[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
      },
    });

    if (!user || !user.spotifyAccessToken) {
      throw new AppError('Spotify não conectado', 400);
    }

    // TODO: Implementar refresh token se access token expirou
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        Authorization: `Bearer ${user.spotifyAccessToken}`,
      },
    });

    if (!response.ok) {
      throw new AppError('Erro ao buscar playlists do Spotify', 400);
    }

    const data = await response.json();
    return data.items;
  }

  /**
   * Retorna o status da conexão do Spotify
   */
  async getSpotifyStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyScopes: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isConnected = !!user.spotifyAccessToken;

    return {
      isConnected,
      scopes: isConnected ? user.spotifyScopes?.split(' ') : [],
    };
  }
}
