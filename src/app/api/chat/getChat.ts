import { api } from "api"
import { fetchMutation } from "convex/nextjs"
import { Effect, pipe } from "effect"

export const getHandledChat = async (chatId: string, jwtToken: string) =>
  await Effect.runPromise(
    pipe(
      Effect.tryPromise({
        try: () =>
          fetchMutation(
            api.chat.getOrCreateChat,
            {
              chatId
            },
            { token: jwtToken }
          ),
        catch: (error) => error
      }),
      Effect.match({
        onFailure: (error) => ({
          type: "error" as const,
          error: error
        }),
        onSuccess: (data) => ({
          type: "success" as const,
          data
        })
      })
    )
  )
