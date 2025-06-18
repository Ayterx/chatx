import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const schema = defineSchema({
  ...authTables,

  chats: defineTable({
    userId: v.id("users"),
    chatId: v.string(),

    title: v.string(),

    pinned: v.boolean(),

    parentChatId: v.optional(v.id("chats"))
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
  }).index("by_chatId_and_userId", ["chatId", "userId"]),

  chatShares: defineTable({
    messageId: v.id("messages"),
    ownerId: v.id("users"),
    title: v.string(),
    validFor: v.number(),

    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        reasoning: v.optional(v.string()),
        content: v.string(),
        options: v.object({
          modelId: v.string(),
          reasoningEffort: v.optional(
            v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
          )
        })
      })
    )
  }).index("by_ownerId_and_messageId", ["ownerId", "messageId"])
})

export default schema
