import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const runtimeDatabaseUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!runtimeDatabaseUrl) {
  throw new Error("Missing database connection string");
}

const sslMode = process.env.PGSSLMODE?.trim().toLowerCase();
const rejectUnauthorized =
  process.env.DATABASE_TLS_REJECT_UNAUTHORIZED?.trim().toLowerCase() !==
  "false";
let normalizedDatabaseUrl = runtimeDatabaseUrl;
const adapterConfig = {};

if (sslMode === "no-verify") {
  if (/[?&]sslmode=/i.test(normalizedDatabaseUrl)) {
    normalizedDatabaseUrl = normalizedDatabaseUrl.replace(
      /([?&]sslmode=)([^&]+)/i,
      "$1no-verify",
    );
  } else {
    normalizedDatabaseUrl += `${normalizedDatabaseUrl.includes("?") ? "&" : "?"}sslmode=no-verify`;
  }
}

adapterConfig.connectionString = normalizedDatabaseUrl;

if (sslMode === "no-verify" || !rejectUnauthorized) {
  adapterConfig.ssl = { rejectUnauthorized: false };
}

const adapter = new PrismaPg(adapterConfig);
const prisma = new PrismaClient({ adapter });
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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
const riskApiUrl = process.env.AWS_RISK_API_URL;
const riskApiKey = process.env.AWS_RISK_API_KEY;

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

  entryDate: z.string().datetime().optional(),
});

const checkInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.number().int().min(0).max(10),
  craving: z.number().int().min(0).max(10),
  stress: z.number().int().min(0).max(10),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

const toolUseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

const urgeLogSchema = z.object({
  intensity: z.number().int().min(0).max(10),
  trigger: z.string().trim().min(1).max(140),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  toolUsed: z.string().trim().max(120).optional().or(z.literal("")),
  occurredAt: z.string().datetime().optional(),
});

const communityPostSchema = z.object({
  body: z.string().trim().min(1).max(1000),
  imageUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  imageBucket: z.string().trim().max(120).optional().or(z.literal("")),
  imagePath: z.string().trim().max(1000).optional().or(z.literal("")),
  badgeId: z.string().trim().max(80).optional().or(z.literal("")),
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(500),
});

function startOfDayUtc(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function displayNameFromEmail(email) {
  return email?.split("@")[0] || "Community member";
}

function formatCommunityPost(post, currentUserId) {
  const likedByMe = post.likes?.some((like) => like.userId === currentUserId);

  return {
    id: post.id,
    body: post.body,
    imageUrl: post.imageUrl,
    imageBucket: post.imageBucket,
    imagePath: post.imagePath,
    badgeId: post.badgeId,
    createdAt: post.createdAt,
    author: {
      id: post.user.id,
      displayName: displayNameFromEmail(post.user.email),
    },
    likeCount: post._count?.likes ?? post.likes?.length ?? 0,
    commentCount: post._count?.comments ?? post.comments?.length ?? 0,
    likedByMe: Boolean(likedByMe),
  };
}

function formatComment(comment) {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    author: {
      id: comment.user.id,
      displayName: displayNameFromEmail(comment.user.email),
    },
  };
}

function localRiskAssessment(checkIns, urgeLogs, toolUses) {
  const recentCheckIns = checkIns.slice(0, 7);
  const avg = (items) =>
    items.length === 0
      ? 0
      : items.reduce((sum, value) => sum + value, 0) / items.length;

  const cravingAvg = avg(recentCheckIns.map((item) => Number(item.craving)));
  const stressAvg = avg(recentCheckIns.map((item) => Number(item.stress)));
  const moodAvg = avg(recentCheckIns.map((item) => Number(item.mood)));
  const recentUrges = urgeLogs.slice(0, 10);
  const urgeAvg = avg(recentUrges.map((item) => Number(item.intensity)));
  const highUrgeCount = recentUrges.filter(
    (item) => Number(item.intensity) >= 7,
  ).length;
  const toolUseCredit = Math.min(toolUses.length, 5) * 2;

  let riskScore =
    cravingAvg * 4 +
    stressAvg * 3 +
    urgeAvg * 2 +
    highUrgeCount * 5 -
    toolUseCredit;

  if (moodAvg > 0 && moodAvg < 4) {
    riskScore += 8;
  }

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  const riskLevel =
    riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

  return { riskScore, riskLevel };
}

async function calculateCloudRisk(payload) {
  if (!riskApiUrl || !riskApiKey) {
    const fallback = localRiskAssessment(
      payload.checkIns,
      payload.urgeLogs,
      payload.toolUses,
    );

    return {
      ...fallback,
      reasons: ["Cloud risk scoring is not configured for this environment."],
      suggestedAction: "Keep using check-ins and support tools to track patterns.",
      source: "local",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(riskApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": riskApiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.error ?? `Risk API failed (${response.status})`);
    }

    return {
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      reasons: Array.isArray(data.reasons) ? data.reasons : [],
      suggestedAction: data.suggestedAction,
      source: "aws-lambda",
    };
  } finally {
    clearTimeout(timeout);
  }
}

//Routes
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
app.all("/auth/register", (_, res) => {
  res
    .status(410)
    .json({
      error: "Registration now happens via Supabase Auth in the mobile app.",
    });
});

app.all("/auth/login", (_, res) => {
  res
    .status(410)
    .json({ error: "Login now happens via Supabase Auth in the mobile app." });
});

//journal entry
app.post("/journal", authMiddleware, async (req, res) => {
  const parsed = journalCreateSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { title, content, entryDate } = parsed.data;

  const created = await prisma.journalEntry.create({
    data: {
      userId: req.user.id,
      title,
      content,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    },
  });

  res.status(201).json(created);
});

app.get("/journal", authMiddleware, async (req, res) => {
  const items = await prisma.journalEntry.findMany({
    where: { userId: req.user.id },
    orderBy: { entryDate: "desc" },
  });

  res.json(items);
});

app.put("/journal/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  const schema = z.object({
    title: z.string().min(1).max(120).optional(),
    content: z.string().min(1).max(5000).optional(),
    entryDate: z.string().datetime().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      ...("title" in parsed.data ? { title: parsed.data.title } : {}),
      ...("content" in parsed.data ? { content: parsed.data.content } : {}),
      ...("entryDate" in parsed.data
        ? { entryDate: new Date(parsed.data.entryDate) }
        : {}),
    },
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
    orderBy: { date: "desc" },
  });

  res.json(items);
});

