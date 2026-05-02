import { db } from "../db/index.js";
import { projectMembers } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

export async function requireAdmin(req, res, next) {
  const projectId = parseInt(req.params.projectId || req.body.projectId);
  if (!projectId) return res.status(400).json({ error: "Project ID required" });

  const member = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, req.user.id)
      )
    )
    .then((r) => r[0]);

  if (!member || member.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  req.membership = member;
  next();
}

export async function requireMember(req, res, next) {
  const projectId = parseInt(req.params.projectId || req.body.projectId);
  if (!projectId) return res.status(400).json({ error: "Project ID required" });

  const member = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, req.user.id)
      )
    )
    .then((r) => r[0]);

  if (!member) {
    return res.status(403).json({ error: "Not a member of this project" });
  }

  req.membership = member;
  next();
}
