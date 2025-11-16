import prisma from '../config/database';
import { env } from '../utils/env';
import { AppError } from '../middleware/error.middleware';

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export class OAuthDiscordService {
  /**
   * Gera a URL de autorização do Discord
   */
  getAuthUrl(): string {
    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_REDIRECT_URI) {
      throw new AppError('Discord OAuth não configurado', 500);
    }

    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      redirect_uri: env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens
   */
  async exchangeCode(code: string): Promise<DiscordTokenResponse> {
    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DISCORD_REDIRECT_URI) {
      throw new AppError('Discord OAuth não configurado', 500);
    }

    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.DISCORD_REDIRECT_URI,
    });

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new AppError('Erro ao obter token do Discord', 400);
    }

    return response.json();
  }

  /**
   * Busca informações do usuário do Discord
   */
  async getDiscordUser(accessToken: string): Promise<DiscordUser> {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new AppError('Erro ao buscar usuário do Discord', 400);
    }

    return response.json();
  }

  /**
   * Conecta a conta do Discord ao usuário
   */
  async connectDiscord(userId: string, code: string) {
    // Trocar código por tokens
    const tokenData = await this.exchangeCode(code);

    // Buscar informações do usuário
    const discordUser = await this.getDiscordUser(tokenData.access_token);

    // Salvar informações no banco
    await prisma.user.update({
      where: { id: userId },
      data: {
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordDiscriminator: discordUser.discriminator,
        discordAvatar: discordUser.avatar,
      },
    });

    return {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
    };
  }

  /**
   * Desconecta a conta do Discord
   */
  async disconnectDiscord(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        discordId: null,
        discordUsername: null,
        discordDiscriminator: null,
        discordAvatar: null,
      },
    });

    return { message: 'Discord desconectado com sucesso' };
  }

  /**
   * Retorna as informações do Discord do usuário
   */
  async getDiscordInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        discordId: true,
        discordUsername: true,
        discordDiscriminator: true,
        discordAvatar: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isConnected = !!user.discordId;

    return {
      isConnected,
      ...(isConnected && {
        id: user.discordId,
        username: user.discordUsername,
        discriminator: user.discordDiscriminator,
        avatar: user.discordAvatar,
      }),
    };
  }
}
