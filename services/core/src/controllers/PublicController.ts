import { Request, Response } from "express";
import { ProjectService } from "../services/ProjectService.js";
import { BlogService } from "../services/BlogService.js";
import { UserService } from "../services/UserService.js";

export const PublicController = {
  async getProjects(req: Request, res: Response) {
    const data = await ProjectService.getAllPublished();
    res.json(data);
  },

  async getProjectBySlug(req: Request<{ slug: string }>, res: Response) {
    const slug = req.params.slug as string;
    const data = await ProjectService.getBySlug(slug, true);
    if (!data) return res.status(404).json({ error: "Project not found" });
    res.json(data);
  },

  async getBlogs(req: Request, res: Response) {
    const data = await BlogService.getAllPublished();
    res.json(data);
  },

  async getBlogBySlug(req: Request<{ slug: string }>, res: Response) {
    const slug = req.params.slug as string;
    const data = await BlogService.getBySlug(slug, true);
    if (!data) return res.status(404).json({ error: "Article not found" });
    res.json(data);
  },

  async getProfile(req: Request, res: Response) {
    const data = await UserService.getPublicProfile();
    res.json(data);
  },
};
