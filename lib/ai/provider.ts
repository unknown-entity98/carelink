/**
 * AI Provider Abstraction Layer
 *
 * PRIVACY & DATA SOVEREIGNTY NOTE:
 * For production, enable Zero Data Retention (ZDR) in your AI provider's dashboard.
 * This ensures that prompts and responses are not logged or used for training.
 *
 * For full AU data sovereignty, replace this with an Ollama instance running on an
 * Australian server (e.g. Vultr Sydney region). Ollama keeps all data on your
 * infrastructure — no data leaves the country. See PRIVACY.md for migration steps.
 *
 * The PROVIDER env var controls which backend is used:
 *   PROVIDER=groq   → Groq API (llama-3.3-70b-versatile) — default for PoC
 *   PROVIDER=ollama → Ollama (self-hosted) — recommended for production
 */

import Groq from 'groq-sdk'
import type { ChatMessage } from '@/types/database'

const PROVIDER = process.env.PROVIDER ?? 'groq'

export async function streamChat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  if (PROVIDER === 'ollama') {
    return streamOllama(messages, systemPrompt)
  }
  return streamGroq(messages, systemPrompt)
}

async function streamGroq(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
    max_tokens: 1024,
    temperature: 0.3,
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

// TODO: Implement Ollama provider for production AU data sovereignty
// Replace with: POST http://your-ollama-server/api/chat with stream:true
// Model: llama3.2 or mistral — both run well on Vultr 8-core instances
async function streamOllama(
  _messages: ChatMessage[],
  _systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434'
  const encoder = new TextEncoder()

  // Placeholder until Ollama integration is complete
  return new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `Ollama provider is configured but not yet implemented. ` +
          `Set PROVIDER=groq or implement the Ollama fetch call in lib/ai/provider.ts. ` +
          `Target URL: ${ollamaUrl}`
        )
      )
      controller.close()
    },
  })
}
