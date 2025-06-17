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
      chatId: chat.chatId,
      createdAt: chat._creationTime,
      docId: chat._id,
      parentChatId: chat.parentChatId,
      pinned: chat.pinned,
      title: chat.title
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

export const branchOff = authedMutation({
  args: {
    chatId: v.string(),
    messageIndex: v.number()
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId_and_userId", (q) =>
        q.eq("chatId", args.chatId).eq("userId", ctx.user._id)
      )
      .unique()

    if (!chat || chat.userId !== ctx.user._id) return

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_userId", (q) => q.eq("chatId", chat._id).eq("userId", ctx.user._id))
      .collect()

    const slicedMessages = messages.slice(0, args.messageIndex + 1)

    const newChatId = crypto.randomUUID()
    const newId = await ctx.db.insert("chats", {
      chatId: newChatId,
      userId: ctx.user._id,
      title: chat.title,
      pinned: false,
      parentChatId: chat._id
    })

    for (const message of slicedMessages) {
      await ctx.db.insert("messages", {
        chatId: newId,
        userId: ctx.user._id,
        role: message.role,
        reasoning: message.reasoning,
        content: message.content,
        options: message.options
      })
    }

    return {
      chatId: newChatId
    }
  }
})

export const togglePin = authedMutation({
  args: {
    id: v.id("chats")
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.id)

    if (!chat || chat.userId !== ctx.user._id) return

    await ctx.db.patch(args.id, { pinned: !chat.pinned })
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

export const deleteChat = authedMutation({
  args: {
    id: v.id("chats")
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.id)

    if (!chat || chat.userId !== ctx.user._id) return

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_userId", (q) => q.eq("chatId", args.id).eq("userId", ctx.user._id!))
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }
    await ctx.db.delete(args.id)
  }
})
