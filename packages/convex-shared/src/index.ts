import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Export schema definition
export const schema = defineSchema({
  users: defineTable({
    email: v.string(),
    linearUserId: v.optional(v.string()),
    linearAccessToken: v.optional(v.string()),
    preferences: v.optional(v.object({
      defaultTeam: v.optional(v.string()),
      defaultPriority: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email']),

  issueHistory: defineTable({
    userId: v.id('users'),
    originalInput: v.string(),
    workType: v.string(),
    finalIssue: v.object({
      title: v.string(),
      description: v.string(),
      priority: v.string(),
      team: v.optional(v.string()),
      assignee: v.optional(v.string()),
      labels: v.array(v.string()),
    }),
    corrections: v.array(v.object({
      field: v.string(),
      originalValue: v.string(),
      correctedValue: v.string(),
      timestamp: v.number(),
    })),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  conversations: defineTable({
    userId: v.id('users'),
    messages: v.array(v.object({
      role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
      content: v.string(),
      timestamp: v.number(),
    })),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  teamPatterns: defineTable({
    userId: v.id('users'),
    pattern: v.string(),
    team: v.string(),
    frequency: v.number(),
    lastUsed: v.number(),
  }).index('by_user', ['userId']),
});

// Export common validators
export const validators = {
  workType: v.union(
    v.literal('bug'),
    v.literal('documentation'),
    v.literal('testing'),
    v.literal('feature'),
    v.literal('infrastructure'),
    v.literal('research')
  ),
  priority: v.union(
    v.literal('critical'),
    v.literal('high'),
    v.literal('medium'),
    v.literal('low')
  ),
  pattern: v.union(
    v.literal('quick-create'),
    v.literal('conversational')
  ),
};