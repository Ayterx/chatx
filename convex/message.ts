import { v } from "convex/values"

import { authedMutation } from "./_utils"

export const create = authedMutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.string(),

    role: v.union(v.literal("user"), v.literal("assistant")),
    reasoning: v.optional(v.string()),
    content: v.string(),

    options: v.object({
      modelId: v.string(),
      reasoningEffort: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high")))
    })
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: ctx.user._id,

      role: args.role,
      reasoning: args.reasoning,
      content: args.content,

      options: {
        modelId: args.options.modelId,
        reasoningEffort: args.options.reasoningEffort
      }
    })
})

export const del = authedMutation({
  args: {
    messages: v.array(v.id("messages"))
  },
  handler: async (ctx, args) => {
    for (const id of args.messages) {
      const message = await ctx.db.get(id)

      if (!message) continue

      if (message.userId === ctx.user._id) await ctx.db.delete(id)
    }
  }
})
