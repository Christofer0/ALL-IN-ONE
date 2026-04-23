import { Request, Response } from "express";
import { FolderService } from "../../services/FolderService.js";

export const FolderController = {
  async getFolders(req: Request, res: Response) {
    const data = await FolderService.getAll();
    res.json(data);
  },

  async createFolder(req: Request, res: Response) {
    try {
      const newItem = await FolderService.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async updateFolder(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const updatedItem = await FolderService.update(id, req.body);
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async deleteFolder(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await FolderService.delete(id);
    res.json({ success });
  },
};
