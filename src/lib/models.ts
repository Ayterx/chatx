import { BrainIcon, Icon as IconType } from "lucide-react"

type Feature = "reasoning" | "reasoningEffort"

export const modelsList = [
  "deepseek-r1-0528",
  "gemini-2.0-flash-001",
  "gpt-4.1-nano",
  "grok-3-mini-beta",
  "o4-mini"
] as const

type ModelType = Record<
  (typeof modelsList)[number],
  {
    id: string
    provider: "openrouter"
    providerId: string
    name: string
    subName?: string
    company: string
    features?: Feature[]
  }
>

export const featureIcon = {
  reasoning: BrainIcon
} satisfies Record<Exclude<Feature, "reasoningEffort">, typeof IconType>

export const models: ModelType = {
  "deepseek-r1-0528": {
    id: "deepseek-r1-0528",
    provider: "openrouter",
    providerId: "deepseek/deepseek-r1-0528",
    name: "DeepSeek R1",
    subName: "0528",
    company: "DeepSeek",
    features: ["reasoning"]
  },
  "gemini-2.0-flash-001": {
    id: "gemini-2.0-flash-001",
    provider: "openrouter",
    providerId: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    company: "Google"
  },
  "gpt-4.1-nano": {
    id: "gpt-4.1-nano",
    provider: "openrouter",
    providerId: "openai/gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    company: "OpenAI"
  },
  "grok-3-mini-beta": {
    id: "grok-3-mini-beta",
    provider: "openrouter",
    providerId: "x-ai/grok-3-mini-beta",
    name: "Grok 3 Mini Beta",
    company: "xAI",
    features: ["reasoning"]
  },
  "o4-mini": {
    id: "o4-mini",
    provider: "openrouter",
    providerId: "openai/o4-mini",
    name: "o4 Mini",
    company: "OpenAI",
    features: ["reasoning", "reasoningEffort"]
  }
}

export const getModel = (modelId: string) => {
  const model = models[modelId as (typeof modelsList)[number]]

  if (!model) return null

  return model
}
