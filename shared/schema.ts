import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const logs = pgTable("logs", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  level: text("level").notNull(), // ERROR, WARN, INFO, etc.
  message: text("message").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLogSchema = createInsertSchema(logs).pick({
  timestamp: true,
  level: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type LogEntry = typeof logs.$inferSelect;

// Additional types for log analytics
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'EXCEPTION';

export type LogStats = {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  errorRate: number;
};

export type TimeSeriesData = {
  timestamp: string;
  error: number;
  warn: number;
  info: number;
  total: number;
};
