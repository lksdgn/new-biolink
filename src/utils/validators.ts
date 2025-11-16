import { z } from 'zod';

// Validação de email
export const emailSchema = z.string().email('Email inválido').toLowerCase();

// Validação de senha (mínimo 8 caracteres, 1 letra e 1 número)
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

// Validação de slug
export const slugSchema = z
  .string()
  .min(3, 'Slug deve ter no mínimo 3 caracteres')
  .max(30, 'Slug deve ter no máximo 30 caracteres')
  .regex(/^[a-z0-9-_]+$/, 'Slug deve conter apenas letras minúsculas, números, hífens e underscores')
  .toLowerCase();

// Validação de username
export const usernameSchema = z
  .string()
  .min(3, 'Username deve ter no mínimo 3 caracteres')
  .max(30, 'Username deve ter no máximo 30 caracteres');

// Validação de tipo de bloco
export const blockTypeSchema = z.enum(['text', 'link', 'image', 'spotify', 'discord', 'divider']);

// Validação de registro
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

// Validação de login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Validação de tema da página
export const themeSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonColor: z.string().optional(),
  fontFamily: z.string().optional(),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  customCss: z.string().optional(),
}).passthrough(); // Permite campos extras

// Validação de criação de página
export const createPageSchema = z.object({
  theme: themeSchema.optional(),
});

// Validação de atualização de página
export const updatePageSchema = z.object({
  theme: themeSchema.optional(),
  isPublished: z.boolean().optional(),
  avatarUrl: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    // Aceita URLs completas ou caminhos relativos que começam com /
    return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/');
  }, { message: 'Avatar URL deve ser uma URL válida ou caminho relativo' }),
  displayName: z.string().min(1).max(50).optional().or(z.literal('')),
});

// Validação de criação de bloco
export const createBlockSchema = z.object({
  type: blockTypeSchema,
  position: z.number().int().min(0),
  data: z.record(z.any()), // JSON genérico
});

// Validação de atualização de bloco
export const updateBlockSchema = z.object({
  type: blockTypeSchema.optional(),
  position: z.number().int().min(0).optional(),
  data: z.record(z.any()).optional(),
});

// Validação de reordenação de blocos
export const reorderBlocksSchema = z.object({
  blocks: z.array(z.object({
    id: z.string().uuid(),
    position: z.number().int().min(0),
  })),
});

/**
 * Sanitiza HTML para prevenir XSS
 * Remove tags perigosas e mantém apenas tags seguras
 */
export function sanitizeHtml(html: string): string {
  // Lista de tags permitidas
  const allowedTags = ['b', 'i', 'u', 'br', 'p', 'strong', 'em', 'span'];

  // Remove tags não permitidas
  let sanitized = html.replace(/<(?!\/?(b|i|u|br|p|strong|em|span)\b)[^>]*>/gi, '');

  // Remove atributos de eventos (onclick, onerror, etc)
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: nos href
  sanitized = sanitized.replace(/href="javascript:[^"]*"/gi, 'href="#"');
  sanitized = sanitized.replace(/href='javascript:[^']*'/gi, "href='#'");

  return sanitized;
}

/**
 * Valida e sanitiza dados de um bloco baseado no tipo
 */
export function validateBlockData(type: string, data: any): any {
  switch (type) {
    case 'text':
      return {
        content: sanitizeHtml(data.content || ''),
        fontSize: data.fontSize || 'medium',
        alignment: data.alignment || 'left',
      };

    case 'link':
      return {
        title: sanitizeHtml(data.title || 'Link'),
        url: data.url || '#',
        icon: data.icon || null,
      };

    case 'image':
      return {
        url: data.url || '',
        alt: sanitizeHtml(data.alt || ''),
        width: data.width || '100%',
      };

    case 'spotify':
      return {
        playlistId: data.playlistId || null,
        playlistName: data.playlistName || '',
        playlistImage: data.playlistImage || '',
      };

    case 'discord':
      return {
        username: sanitizeHtml(data.username || ''),
        discriminator: data.discriminator || '',
        avatar: data.avatar || '',
        userId: data.userId || '',
      };

    case 'divider':
      return {
        style: data.style || 'solid',
        color: data.color || '#cccccc',
      };

    default:
      return data;
  }
}
