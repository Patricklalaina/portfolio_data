import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const resumeFile = pgTable("resume_file", {
  id: integer("id").primaryKey(),
  content: text("content").notNull(), // base64-encoded PDF
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
