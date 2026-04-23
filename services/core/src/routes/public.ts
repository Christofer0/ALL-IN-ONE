import { Router } from "express";
import { PublicController } from "../controllers/PublicController.js";

const router = Router();

// Projects
router.get("/projects", PublicController.getProjects);
router.get("/projects/:slug", PublicController.getProjectBySlug);

// Blogs
router.get("/blogs", PublicController.getBlogs);
router.get("/blogs/:slug", PublicController.getBlogBySlug);

export default router;
