import prisma from '../config/database';

export class LeaderboardService {
  /**
   * Retorna o ranking de páginas por visualizações
   */
  async getLeaderboard(limit: number = 50) {
    const leaderboard = await prisma.leaderboardCache.findMany({
      orderBy: { viewsTotal: 'desc' },
      take: limit,
      select: {
        slug: true,
        viewsTotal: true,
      },
    });

    return leaderboard.map((entry, index) => ({
      position: index + 1,
      slug: entry.slug,
      views: entry.viewsTotal,
    }));
  }

  /**
   * Incrementa o contador de views de uma página (apenas IPs únicos)
   */
  async incrementPageView(slug: string, ipAddress: string) {
    // Buscar usuário pelo slug
    const user = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!user) {
      return;
    }

    // Buscar página do usuário
    const page = await prisma.pages.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!page) {
      return;
    }

    try {
      // Tentar criar view - só funciona se IP ainda não visualizou (unique constraint)
      await prisma.view.create({
        data: {
          pageId: page.id,
          ipAddress: ipAddress,
        },
      });

      // Atualizar cache do leaderboard apenas se foi uma nova view
      await this.updateLeaderboardCache(slug);
    } catch (error: any) {
      // Se falhar por violação de unique constraint, IP já visualizou - não faz nada
      if (error.code === 'P2002') {
        // P2002 = Unique constraint violation
        return;
      }
      // Se for outro erro, lançar
      throw error;
    }
  }

  /**
   * Atualiza o cache do leaderboard para um slug
   */
  async updateLeaderboardCache(slug: string) {
    // Buscar usuário pelo slug
    const user = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!user) {
      return;
    }

    // Buscar página do usuário
    const page = await prisma.pages.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!page) {
      return;
    }

    // Calcular total de views (contar registros únicos por IP)
    const viewsTotal = await prisma.view.count({
      where: { pageId: page.id },
    });

    // Atualizar ou criar cache
    await prisma.leaderboardCache.upsert({
      where: { slug },
      create: {
        slug,
        viewsTotal,
      },
      update: {
        viewsTotal,
      },
    });
  }

  /**
   * Recalcula todo o leaderboard (útil para manutenção)
   */
  async recalculateLeaderboard() {
    const users = await prisma.user.findMany({
      select: { slug: true },
    });

    for (const user of users) {
      await this.updateLeaderboardCache(user.slug);
    }

    return { message: 'Leaderboard recalculado com sucesso' };
  }
}
