import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { api } from "api"
import { fetchMutation } from "convex/nextjs"
import { Effect, pipe } from "effect"

import { Id } from "../../../../convex/_generated/dataModel"

export const generateTitle = async ({
  chatDocId,
  openrouterKey,
  token,
  userMessage
}: {
  chatDocId: string
  openrouterKey: string
  token: string
  userMessage: string
}) => {
  const provider = createOpenRouter({
    apiKey: openrouterKey
  })

  const error = await Effect.runPromise(
    pipe(
      Effect.tryPromise({
        try: async () =>
          await generateText({
            model: provider.chat("google/gemini-2.0-flash-001"),
            system: `You will generate a short title based on the user first message
    -Ensure that the title is short no more than 80 characters
    -Do not use quotes or colons
    -The title should be a summary of the user message
    `,
            prompt: userMessage
          }),
        catch: (error) => error
      }),
      Effect.flatMap((data) =>
        Effect.tryPromise({
          try: async () =>
            await fetchMutation(
              api.chat.updateTitle,
              {
                id: chatDocId as Id<"chats">,
                title: data.text
              },
              { token }
            ),
          catch: (error) => error
        })
      ),
      Effect.catchAll((error) => Effect.succeed(error as Error))
    )
  )

  if (error) console.log("Error generating title", error)
}
