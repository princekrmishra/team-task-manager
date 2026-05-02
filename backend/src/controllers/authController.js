import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).then(r => r[0]);
  if (existing) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await db.insert(users).values({ name, email, password: hashed }).returning();

  const token = jwt.sign(
    { id: newUser[0].id, email: newUser[0].email, name: newUser[0].name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ token, user: { id: newUser[0].id, name: newUser[0].name, email: newUser[0].email } });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = await db.select().from(users).where(eq(users.email, email)).then(r => r[0]);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function getMe(req, res) {
  const user = await db.select().from(users).where(eq(users.id, req.user.id)).then(r => r[0]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email });
}
