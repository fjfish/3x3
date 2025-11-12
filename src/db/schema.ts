import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: integer("tier").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  notes: text("notes"),
  parentGoalId: uuid("parent_goal_id").references(() => goals.id, {
    onDelete: "set null",
  }),
  isPrimary: boolean("is_primary").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  goals: many(goals),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  parent: one(goals, {
    fields: [goals.parentGoalId],
    references: [goals.id],
    relationName: "goalHierarchy",
  }),
  children: many(goals, {
    relationName: "goalHierarchy",
  }),
}));

