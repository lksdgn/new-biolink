import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface CreatePageData {
  userId: string;
  theme?: any;
}

interface UpdatePageData {
  theme?: any;
  isPublished?: boolean;
  avatarUrl?: string;
  displayName?: string;
}

export class PagesService {
  /**
   * Busca a página do usuário autenticado
   */
  async getMyPage(userId: string) {
    const page = await prisma.pages.findFirst({
      where: { userId },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    return page;
  }

  /**
   * Busca uma página específica por ID
   */
  async getPageById(pageId: string, userId: string) {
    const page = await prisma.pages.findFirst({
      where: {
        id: pageId,
        userId, // Garante que o usuário é dono da página
      },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    return page;
  }

  /**
   * Cria uma nova página para o usuário
   */
  async createPage(data: CreatePageData) {
    const { userId, theme } = data;

    // Verificar se já existe uma página para este usuário
    const existingPage = await prisma.pages.findFirst({
      where: { userId },
    });

    if (existingPage) {
      throw new AppError('Usuário já possui uma página', 409);
    }

    const page = await prisma.pages.create({
      data: {
        userId,
        theme: theme || {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          buttonColor: '#0070f3',
        },
        isPublished: false,
      },
      include: {
        blocks: true,
      },
    });

    return page;
  }

  /**
   * Atualiza uma página existente
   */
  async updatePage(pageId: string, userId: string, data: UpdatePageData) {
    // Verificar se a página pertence ao usuário
    const page = await prisma.pages.findFirst({
      where: {
        id: pageId,
        userId,
      },
    });

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    const updatedPage = await prisma.pages.update({
      where: { id: pageId },
      data: {
        theme: data.theme !== undefined ? data.theme : undefined,
        isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
        displayName: data.displayName !== undefined ? data.displayName : undefined,
      },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return updatedPage;
  }

  /**
   * Deleta uma página
   */
  async deletePage(pageId: string, userId: string) {
    // Verificar se a página pertence ao usuário
    const page = await prisma.pages.findFirst({
      where: {
        id: pageId,
        userId,
      },
    });

    if (!page) {
      throw new AppError('Página não encontrada', 404);
    }

    await prisma.pages.delete({
      where: { id: pageId },
    });

    return { message: 'Página deletada com sucesso' };
  }
}
