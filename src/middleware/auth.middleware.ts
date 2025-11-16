import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';
import prisma from '../config/database';

// Estender o tipo Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        slug: string;
        isPremium: boolean;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  slug: string;
}

/**
 * Middleware de autenticação JWT
 * Verifica o token no header Authorization
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
      return;
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
      });
      return;
    }

    const token = parts[1];

    // Verificar o token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        slug: true,
        premiumUntil: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    // Verificar se o usuário tem premium ativo
    const isPremium = user.premiumUntil ? new Date(user.premiumUntil) > new Date() : false;

    // Adicionar informações do usuário na requisição
    req.user = {
      id: user.id,
      email: user.email,
      slug: user.slug,
      isPremium,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao verificar autenticação',
    });
  }
}

/**
 * Middleware que verifica se o usuário tem premium ativo
 */
export function premiumMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.isPremium) {
    res.status(403).json({
      success: false,
      error: 'Esta funcionalidade requer premium',
    });
    return;
  }

  next();
}