app.post("/check-ins", authMiddleware, async (req, res) => {
  const parsed = checkInSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { date, mood, craving, stress, note } = parsed.data;
  const day = startOfDayUtc(date);

  const saved = await prisma.checkIn.upsert({
    where: {
      userId_date: {
        userId: req.user.id,
        date: day,
      },
    },
    update: {
      mood,
      craving,
      stress,
      note: note || null,
    },
    create: {
      userId: req.user.id,
      date: day,
      mood,
      craving,
      stress,
      note: note || null,
    },
  });

  res.status(201).json(saved);
});

app.get("/risk-assessment", authMiddleware, async (req, res) => {
  try {
    const [checkIns, urgeLogs, toolUses] = await Promise.all([
      prisma.checkIn.findMany({
        where: { userId: req.user.id },
        orderBy: { date: "desc" },
        take: 7,
      }),
      prisma.urgeLog.findMany({
        where: { userId: req.user.id },
        orderBy: { occurredAt: "desc" },
        take: 10,
      }),
      prisma.toolUse.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const payload = {
      checkIns: checkIns.map((item) => ({
        date: toDateOnly(item.date),
        mood: item.mood,
        craving: item.craving,
        stress: item.stress,
      })),
      urgeLogs: urgeLogs.map((item) => ({
        intensity: item.intensity,
        trigger: item.trigger,
        toolUsed: item.toolUsed,
        occurredAt: item.occurredAt.toISOString(),
      })),
      toolUses: toolUses.map((item) => ({
        name: item.name,
        createdAt: item.createdAt.toISOString(),
      })),
    };

    const assessment = await calculateCloudRisk(payload);
    res.json(assessment);
  } catch (error) {
    console.error("Risk assessment failed", error);
    res.status(502).json({ error: "Could not calculate risk assessment" });
  }
});

app.get("/community/posts", authMiddleware, async (req, res) => {
  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, email: true } },
      likes: { where: { userId: req.user.id }, select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  res.json(posts.map((post) => formatCommunityPost(post, req.user.id)));
});

app.post("/community/posts", authMiddleware, async (req, res) => {
  const parsed = communityPostSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const created = await prisma.communityPost.create({
    data: {
      userId: req.user.id,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl || null,
      imageBucket: parsed.data.imageBucket || null,
      imagePath: parsed.data.imagePath || null,
      badgeId: parsed.data.badgeId || null,
    },
    include: {
      user: { select: { id: true, email: true } },
      likes: { where: { userId: req.user.id }, select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  res.status(201).json(formatCommunityPost(created, req.user.id));
});

app.post("/community/posts/:id/like", authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: "Not found" });

  await prisma.postLike.upsert({
    where: {
      postId_userId: {
        postId,
        userId: req.user.id,
      },
    },
    update: {},
    create: {
      postId,
      userId: req.user.id,
    },
  });

  res.status(204).send();
});

app.delete("/community/posts/:id/like", authMiddleware, async (req, res) => {
  await prisma.postLike.deleteMany({
    where: {
      postId: req.params.id,
      userId: req.user.id,
    },
  });

  res.status(204).send();
});

app.get("/community/posts/:id/comments", authMiddleware, async (req, res) => {
  const comments = await prisma.postComment.findMany({
    where: { postId: req.params.id },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  res.json(comments.map(formatComment));
});

app.post("/community/posts/:id/comments", authMiddleware, async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const post = await prisma.communityPost.findUnique({
    where: { id: req.params.id },
  });
  if (!post) return res.status(404).json({ error: "Not found" });

  const created = await prisma.postComment.create({
    data: {
      postId: req.params.id,
      userId: req.user.id,
      body: parsed.data.body,
    },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  res.status(201).json(formatComment(created));
});

app.get("/tool-uses", authMiddleware, async (req, res) => {
  const items = await prisma.toolUse.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(items);
});

app.post("/tool-uses", authMiddleware, async (req, res) => {
  const parsed = toolUseSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const saved = await prisma.toolUse.create({
    data: {
      userId: req.user.id,
      name: parsed.data.name,
      notes: parsed.data.notes || null,
    },
  });

  res.status(201).json(saved);
});

app.get("/urge-logs", authMiddleware, async (req, res) => {
  const items = await prisma.urgeLog.findMany({
    where: { userId: req.user.id },
    orderBy: { occurredAt: "desc" },
    take: 50,
  });

  res.json(items);
});

app.post("/urge-logs", authMiddleware, async (req, res) => {
  const parsed = urgeLogSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const saved = await prisma.urgeLog.create({
    data: {
      userId: req.user.id,
      intensity: parsed.data.intensity,
      trigger: parsed.data.trigger,
      notes: parsed.data.notes || null,
      toolUsed: parsed.data.toolUsed || null,
      occurredAt: parsed.data.occurredAt
        ? new Date(parsed.data.occurredAt)
        : new Date(),
    },
  });

  res.status(201).json(saved);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
