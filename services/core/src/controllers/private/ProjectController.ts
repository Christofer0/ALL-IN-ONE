import { Request, Response } from "express";
import { ProjectService } from "../../services/ProjectService.js";

export const ProjectController = {
  async getProjects(req: Request, res: Response) {
    const data = await ProjectService.getAll();
    res.json(data);
  },

  async createProject(req: Request, res: Response) {
    try {
      const newItem = await ProjectService.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      console.error("DEBUG: createProject error:", err);
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async updateProject(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const updatedItem = await ProjectService.update(id, req.body);
      res.json(updatedItem);
    } catch (err) {
      console.error("DEBUG: updateProject error:", err);
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async deleteProject(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await ProjectService.delete(id);
    res.json({ success });
  },
};
