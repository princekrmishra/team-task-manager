import { db } from "../db/index.js";
import { projects, projectMembers, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export async function createProject(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Project name required" });

  const project = await db.insert(projects).values({
    name,
    description,
    createdBy: req.user.id,
  }).returning();

  // creator becomes admin automatically
  await db.insert(projectMembers).values({
    projectId: project[0].id,
    userId: req.user.id,
    role: "admin",
  });

  res.status(201).json(project[0]);
}

export async function getMyProjects(req, res) {
  const myMemberships = await db
    .select({
      projectId: projectMembers.projectId,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .where(eq(projectMembers.userId, req.user.id));

  if (myMemberships.length === 0) return res.json([]);

  const ids = myMemberships.map((m) => m.projectId);

  const result = [];
  for (const id of ids) {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .then((r) => r[0]);
    if (project) {
      const role = myMemberships.find((m) => m.projectId === id)?.role;
      result.push({ ...project, myRole: role });
    }
  }

  res.json(result);
}

export async function getProject(req, res) {
  const { projectId } = req.params;
  const project = await db.select().from(projects).where(eq(projects.id, parseInt(projectId))).then(r => r[0]);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const members = await db
    .select({ id: users.id, name: users.name, email: users.email, role: projectMembers.role })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, parseInt(projectId)))
    .innerJoin(users, eq(users.id, projectMembers.userId));

  res.json({ ...project, members });
}

export async function addMember(req, res) {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  if (!userId) return res.status(400).json({ error: "userId required" });

  const existing = await db
    .select()
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, parseInt(projectId)), eq(projectMembers.userId, userId)))
    .then(r => r[0]);

  if (existing) return res.status(400).json({ error: "User already in project" });

  const member = await db.insert(projectMembers).values({
    projectId: parseInt(projectId),
    userId,
    role: role || "member",
  }).returning();

  res.status(201).json(member[0]);
}

export async function removeMember(req, res) {
  const { projectId, userId } = req.params;

  await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, parseInt(projectId)), eq(projectMembers.userId, parseInt(userId))));

  res.json({ message: "Member removed" });
}

export async function getAllUsers(req, res) {
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
  res.json(allUsers);
}
