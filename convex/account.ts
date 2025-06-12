import { getAuthUserId } from "@convex-dev/auth/server"

import { query } from "./_generated/server"

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) return "unauthorized"

    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .unique()

    if (!user) return "unauthorized"

    if (!user.email || !user.image || !user.name) return "unauthorized"

    return {
      email: user.email,
      image: user.image,
      name: user.name
    }
  }
})
