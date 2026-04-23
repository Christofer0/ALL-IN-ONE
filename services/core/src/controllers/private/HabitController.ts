import { Request, Response } from "express";
import { HabitService } from "../../services/HabitService.js";

export const HabitController = {
  async getHabits(req: Request, res: Response) {
    try {
      const data = await HabitService.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const data = await HabitService.getStats();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },

  async createHabit(req: Request, res: Response) {
    try {
      const newItem = await HabitService.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async deleteHabit(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await HabitService.delete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async toggleToday(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await HabitService.toggleToday(id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async toggleLog(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { logDate, done } = req.body;
      const result = await HabitService.toggleLog(id, logDate, done);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },
};
