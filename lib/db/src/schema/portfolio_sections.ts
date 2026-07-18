import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const portfolioSections = pgTable("portfolio_sections", {
  section: text("section").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
