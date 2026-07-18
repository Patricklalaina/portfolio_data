import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const projectImages = pgTable("project_images", {
  id: text("id").primaryKey(), // uuid
  content: text("content").notNull(), // base64-encoded image bytes
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
