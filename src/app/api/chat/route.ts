import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { waitUntil } from "@vercel/functions"
import { createDataStreamResponse, LanguageModelV1, smoothStream, streamText } from "ai"
import { api } from "api"
import { fetchMutation } from "convex/nextjs"
import { ConvexError } from "convex/values"
import { z } from "zod"

import { env } from "~/env"
import { getModel } from "~/lib/models"
import { generateTitle } from "./generateTitle"
import { getHandledChat } from "./getChat"

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
    jwtToken: z.string().optional().nullable(),
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

  if (!body.userInfo.jwtToken) return new NextResponse("Unauthorized", { status: 401 })

  const model = getModel(body.options.model)

  if (!model) return new NextResponse("Model not found", { status: 400 })

  const chat = await getHandledChat(body.id, body.userInfo.jwtToken)

  if (chat.type === "error") {
    // This ConvexError condition will probably never be hit
    if (chat.error instanceof ConvexError) return new NextResponse(chat.error.data, { status: 401 })
    else if (chat.error instanceof Error && chat.error.message.includes("InvalidAuthHeader"))
      return new NextResponse("Unauthorized", { status: 401 })

    console.error(chat.error)
    return new NextResponse("Error occurred, Check the console for more details", { status: 500 })
  }

  let provider: LanguageModelV1 | null = null

  if (model.provider === "openrouter") {
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
      compatibility: "compatible"
    })

    const hasReasoningEffort = model.features?.some((feature) => feature === "reasoningEffort")

    provider = openrouter(model.providerId, {
      ...(hasReasoningEffort && {
        reasoning: {
          effort: body.options.reasoningEffort ?? "high"
        }
      })
    })
  }

  if (!provider) return new NextResponse("Provider not found", { status: 400 })

  if (chat.data.isNewChat)
    void generateTitle({
      chatDocId: chat.data.docId,
      openrouterKey: env.OPENROUTER_API_KEY,
      token: body.userInfo.jwtToken,
      userMessage: body.message
    })

  if (typeof body.deleteFrom === "number") {
    const deletedMessages = chat.data.messages.slice(body.deleteFrom)

    console.log({ deletedMessages })

    void fetchMutation(
      api.message.del,
      {
        messages: deletedMessages.map((msg) => msg.id)
      },
      { token: body.userInfo.jwtToken }
    ).catch((error) => {
      console.log("Error deleting messages", error)
    })
  }

  console.log(body.message)
  console.log(chat.data.messages)

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
        messages: [...chat.data.messages, { role: "user", content: body.message }],
        abortSignal: request.signal,
        onFinish: (response) => {
          dataStream.writeMessageAnnotation({
            model: model.id
          })

          const saveMessage = async () => {
            if (body.deleteMode !== "retry") {
              await fetchMutation(
                api.message.create,
                {
                  chatId: chat.data.docId,
                  messageId: crypto.randomUUID(),

                  role: "user",
                  content: body.message,

                  options: {
                    modelId: model.id,
                    reasoningEffort: body.options.reasoningEffort ?? "high"
                  }
                },
                {
                  token: body.userInfo.jwtToken!
                }
              )
            }
            await fetchMutation(
              api.message.create,
              {
                chatId: chat.data.docId,
                messageId: crypto.randomUUID(),

                role: "assistant",
                reasoning: response.reasoning,
                content: response.text,

                options: {
                  modelId: model.id,
                  reasoningEffort: body.options.reasoningEffort ?? "high"
                }
              },
              {
                token: body.userInfo.jwtToken!
              }
            )
          }

          waitUntil(saveMessage())
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
