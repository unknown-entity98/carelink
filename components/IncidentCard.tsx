'use client'

import { useState } from 'react'
import type { IncidentType } from '@/types/database'

interface IncidentCardProps {
  incident: IncidentType
}

export default function IncidentCard({ incident }: IncidentCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`rounded-xl border-l-4 border border-stone-200 bg-white overflow-hidden ${
        incident.when_to_call_000 ? 'border-l-red-500' : 'border-l-amber-400'
      }`}
      role="article"
      aria-label={`Incident protocol: ${incident.name}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-stone-900 text-base">{incident.name}</h3>
            {incident.when_to_call_000 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5 mt-1">
                <span aria-hidden="true">🚨</span> Call 000
              </span>
            )}
            {incident.when_to_call_support_coordinator && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1 ml-1">
                Notify support coordinator
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={`incident-steps-${incident.id}`}
            className="flex-shrink-0 text-sm font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2"
          >
            {expanded ? 'Hide steps' : 'View response steps'}
          </button>
        </div>

        {incident.description && (
          <p className="text-sm text-stone-600 mt-2">{incident.description}</p>
        )}
      </div>

      {expanded && (
        <div
          id={`incident-steps-${incident.id}`}
          className="border-t border-stone-100 bg-stone-50 p-4"
        >
          <h4 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
            Response steps
          </h4>
          <ol
            className="space-y-3"
            aria-label={`Response steps for ${incident.name}`}
          >
            {incident.response_steps.map((step, index) => (
              <li key={index} className="flex gap-3 items-start">
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold flex items-center justify-center"
                >
                  {index + 1}
                </span>
                <span className="text-base text-stone-800 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          {incident.notes && (
            <p className="mt-4 text-sm text-stone-600 italic border-t border-stone-200 pt-3">
              Note: {incident.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
