import { v } from "convex/values"

import { authedMutation, safeAuthedQuery } from "./_utils"

export const getChats = safeAuthedQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user._id) return []

    const data = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id!))
      .take(200)

    return data.map((chat) => ({
      docId: chat._id,
      chatId: chat.chatId,
      title: chat.title,
      pinned: chat.pinned,
      createdAt: chat._creationTime
    }))
  }
})

export const getOrCreateChat = authedMutation({
  args: {
    chatId: v.string()
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_chatId_and_userId", (q) =>
        q.eq("chatId", args.chatId).eq("userId", ctx.user._id)
      )
      .unique()

    if (existingChat) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId_and_userId", (q) =>
          q.eq("chatId", existingChat._id).eq("userId", ctx.user._id)
        )
        .collect()

      return {
        docId: existingChat._id,
        isNewChat: false,
        messages: messages.map((message) => ({
          id: message._id,
          role: message.role,
          reasoning: message.reasoning,
          content: message.content
        }))
      }
    }
    const chatId = await ctx.db.insert("chats", {
      chatId: args.chatId,
      userId: ctx.user._id,

      title: "New Chat",

      pinned: false
    })

    return {
      docId: chatId,
      isNewChat: true,
      messages: []
    }
  }
})

export const updateTitle = authedMutation({
  args: {
    id: v.id("chats"),
    title: v.string()
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.id)

    if (!chat || chat.userId !== ctx.user._id) return

    await ctx.db.patch(args.id, { title: args.title })
  }
})
