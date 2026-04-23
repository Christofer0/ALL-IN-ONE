import { Request, Response } from "express";
import { BlogService } from "../../services/BlogService.js";

export const BlogController = {
  async getBlogs(req: Request, res: Response) {
    const data = await BlogService.getAll();
    res.json(data);
  },

  async createBlog(req: Request, res: Response) {
    try {
      const newItem = await BlogService.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      console.error("DEBUG: createBlog error:", err);
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async updateBlog(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const updatedItem = await BlogService.update(id, req.body);
      res.json(updatedItem);
    } catch (err) {
      console.error("DEBUG: updateBlog error:", err);
      res.status(400).json({ error: (err as Error).message });
    }
  },

  async deleteBlog(req: Request, res: Response) {
    const id = req.params.id as string;
    const success = await BlogService.delete(id);
    res.json({ success });
  },
};
