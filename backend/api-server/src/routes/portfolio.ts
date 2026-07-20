import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, portfolioSections, contactMessages, resumeFile, projectImages } from "@workspace/db";
import { SendContactMessageBody } from "@workspace/api-zod";
import { normalizeSectionData } from "../lib/normalize-section.js";
import {
  profile,
  experiences,
  certifications,
  skills,
  projects,
  education,
} from "../data/portfolio.js";

const router = Router();

// ─── Helper: get from DB, seed from static on first access ────────────────────

async function getSection(section: string, fallback: unknown): Promise<unknown> {
  const rows = await db
    .select()
    .from(portfolioSections)
    .where(eq(portfolioSections.section, section));

  if (rows.length > 0) return normalizeSectionData(section, rows[0].data);

  await db
    .insert(portfolioSections)
    .values({ section, data: fallback as Record<string, unknown> })
    .onConflictDoNothing();

  return fallback;
}

// GET /api/portfolio/profile
router.get("/portfolio/profile", async (_req, res) => {
  res.json(await getSection("profile", profile));
});

// GET /api/portfolio/experience
router.get("/portfolio/experience", async (_req, res) => {
  res.json(await getSection("experience", experiences));
});

// GET /api/portfolio/certifications
router.get("/portfolio/certifications", async (_req, res) => {
  res.json(await getSection("certifications", certifications));
});

// GET /api/portfolio/skills
router.get("/portfolio/skills", async (_req, res) => {
  res.json(await getSection("skills", skills));
});

// GET /api/portfolio/projects
router.get("/portfolio/projects", async (_req, res) => {
  res.json(await getSection("projects", projects));
});

// GET /api/portfolio/education
router.get("/portfolio/education", async (_req, res) => {
  res.json(await getSection("education", education));
});

// GET /api/portfolio/resume — serves the resume PDF stored in the DB
router.get("/portfolio/resume", async (_req, res) => {
  const rows = await db.select().from(resumeFile).where(eq(resumeFile.id, 1));
  if (rows.length === 0) {
    res.status(404).json({ error: "No resume available" });
    return;
  }
  const buffer = Buffer.from(rows[0].content, "base64");
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", 'attachment; filename="resume.pdf"');
  res.set("Content-Length", String(buffer.length));
  res.send(buffer);
});

// GET /api/portfolio/project-images/:id — serves an uploaded project screenshot
router.get("/portfolio/project-images/:id", async (req, res) => {
  const id = String(req.params.id);
  const rows = await db
    .select()
    .from(projectImages)
    .where(eq(projectImages.id, id));
  if (rows.length === 0) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  const buffer = Buffer.from(rows[0].content, "base64");
  res.set("Content-Type", rows[0].contentType);
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.set("Content-Length", String(buffer.length));
  res.send(buffer);
});

// POST /api/portfolio/contact
router.post("/portfolio/contact", async (req, res) => {
  const parsed = SendContactMessageBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { name, email, message } = parsed.data;

  if (!email.includes("@")) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  await db.insert(contactMessages).values({ name, email, message });

  res.json({ success: true });
});

export default router;
