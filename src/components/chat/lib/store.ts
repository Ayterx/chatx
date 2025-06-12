import { persist, subscribeWithSelector } from "zustand/middleware"
import { createStore } from "zustand/vanilla"

import { models } from "~/lib/models"

type ModelId = keyof typeof models

export interface ChatStore {
  model: (typeof models)[keyof typeof models]
  input: {
    prompt: string
    hasTyped: boolean
  }
  options: {
    reasoningEffort: string | null
  }
}

interface ChatStorePersist {
  prompt: string
  modelId: ModelId
}

export const chatStore = createStore<ChatStore>()(
  subscribeWithSelector(
    persist<ChatStore, [], [], ChatStorePersist>(
      () => ({
        model: models["gemini-2.0-flash-001"],
        input: {
          prompt: "",
          hasTyped: false
        },
        options: {
          reasoningEffort: null
        }
      }),
      {
        name: "chat-store",
        partialize: (state) => ({
          prompt: state.input.prompt,
          modelId: state.model.id as ModelId
        }),
        merge: (raw, currentState) => {
          const persisted = raw as ChatStorePersist | undefined
          if (!persisted) return currentState

          return {
            ...currentState,
            input: {
              ...currentState.input,
              prompt: persisted.prompt,
              hasTyped: persisted.prompt.length > 0 ? true : false
            },

            model: models[persisted.modelId] ?? models["gemini-2.0-flash-001"]
          }
        }
      }
    )
  )
)
