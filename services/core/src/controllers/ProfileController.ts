import { Request, Response } from "express";
import { UserService } from "../services/UserService.js";

export const ProfileController = {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const profile = await UserService.getProfile(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const profile = await UserService.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await UserService.changePassword(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
