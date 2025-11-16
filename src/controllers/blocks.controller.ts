import { Request, Response, NextFunction } from 'express';
import { BlocksService } from '../services/blocks.service';
import { createBlockSchema, updateBlockSchema, reorderBlocksSchema } from '../utils/validators';

const blocksService = new BlocksService();

export class BlocksController {
  /**
   * POST /blocks/:pageId
   */
  async createBlock(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { pageId } = req.params;
      const data = createBlockSchema.parse(req.body);

      const block = await blocksService.createBlock(pageId, req.user.id, data);

      res.status(201).json({
        success: true,
        data: block,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /blocks/:blockId
   */
  async updateBlock(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { blockId } = req.params;
      const data = updateBlockSchema.parse(req.body);

      const block = await blocksService.updateBlock(blockId, req.user.id, data);

      res.status(200).json({
        success: true,
        data: block,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /blocks/:blockId
   */
  async deleteBlock(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { blockId } = req.params;
      const result = await blocksService.deleteBlock(blockId, req.user.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /blocks/:pageId/reorder
   */
  async reorderBlocks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const { pageId } = req.params;
      const data = reorderBlocksSchema.parse(req.body);

      const blocks = await blocksService.reorderBlocks(pageId, req.user.id, data.blocks);

      res.status(200).json({
        success: true,
        data: blocks,
      });
    } catch (error) {
      next(error);
    }
  }
}
