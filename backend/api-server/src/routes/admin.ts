import { Router } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { sql, desc, eq } from "drizzle-orm";
import { db, portfolioSections, contactMessages, resumeFile, projectImages } from "@workspace/db";
import { requireAdmin } from "../lib/auth.js";
import {
  AdminLoginBody,
  GetAdminSectionParams,
  UpdateAdminSectionBody,
  UpdateAdminSectionParams,
  DeleteAdminMessageParams,
} from "@workspace/api-zod";
import {
  profile,
  experiences,
  certifications,
  skills,
  projects,
  education,
} from "../data/portfolio.js";
import multer from "multer";

// ─── Multer: memory storage (works in serverless / no persistent disk) ─────────
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Multer: project preview images (screenshots / illustrations) ──────────────
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error("Only PNG, JPEG, WEBP, GIF, or SVG images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const VALID_SECTIONS = [
  "profile",
  "experience",
  "certifications",
  "skills",
  "projects",
  "education",
] as const;
type Section = (typeof VALID_SECTIONS)[number];

const STATIC_DATA: Record<Section, unknown> = {
  profile,
  experience: experiences,
  certifications,
  skills,
  projects,
  education,
};

async function getOrSeedSection(section: Section): Promise<{ data: unknown; updatedAt: Date }> {
  const rows = await db
    .select()
    .from(portfolioSections)
    .where(eq(portfolioSections.section, section));

  if (rows.length > 0) {
    return { data: rows[0].data, updatedAt: rows[0].updatedAt };
  }

  const now = new Date();
  await db
    .insert(portfolioSections)
    .values({ section, data: STATIC_DATA[section] as Record<string, unknown> })
    .onConflictDoNothing();

  return { data: STATIC_DATA[section], updatedAt: now };
}

const router = Router();

// POST /api/admin/login
router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { username, password } = parsed.data;
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!expectedUsername || !expectedPassword || !secret) {
    res.status(500).json({ error: "Admin credentials not configured on server" });
    return;
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const token = jwt.sign({ username }, secret, { expiresIn: "24h" });

  res.json({ token, expiresAt: expiresAt.toISOString() });
});

// GET /api/admin/stats
router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [countResult, lastMsgResult, sectionRows] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(contactMessages),
    db
      .select({ createdAt: contactMessages.createdAt })
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(1),
    db
      .select({ section: portfolioSections.section, updatedAt: portfolioSections.updatedAt })
      .from(portfolioSections),
  ]);

  res.json({
    totalMessages: countResult[0]?.count ?? 0,
    lastMessageAt: lastMsgResult[0]?.createdAt?.toISOString() ?? null,
    sections: sectionRows.map((s) => ({
      section: s.section,
      updatedAt: s.updatedAt.toISOString(),
    })),
  });
});

// GET /api/admin/sections/:section
router.get("/admin/sections/:section", requireAdmin, async (req, res) => {
  const parsed = GetAdminSectionParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid section" });
    return;
  }

  const section = parsed.data.section as Section;
  if (!VALID_SECTIONS.includes(section)) {
    res.status(404).json({ error: `Unknown section: ${section}` });
    return;
  }

  const { data, updatedAt } = await getOrSeedSection(section);
  res.json({ section, data, updatedAt: updatedAt.toISOString() });
});

// PUT /api/admin/sections/:section
router.put("/admin/sections/:section", requireAdmin, async (req, res) => {
  const paramsParsed = UpdateAdminSectionParams.safeParse(req.params);
  const bodyParsed = UpdateAdminSectionBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const section = paramsParsed.data.section as Section;
  if (!VALID_SECTIONS.includes(section)) {
    res.status(404).json({ error: `Unknown section: ${section}` });
    return;
  }

  const now = new Date();
  await db
    .insert(portfolioSections)
    .values({
      section,
      data: bodyParsed.data.data as Record<string, unknown>,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: portfolioSections.section,
      set: { data: bodyParsed.data.data as Record<string, unknown>, updatedAt: now },
    });

  res.json({ section, data: bodyParsed.data.data, updatedAt: now.toISOString() });
});

// GET /api/admin/messages
router.get("/admin/messages", requireAdmin, async (_req, res) => {
  const msgs = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  res.json(
    msgs.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
    })),
  );
});

// DELETE /api/admin/messages/:id
router.delete("/admin/messages/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteAdminMessageParams.safeParse({
    id: Number(req.params.id),
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const result = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, parsed.data.id))
    .returning({ id: contactMessages.id });

  if (result.length === 0) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  res.json({ success: true });
});

// ─── Resume routes (stored in DB as base64) ────────────────────────────────────

// GET /api/admin/resume/status
router.get("/admin/resume/status", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(resumeFile).where(eq(resumeFile.id, 1));
  if (rows.length === 0) {
    res.json({ exists: false, uploadedAt: null, size: null });
    return;
  }
  res.json({
    exists: true,
    uploadedAt: rows[0].uploadedAt.toISOString(),
    size: rows[0].size,
  });
});

// POST /api/admin/resume
router.post("/admin/resume", requireAdmin, (req, res) => {
  upload.single("resume")(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const content = req.file.buffer.toString("base64");
    const now = new Date();

    await db
      .insert(resumeFile)
      .values({ id: 1, content, size: req.file.size, uploadedAt: now })
      .onConflictDoUpdate({
        target: resumeFile.id,
        set: { content, size: req.file.size, uploadedAt: now },
      });

    res.json({ success: true, size: req.file.size, uploadedAt: now.toISOString() });
  });
});

// DELETE /api/admin/resume
router.delete("/admin/resume", requireAdmin, async (_req, res) => {
  const result = await db
    .delete(resumeFile)
    .where(eq(resumeFile.id, 1))
    .returning({ id: resumeFile.id });

  if (result.length === 0) {
    res.status(404).json({ error: "No resume to delete" });
    return;
  }
  res.json({ success: true });
});

// ─── Project preview images (stored in DB as base64) ───────────────────────────

// POST /api/admin/project-images
router.post("/admin/project-images", requireAdmin, (req, res) => {
  uploadImage.single("image")(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const id = randomUUID();
    const content = req.file.buffer.toString("base64");
    const now = new Date();

    await db.insert(projectImages).values({
      id,
      content,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: now,
    });

    res.json({
      id,
      url: `/api/portfolio/project-images/${id}`,
      size: req.file.size,
      uploadedAt: now.toISOString(),
    });
  });
});

// DELETE /api/admin/project-images/:id
router.delete("/admin/project-images/:id", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const result = await db
    .delete(projectImages)
    .where(eq(projectImages.id, id))
    .returning({ id: projectImages.id });

  if (result.length === 0) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
