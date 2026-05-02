import { pgTable, serial, text, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "member"]);
export const statusEnum = pgEnum("status", ["todo", "in_progress", "done"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  userId: integer("user_id").references(() => users.id),
  role: roleEnum("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: priorityEnum("priority").default("medium"),
  status: statusEnum("status").default("todo"),
  projectId: integer("project_id").references(() => projects.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// relations
export const usersRelations = relations(users, ({ many }) => ({
  projectMembers: many(projectMembers),
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ many, one }) => ({
  members: many(projectMembers),
  tasks: many(tasks),
  creator: one(users, { fields: [projects.createdBy], references: [users.id] }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignee: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  creator: one(users, { fields: [tasks.createdBy], references: [users.id] }),
}));
