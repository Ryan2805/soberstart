import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase server auth environment variables");
}

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ---------- Helpers ----------
async function syncAppUser(supabaseUser) {
  const email = supabaseUser.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Authenticated Supabase user is missing an email");
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseAuthId: supabaseUser.id }, { email }],
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email,
        supabaseAuthId: supabaseUser.id,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      supabaseAuthId: supabaseUser.id,
    },
  });
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid/expired token" });
    }

    const user = await syncAppUser(data.user);
    req.user = { id: user.id, email: user.email, supabaseAuthId: data.user.id };
    next();
  } catch (error) {
    console.error("Auth middleware failed", error);
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

// ---------- Validation ----------
const journalCreateSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(5000),
 
  entryDate: z.string().datetime().optional()
});

const checkInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.number().int().min(0).max(10),
  craving: z.number().int().min(0).max(10),
  stress: z.number().int().min(0).max(10),
  note: z.string().trim().max(1000).optional().or(z.literal(""))
});

const toolUseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional().or(z.literal(""))
});

const urgeLogSchema = z.object({
  intensity: z.number().int().min(0).max(10),
  trigger: z.string().trim().min(1).max(140),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  toolUsed: z.string().trim().max(120).optional().or(z.literal("")),
  occurredAt: z.string().datetime().optional()
});

function startOfDayUtc(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

//Routes
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
app.all("/auth/register", (_, res) => {
  res.status(410).json({ error: "Registration now happens via Supabase Auth in the mobile app." });
});

app.all("/auth/login", (_, res) => {
  res.status(410).json({ error: "Login now happens via Supabase Auth in the mobile app." });
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

  const result = await prisma.journalEntry.deleteMany({
    where: { id, userId: req.user.id },
  });
  if (result.count === 0) return res.status(404).json({ error: "Not found" });

  res.status(204).send();
});

app.get("/check-ins", authMiddleware, async (req, res) => {
  const items = await prisma.checkIn.findMany({
    where: { userId: req.user.id },
    orderBy: { date: "desc" }
  });

  res.json(items);
});

app.post("/check-ins", authMiddleware, async (req, res) => {
  const parsed = checkInSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { date, mood, craving, stress, note } = parsed.data;
  const day = startOfDayUtc(date);

  const saved = await prisma.checkIn.upsert({
    where: {
      userId_date: {
        userId: req.user.id,
        date: day
      }
    },
    update: {
      mood,
      craving,
      stress,
      note: note || null
    },
    create: {
      userId: req.user.id,
      date: day,
      mood,
      craving,
      stress,
      note: note || null
    }
  });

  res.status(201).json(saved);
});

app.get("/tool-uses", authMiddleware, async (req, res) => {
  const items = await prisma.toolUse.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  res.json(items);
});

app.post("/tool-uses", authMiddleware, async (req, res) => {
  const parsed = toolUseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const saved = await prisma.toolUse.create({
    data: {
      userId: req.user.id,
      name: parsed.data.name,
      notes: parsed.data.notes || null
    }
  });

  res.status(201).json(saved);
});

app.get("/urge-logs", authMiddleware, async (req, res) => {
  const items = await prisma.urgeLog.findMany({
    where: { userId: req.user.id },
    orderBy: { occurredAt: "desc" },
    take: 50
  });

  res.json(items);
});

app.post("/urge-logs", authMiddleware, async (req, res) => {
  const parsed = urgeLogSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const saved = await prisma.urgeLog.create({
    data: {
      userId: req.user.id,
      intensity: parsed.data.intensity,
      trigger: parsed.data.trigger,
      notes: parsed.data.notes || null,
      toolUsed: parsed.data.toolUsed || null,
      occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date()
    }
  });

  res.status(201).json(saved);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
