import { getAuthUserId } from "@convex-dev/auth/server"
import { customMutation, customQuery } from "convex-helpers/server/customFunctions"
import { ConvexError } from "convex/values"

import { mutation, query } from "./_generated/server"

export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new ConvexError("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .unique()

    if (!user) throw new ConvexError("Unauthorized")

    return {
      args: {},
      ctx: {
        user
      }
    }
  }
})

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) throw new ConvexError("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .unique()

    if (!user) throw new ConvexError("Unauthorized")

    return {
      args: {},
      ctx: {
        user
      }
    }
  }
})
