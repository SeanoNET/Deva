import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    linearUserId: v.optional(v.string()),
    linearAccessToken: v.optional(v.string()),
    preferences: v.optional(v.object({
      defaultTeam: v.optional(v.string()),
      defaultPriority: v.string(),
      defaultLabels: v.array(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  issueHistory: defineTable({
    userId: v.id("users"),
    originalInput: v.string(),
    workType: v.union(
      v.literal("bug"),
      v.literal("documentation"),
      v.literal("testing"),
      v.literal("feature"),
      v.literal("infrastructure"),
      v.literal("research")
    ),
    finalIssue: v.object({
      title: v.string(),
      description: v.string(),
      priority: v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      ),
      team: v.optional(v.string()),
      assignee: v.optional(v.string()),
      labels: v.array(v.string()),
      linearIssueId: v.optional(v.string()),
      linearIssueUrl: v.optional(v.string()),
    }),
    corrections: v.array(v.object({
      field: v.string(),
      originalValue: v.string(),
      correctedValue: v.string(),
      timestamp: v.number(),
    })),
    confidence: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),

  conversations: defineTable({
    userId: v.id("users"),
    messages: v.array(v.object({
      id: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
      issuePreview: v.optional(v.object({
        title: v.string(),
        description: v.string(),
        workType: v.string(),
        priority: v.string(),
        confidence: v.number(),
      })),
    })),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_updated", ["updatedAt"]),

  teamPatterns: defineTable({
    userId: v.id("users"),
    pattern: v.string(),
    team: v.string(),
    frequency: v.number(),
    lastUsed: v.number(),
  }).index("by_user", ["userId"]),
});