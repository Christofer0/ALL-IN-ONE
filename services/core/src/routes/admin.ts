import { Router } from "express";
import { ProjectController } from "../controllers/private/ProjectController.js";
import { BlogController } from "../controllers/private/BlogController.js";
import { FolderController } from "../controllers/private/FolderController.js";
import { NoteController } from "../controllers/private/NoteController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// Projects
router.get("/projects", ProjectController.getProjects);
router.post("/projects", ProjectController.createProject);
router.put("/projects/:id", ProjectController.updateProject);
router.delete("/projects/:id", ProjectController.deleteProject);

// Blogs
router.get("/blogs", BlogController.getBlogs);
router.post("/blogs", BlogController.createBlog);
router.put("/blogs/:id", BlogController.updateBlog);
router.delete("/blogs/:id", BlogController.deleteBlog);

// Folders
router.get("/folders", FolderController.getFolders);
router.post("/folders", FolderController.createFolder);
router.put("/folders/:id", FolderController.updateFolder);
router.delete("/folders/:id", FolderController.deleteFolder);

// Notes
router.get("/notes", NoteController.getNotes);
router.get("/notes/:id", NoteController.getNoteById);
router.post("/notes", NoteController.createNote);
router.put("/notes/:id", NoteController.updateNote);
router.delete("/notes/:id", NoteController.deleteNote);

// Habits
import { HabitController } from "../controllers/private/HabitController.js";
router.get("/habits", HabitController.getHabits);
router.get("/habits/stats", HabitController.getStats);
router.post("/habits", HabitController.createHabit);
router.delete("/habits/:id", HabitController.deleteHabit);
router.post("/habits/:id/toggle", HabitController.toggleToday);
router.post("/habits/:id/logs", HabitController.toggleLog);

// Cashflow
import { TransactionController } from "../controllers/private/TransactionController.js";
router.get("/cashflow", TransactionController.getAllTransactions);
router.post("/cashflow", TransactionController.createTransaction);
router.put("/cashflow/:id", TransactionController.updateTransaction);
router.delete("/cashflow/:id", TransactionController.deleteTransaction);

// Goals / OKR
import { GoalController } from "../controllers/private/GoalController.js";
router.get("/goals/stats", GoalController.getStats);
router.get("/goals", GoalController.getGoals);
router.post("/goals", GoalController.createGoal);
router.put("/goals/:id", GoalController.updateGoal);
router.delete("/goals/:id", GoalController.deleteGoal);
router.post("/goals/:id/archive", GoalController.archiveGoal);
router.post("/goals/:id/krs/:krId/toggle", GoalController.toggleKR);

export default router;
