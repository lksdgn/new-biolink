import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { validateBlockData } from '../utils/validators';

interface CreateBlockData {
  type: string;
  position: number;
  data: any;
}

interface UpdateBlockData {
  type?: string;
  position?: number;
  data?: any;
}

interface ReorderBlock {
  id: string;
  position: number;
}

export class BlocksService {
  /**
   * Cria um novo bloco
   */
  async createBlock(pageId: string, userId: string, data: CreateBlockData) {
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

    // Validar e sanitizar dados do bloco
    const sanitizedData = validateBlockData(data.type, data.data);

    // Criar bloco
    const block = await prisma.block.create({
      data: {
        pageId,
        type: data.type,
        position: data.position,
        data: sanitizedData,
      },
    });

    return block;
  }

  /**
   * Atualiza um bloco existente
   */
  async updateBlock(blockId: string, userId: string, data: UpdateBlockData) {
    // Buscar bloco e verificar se pertence ao usuário
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        page: true,
      },
    });

    if (!block || block.page.userId !== userId) {
      throw new AppError('Bloco não encontrado', 404);
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.position !== undefined) {
      updateData.position = data.position;
    }

    if (data.data !== undefined) {
      const sanitizedData = validateBlockData(data.type || block.type, data.data);
      updateData.data = sanitizedData;
    }

    // Atualizar bloco
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: updateData,
    });

    return updatedBlock;
  }

  /**
   * Deleta um bloco
   */
  async deleteBlock(blockId: string, userId: string) {
    // Buscar bloco e verificar se pertence ao usuário
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        page: true,
      },
    });

    if (!block || block.page.userId !== userId) {
      throw new AppError('Bloco não encontrado', 404);
    }

    await prisma.block.delete({
      where: { id: blockId },
    });

    return { message: 'Bloco deletado com sucesso' };
  }

  /**
   * Reordena blocos de uma página
   */
  async reorderBlocks(pageId: string, userId: string, blocks: ReorderBlock[]) {
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

    // Atualizar posição de cada bloco
    await Promise.all(
      blocks.map((block) =>
        prisma.block.update({
          where: { id: block.id },
          data: { position: block.position },
        })
      )
    );

    // Retornar blocos atualizados
    const updatedBlocks = await prisma.block.findMany({
      where: { pageId },
      orderBy: { position: 'asc' },
    });

    return updatedBlocks;
  }
}
