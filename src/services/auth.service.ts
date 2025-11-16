import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../utils/env';
import { generateUniqueSlug } from '../utils/generateSlug';
import { AppError } from '../middleware/error.middleware';

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    slug: string;
    isPremium: boolean;
  };
}

export class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData): Promise<TokenResponse> {
    const { email, password, username } = data;

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email já cadastrado', 409);
    }

    // Gerar slug único
    const slug = await generateUniqueSlug(username);

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        slug,
      },
    });

    // Criar página padrão para o usuário
    await prisma.pages.create({
      data: {
        userId: user.id,
        theme: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          buttonColor: '#0070f3',
        },
        isPublished: false,
      },
    });

    // Gerar tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.slug);

    // Salvar refresh token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        slug: user.slug,
        isPremium: false,
      },
    };
  }

  /**
   * Faz login de um usuário
   */
  async login(data: LoginData): Promise<TokenResponse> {
    const { email, password } = data;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Gerar tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.slug);

    // Salvar refresh token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Verificar premium
    const isPremium = user.premiumUntil ? new Date(user.premiumUntil) > new Date() : false;

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        slug: user.slug,
        isPremium,
      },
    };
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        slug: string;
      };

      // Buscar usuário e verificar se o refresh token bate
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Refresh token inválido', 401);
      }

      // Gerar novo access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          slug: user.slug,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return { accessToken };
    } catch (error) {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }
  }

  /**
   * Faz logout do usuário (invalida o refresh token)
   */
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Gera access token e refresh token
   */
  private generateTokens(userId: string, email: string, slug: string) {
    const accessToken = jwt.sign(
      { userId, email, slug },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId, email, slug },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }
}
