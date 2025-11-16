import prisma from '../config/database';

/**
 * Gera um slug único baseado no username
 * Se o slug já existir, adiciona um número sequencial
 */
export async function generateUniqueSlug(username: string): Promise<string> {
  // Normalizar o username para slug válido
  let baseSlug = username
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9-_]/g, '-') // Substitui caracteres inválidos por -
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início/fim

  // Garantir tamanho mínimo e máximo
  if (baseSlug.length < 3) {
    baseSlug = baseSlug + Math.random().toString(36).substring(2, 5);
  }
  if (baseSlug.length > 30) {
    baseSlug = baseSlug.substring(0, 30);
  }

  let slug = baseSlug;
  let counter = 1;

  // Verificar se o slug já existe e incrementar se necessário
  while (await isSlugTaken(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Verifica se um slug já está em uso
 */
async function isSlugTaken(slug: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { slug },
  });
  return !!user;
}

/**
 * Valida formato do slug
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-_]{3,30}$/;
  return slugRegex.test(slug);
}
