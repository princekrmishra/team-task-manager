import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { requireAdmin, requireMember } from "../middleware/role.js";
import {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} from "../controllers/taskController.js";

const router = Router();

router.use(verifyToken);

router.get("/dashboard", getDashboardStats);
router.get("/:projectId", requireMember, getProjectTasks);
router.post("/:projectId", requireMember, createTask);
router.put("/:projectId/:taskId", requireMember, updateTask);
router.delete("/:projectId/:taskId", requireAdmin, deleteTask);

export default router;
