import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// ---------- Helpers ----------
function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

// ---------- Validation ----------
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const journalCreateSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(5000),
 
  entryDate: z.string().datetime().optional()
});

//Routes
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
// Register
app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12); 

  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true }
  });

  const token = signToken(user);
  res.status(201).json({ user, token });
});

// Login
app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({ user: { id: user.id, email: user.email }, token });
});

//journal entry
app.post("/journal", authMiddleware, async (req, res) => {
  const parsed = journalCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { title, content, entryDate } = parsed.data;

  const created = await prisma.journalEntry.create({
    data: {
      userId: req.user.id,
      title,
      content,
      entryDate: entryDate ? new Date(entryDate) : new Date()
    }
  });

  res.status(201).json(created);
});


app.get("/journal", authMiddleware, async (req, res) => {
  const items = await prisma.journalEntry.findMany({
    where: { userId: req.user.id },
    orderBy: { entryDate: "desc" }
  });

  res.json(items);
});


app.put("/journal/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;


  const schema = z.object({
    title: z.string().min(1).max(120).optional(),
    content: z.string().min(1).max(5000).optional(),
    entryDate: z.string().datetime().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      ...("title" in parsed.data ? { title: parsed.data.title } : {}),
      ...("content" in parsed.data ? { content: parsed.data.content } : {}),
      ...("entryDate" in parsed.data ? { entryDate: new Date(parsed.data.entryDate) } : {})
    }
  });

  res.json(updated);
});

// Delete an entry
app.delete("/journal/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.journalEntry.delete({ where: { id } });
  res.status(204).send();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
