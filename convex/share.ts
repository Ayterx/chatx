import { UIMessage } from "ai"
import { ConvexError, v } from "convex/values"

import { Id } from "./_generated/dataModel"
import { authedMutation, authedQuery } from "./_utils"

export const createShareLink = authedMutation({
  args: {
    chatId: v.string(),
    messageId: v.id("messages"),
    messageIndex: v.number(),
    validFor: v.number()
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId_and_userId", (q) =>
        q.eq("chatId", args.chatId).eq("userId", ctx.user._id)
      )
      .unique()

    if (!chat) throw new ConvexError("Chat not found")

    const shareLinkExist = await ctx.db
      .query("chatShares")
      .withIndex("by_ownerId_and_messageId", (q) =>
        q.eq("ownerId", ctx.user._id).eq("messageId", args.messageId)
      )
      .unique()

    if (shareLinkExist) return shareLinkExist._id

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_and_userId", (q) => q.eq("chatId", chat._id).eq("userId", ctx.user._id))
      .collect()

    const slicedMessages = messages.slice(0, args.messageIndex + 1)

    const shareLink = await ctx.db.insert("chatShares", {
      messageId: args.messageId,
      ownerId: ctx.user._id!,
      title: chat.title,
      validFor: args.validFor,

      messages: slicedMessages.map((message) => ({
        role: message.role,
        reasoning: message.reasoning,
        content: message.content,
        options: message.options
      }))
    })

    return shareLink
  }
})

export const getShareLink = authedQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    if (!ctx.user) return { error: "Not found" }

    const shareLink = await ctx.db
      .query("chatShares")
      .withIndex("by_id", (q) => q.eq("_id", args.id as Id<"chatShares">))
      .unique()

    if (!shareLink)
      return {
        error: "Not found"
      }

    const validFor = shareLink.validFor
    const createdAt = shareLink._creationTime
    const isExpired = new Date(createdAt).getTime() + validFor * 24 * 60 * 60 * 1000 < Date.now()

    if (isExpired) return { error: "Expired" }

    const user = await ctx.db.get(shareLink.ownerId)

    return {
      title: shareLink.title,
      user: user?.name ?? "Unknown user",
      messages: shareLink.messages.map((message) => {
        const parts: UIMessage["parts"] = []

        if (message.reasoning)
          parts.push({
            type: "reasoning",
            reasoning: message.reasoning,
            details: []
          })

        return {
          id: crypto.randomUUID(),
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

export const cloneChat = authedMutation({
  args: {
    id: v.string()
  },
  handler: async (ctx, args) => {
    const shareLink = await ctx.db
      .query("chatShares")
      .withIndex("by_id", (q) => q.eq("_id", args.id as Id<"chatShares">))
      .unique()

    if (!shareLink) throw new ConvexError("Share link not found")

    const chatId = crypto.randomUUID()

    const chatDocId = await ctx.db.insert("chats", {
      chatId,
      userId: ctx.user._id,
      title: shareLink.title,
      pinned: false
    })

    for (const message of shareLink.messages) {
      await ctx.db.insert("messages", {
        chatId: chatDocId,
        userId: ctx.user._id,
        role: message.role,
        reasoning: message.reasoning,
        content: message.content,
        options: message.options
      })
    }

    return chatId
  }
})
