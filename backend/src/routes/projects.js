import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { requireAdmin, requireMember } from "../middleware/role.js";
import {
  createProject,
  getMyProjects,
  getProject,
  addMember,
  removeMember,
  getAllUsers,
} from "../controllers/projectController.js";

const router = Router();

router.use(verifyToken);

router.get("/", getMyProjects);
router.post("/", createProject);
router.get("/users", getAllUsers);
router.get("/:projectId", requireMember, getProject);
router.post("/:projectId/members", requireAdmin, addMember);
router.delete("/:projectId/members/:userId", requireAdmin, removeMember);

export default router;
