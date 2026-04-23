import { Request, Response } from "express";
import { GoalService } from "../../services/GoalService.js";

export const GoalController = {
  async getGoals(req: Request, res: Response) {
    try {
      const goals = await GoalService.getAll();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await GoalService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async createGoal(req: Request, res: Response) {
    try {
      const goal = await GoalService.create(req.body);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async updateGoal(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const goal = await GoalService.update(id, req.body);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async archiveGoal(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await GoalService.archive(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async deleteGoal(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await GoalService.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async toggleKR(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const krId = req.params.krId as string;
      const updated = await GoalService.toggleKR(id, krId);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
