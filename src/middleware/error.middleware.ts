import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Middleware global de tratamento de erros
 * Formata todos os erros em um padrão JSON consistente
 */
export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  // Erro de validação do Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Erro do Prisma (banco de dados)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0] || 'campo';
      res.status(409).json({
        success: false,
        error: `${field} já está em uso`,
      });
      return;
    }

    // P2025: Record not found
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Registro não encontrado',
      });
      return;
    }

    // Outros erros do Prisma
    res.status(400).json({
      success: false,
      error: 'Erro ao processar requisição no banco de dados',
    });
    return;
  }

  // Erro customizado da aplicação
  if (error.statusCode && error.message) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : error.message || 'Erro desconhecido',
  });
}

/**
 * Classe para erros customizados da aplicação
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Wrapper assíncrono para capturar erros em controllers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
