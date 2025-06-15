import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const schema = defineSchema({
  ...authTables,

  chats: defineTable({
    userId: v.id("users"),
    chatId: v.string(),

    title: v.string(),

    pinned: v.boolean()
  })
    .index("by_userId", ["userId"])
    .index("by_chatId_and_userId", ["chatId", "userId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),

    role: v.union(v.literal("user"), v.literal("assistant")),

    reasoning: v.optional(v.string()),
    content: v.string(),

    options: v.object({
      modelId: v.string(),
      reasoningEffort: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high")))
    })
  }).index("by_chatId_and_userId", ["chatId", "userId"])
})

export default schema
