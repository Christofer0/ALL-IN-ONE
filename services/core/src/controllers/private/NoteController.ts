import { Request, Response } from "express";
import { NoteService } from "../../services/NoteService.js";

export const NoteController = {
  async getNotes(req: Request, res: Response) {
    const folderId = req.query.folderId as string;
    const search = req.query.search as string;
    const data = await NoteService.getAll(folderId, search);
    res.json(data);
  },

  async getNoteById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await NoteService.getById(id);
      res.json(data);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },

  async createNote(req: Request, res: Response) {
    try {
      const newItem = await NoteService.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async updateNote(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const updatedItem = await NoteService.update(id, req.body);
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async deleteNote(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await NoteService.delete(id);
    res.json({ success });
  },
};
