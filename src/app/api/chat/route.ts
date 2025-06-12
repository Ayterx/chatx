import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createDataStreamResponse, LanguageModelV1, smoothStream, streamText } from "ai"
import { z } from "zod"

import { env } from "~/env"
import { getModel } from "~/lib/models"

const bodySchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  deleteFrom: z.number().optional().nullable(),
  deleteMode: z.enum(["edit", "retry"]).optional().nullable(),
  options: z.object({
    model: z.string(),
    reasoningEffort: z.enum(["high", "medium", "low"]).optional().nullable()
  }),
  userInfo: z.object({
    timezone: z.string()
  })
})

export const POST = async (request: NextRequest) => {
  const rawBody = (await request.json()) as unknown

  const validation = bodySchema.safeParse(rawBody)

  if (validation.error) console.log(validation.error)

  if (!validation.success || (validation.data.deleteFrom && !validation.data.deleteMode))
    return new NextResponse("Validation failed", { status: 400 })

  const body = validation.data

  const model = getModel(body.options.model)

  if (!model) return new NextResponse("Model not found", { status: 400 })

  let provider: LanguageModelV1 | null = null

  if (model.provider === "openrouter") {
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
      compatibility: "compatible"
    })

    provider = openrouter.chat(model.providerId)
  }

  if (!provider) return new NextResponse("Provider not found", { status: 400 })

  return createDataStreamResponse({
    onError: (error) => {
      console.log("onError", error)

      return "Error occurred, Check the console for more details"
    },
    execute: (dataStream) => {
      const stream = streamText({
        model: provider,

        // Taken from T3 Chat
        system: `
I am ChatX, an AI assistant powered by the ${model.name}. My role is to assist and engage in conversation while being helpful, respectful, and engaging.

- If you are specifically asked about the model I am using, I may mention that I use the ${model.name}. If I am not asked specifically about the model I am using, I do not need to mention it.
- The current date and time including timezone is ${Intl.DateTimeFormat("en-US", { dateStyle: "medium", hour12: true, timeStyle: "long" }).format(new Date())}.
- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead.
- When generating code:
    - Ensure it is properly formatted using Prettier with a print width of 80 characters
    - Present it in Markdown code blocks with the correct language extension indicated`,
        prompt: body.message,
        abortSignal: request.signal,
        onFinish: () => {
          dataStream.writeMessageAnnotation({
            model: model.id
          })
        },
        onError: (error) => {
          console.log("onError", error)
        },
        experimental_transform: smoothStream()
      })

      stream.mergeIntoDataStream(dataStream, {
        sendReasoning: true
      })
    }
  })
}
