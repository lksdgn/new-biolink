import { Request, Response, NextFunction } from 'express';
import { PagesService } from '../services/pages.service';
import { createPageSchema, updatePageSchema } from '../utils/validators';

const pagesService = new PagesService();

export class PagesController {
  /**
   * GET /pages/me
   */
  async getMyPage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const page = await pagesService.getMyPage(req.user.id);

      res.status(200).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /pages/:id
   */
  async getPageById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { id } = req.params;
      const page = await pagesService.getPageById(id, req.user.id);

      res.status(200).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /pages
   */
  async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const data = createPageSchema.parse(req.body);
      const page = await pagesService.createPage({
        userId: req.user.id,
        ...data,
      });

      res.status(201).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /pages/:id
   */
  async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { id } = req.params;
      const data = updatePageSchema.parse(req.body);
      const page = await pagesService.updatePage(id, req.user.id, data);

      res.status(200).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /pages/:id
   */
  async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { id } = req.params;
      const result = await pagesService.deletePage(id, req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
