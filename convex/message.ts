import { v } from "convex/values"

import { authedMutation, safeAuthedQuery } from "./_utils"
import { UIMessage } from "ai"

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

export const getMessages = safeAuthedQuery({
  args: {
    chatId: v.string()
  },
  handler: async (ctx, args) => {
    if (!ctx.user._id) return { messages: [] }

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId_and_userId", (q) =>
        q.eq("chatId", args.chatId).eq("userId", ctx.user._id!)
      )
      .unique()

    if (!chat) return { messages: [] }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_userId", (q) =>
        q.eq("chatId", chat._id).eq("userId", ctx.user._id!)
      )
      .collect()

    return {
      messages: messages.map((message) => {
        const parts: UIMessage["parts"] = []

        if (message.reasoning)
          parts.push({
            type: "reasoning",
            reasoning: message.reasoning,
            details: []
          })

        return {
          id: message._id,
          role: message.role,
          content: message.content,
          parts: [
            ...parts,
            {
              type: "text",
              text: message.content
            }
          ],
          annotations: [{ model: message.options.modelId }]
        }
      }) satisfies UIMessage[]
    }
  }
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
