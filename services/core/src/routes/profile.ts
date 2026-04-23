import { Router } from "express";
import { ProfileController } from "../controllers/ProfileController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/profile", authMiddleware, ProfileController.getProfile);
router.put("/profile", authMiddleware, ProfileController.updateProfile);
router.patch("/change-password", authMiddleware, ProfileController.changePassword);

export default router;
