import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { AppError } from '../middleware/error.middleware';

// Configurar multer para upload de avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivos - apenas imagens
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
  }
};

// Configurar upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

export class UploadController {
  /**
   * POST /upload/avatar
   * Faz upload de avatar
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }

      // URL pública do arquivo
      const fileUrl = `/uploads/avatars/${req.file.filename}`;

      res.status(200).json({
        success: true,
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
