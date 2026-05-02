import { db } from "../db/index.js";
import { tasks, users } from "../db/schema.js";
import { eq, and, lt } from "drizzle-orm";

export async function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description, dueDate, priority, assignedTo } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const task = await db.insert(tasks).values({
    title,
    description,
    dueDate: dueDate ? new Date(dueDate) : null,
    priority: priority || "medium",
    status: "todo",
    projectId: parseInt(projectId),
    assignedTo: assignedTo || null,
    createdBy: req.user.id,
  }).returning();

  res.status(201).json(task[0]);
}

export async function getProjectTasks(req, res) {
  const { projectId } = req.params;

  const projectTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      priority: tasks.priority,
      status: tasks.status,
      createdAt: tasks.createdAt,
      assigneeName: users.name,
      assigneeId: users.id,
    })
    .from(tasks)
    .where(eq(tasks.projectId, parseInt(projectId)))
    .leftJoin(users, eq(users.id, tasks.assignedTo));

  res.json(projectTasks);
}

export async function updateTask(req, res) {
  const { taskId } = req.params;
  const { title, description, dueDate, priority, status, assignedTo } = req.body;

  const task = await db.select().from(tasks).where(eq(tasks.id, parseInt(taskId))).then(r => r[0]);
  if (!task) return res.status(404).json({ error: "Task not found" });

  // members can only update status of their assigned tasks
  if (req.membership.role === "member" && task.assignedTo !== req.user.id) {
    return res.status(403).json({ error: "You can only update your own tasks" });
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = new Date(dueDate);
  if (priority !== undefined) updates.priority = priority;
  if (status !== undefined) updates.status = status;
  if (assignedTo !== undefined && req.membership.role === "admin") updates.assignedTo = assignedTo;

  const updated = await db.update(tasks).set(updates).where(eq(tasks.id, parseInt(taskId))).returning();
  res.json(updated[0]);
}

export async function deleteTask(req, res) {
  const { taskId } = req.params;
  await db.delete(tasks).where(eq(tasks.id, parseInt(taskId)));
  res.json({ message: "Task deleted" });
}

export async function getDashboardStats(req, res) {
  // all tasks assigned to or created by this user across projects
  const myTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.assignedTo, req.user.id));

  const total = myTasks.length;
  const todo = myTasks.filter(t => t.status === "todo").length;
  const inProgress = myTasks.filter(t => t.status === "in_progress").length;
  const done = myTasks.filter(t => t.status === "done").length;
  const now = new Date();
  const overdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length;

  res.json({ total, todo, inProgress, done, overdue });
}
