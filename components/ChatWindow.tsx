'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { ChatMessage, Participant, IncidentType } from '@/types/database'
import { getAvatarUrl } from '@/lib/utils'
import ShiftNoteForm from './ShiftNoteForm'

interface ChatWindowProps {
  participant: Participant
  incidents: IncidentType[]
  workerProfileId: string
  sessionId: string
}

export default function ChatWindow({
  participant,
  incidents,
  workerProfileId,
  sessionId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShiftNoteForm, setShowShiftNoteForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          messages: updated,
          participantId: participant.id,
          sessionId,
        }),
      })

      if (!res.ok) {
        throw new Error('AI assistant is temporarily unavailable.')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream available')

      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: assistantText }
          return copy
        })
      }
    } catch {
      setError(
        'The AI assistant is temporarily unavailable. Please refer to the printed support manual or contact the support coordinator.'
      )
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, loading, participant.id, sessionId])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const quickActions = [
    { label: 'Start of shift briefing', message: 'Give me a start of shift briefing for today.' },
    { label: 'Dietary check', message: 'What are the dietary requirements I need to know about?' },
    { label: 'Help write shift note', action: () => setShowShiftNoteForm(true) },
    ...incidents.map((inc) => ({
      label: `Seizure protocol: ${inc.name}`,
      message: `What do I do if ${participant.preferred_name} has a ${inc.name}?`,
    })),
  ]

  const photoUrl = participant.profile_photo_url ?? getAvatarUrl(participant.preferred_name ?? 'user')

  return (
    <div className="flex flex-col h-full">
      {/* Participant context header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-teal-50 flex-shrink-0">
        <Image
          src={photoUrl}
          alt={`Photo of ${participant.preferred_name}`}
          width={40}
          height={40}
          className="rounded-full bg-stone-100 border border-teal-200"
        />
        <div>
          <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">You are supporting</p>
          <p className="font-semibold text-stone-900">{participant.preferred_name}</p>
          <p className="text-xs text-stone-500">{participant.primary_disability}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap px-4 py-2 border-b border-stone-100 flex-shrink-0 overflow-x-auto">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => action.action ? action.action() : sendMessage(action.message!)}
            className="text-xs bg-stone-100 hover:bg-teal-50 hover:text-teal-800 text-stone-600 px-3 py-1.5 rounded-full border border-stone-200 hover:border-teal-300 whitespace-nowrap transition-colors"
            aria-label={action.label}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 && (
          <div className="text-center text-stone-400 text-sm py-8">
            <p className="text-2xl mb-2" aria-hidden="true">💬</p>
            <p>Ask anything about {participant.preferred_name}&apos;s care needs, or use a quick action above.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              role="article"
              aria-label={`${msg.role === 'user' ? 'Your message' : 'AI response'}`}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-br-sm'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex gap-1 items-center text-stone-400">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                  <span className="sr-only">AI is thinking</span>
                </span>
              ) : '')}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center text-stone-400">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                <span className="sr-only">AI is thinking</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-stone-200 px-4 py-3 bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about care needs, routines, or emergencies..."
            rows={2}
            aria-label="Message input"
            className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-1.5 text-center">
          AI responses are for guidance only. In emergencies, always call 000. · Cmd/Ctrl+Enter to send
        </p>
        <p className="text-xs text-stone-400 text-center">
          Chat history is not saved — this is intentional for privacy.
        </p>
      </div>

      {/* Shift note form overlay */}
      {showShiftNoteForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shift note form"
          className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <h2 className="font-semibold text-stone-900 text-lg mb-4">Record shift note</h2>
            <ShiftNoteForm
              participantId={participant.id}
              workerProfileId={workerProfileId}
              onSuccess={() => {
                setShowShiftNoteForm(false)
                sendMessage('I just saved a shift note. Can you help me summarise what to handover to the next worker?')
              }}
              onCancel={() => setShowShiftNoteForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
