import type {
  Participant,
  SupportManual,
  IncidentType,
  DietaryRequirement,
  EmergencyContact,
  MedicalInfo,
  BehaviourSupportPlan,
} from '@/types/database'

export interface ParticipantProfile {
  participant: Participant
  manuals: SupportManual[]
  incidents: IncidentType[]
  dietary: DietaryRequirement[]
  contacts: EmergencyContact[]
  medical: MedicalInfo | null
  bsp: BehaviourSupportPlan | null
}

type Topic = 'emergency' | 'dietary' | 'routine' | 'behaviour' | 'default'

function detectTopic(message: string): Topic {
  const lower = message.toLowerCase()
  if (/seizure|fall|not breathing|emergency|unconscious|choking|injury|hurt/.test(lower)) return 'emergency'
  if (/food|lunch|eat|drink|meal|allergy|diet|breakfast|dinner|snack/.test(lower)) return 'dietary'
  if (/routine|morning|schedule|shower|bed|wake|sleep|toilet|hygiene/.test(lower)) return 'routine'
  if (/behaviour|escalat|upset|anxious|meltdown|agitat|angry|distress|calm/.test(lower)) return 'behaviour'
  return 'default'
}

function formatDietarySeverity(severity: string): string {
  const map: Record<string, string> = {
    life_threatening: 'LIFE-THREATENING',
    serious: 'Serious',
    mild: 'Mild',
    preference: 'Preference',
  }
  return map[severity] ?? severity
}

export function buildContext(profile: ParticipantProfile, workerMessage: string): string {
  const { participant, manuals, incidents, dietary, contacts, medical, bsp } = profile
  const topic = detectTopic(workerMessage)

  const criticalManuals = manuals.filter((m) => m.is_critical)
  const name = participant.preferred_name ?? 'the participant'

  let ctx = `PARTICIPANT: ${name} (${participant.pronoun ?? 'they/them'})
PRIMARY DISABILITY: ${participant.primary_disability ?? 'Not specified'}
COMMUNICATION: ${participant.communication_profile ?? 'Not specified'}
`

  if (participant.secondary_disabilities?.length) {
    ctx += `SECONDARY CONDITIONS: ${participant.secondary_disabilities.join(', ')}\n`
  }

  if (criticalManuals.length > 0) {
    ctx += `\nCRITICAL ALERTS:\n`
    criticalManuals.forEach((m) => {
      ctx += `- ${m.title}: ${m.content.slice(0, 200)}\n`
    })
  }

  const lifeThreatAllergies = dietary.filter((d) => d.severity === 'life_threatening')
  if (lifeThreatAllergies.length > 0) {
    ctx += `\nLIFE-THREATENING ALLERGIES:\n`
    lifeThreatAllergies.forEach((d) => {
      ctx += `- ${d.description}\n`
    })
  }

  if (topic === 'emergency') {
    ctx += `\nINCIDENT RESPONSE PROTOCOLS:\n`
    incidents.forEach((inc) => {
      ctx += `\n${inc.name}:\n`
      if (inc.description) ctx += `  What it looks like: ${inc.description}\n`
      ctx += `  Steps:\n`
      inc.response_steps.forEach((step, i) => {
        ctx += `  ${i + 1}. ${step}\n`
      })
      if (inc.when_to_call_000) ctx += `  ⚠️ CALL 000 if this occurs\n`
      if (inc.notes) ctx += `  Notes: ${inc.notes}\n`
    })

    if (contacts.length > 0) {
      ctx += `\nEMERGENCY CONTACTS:\n`
      contacts.sort((a, b) => (b.is_primary_contact ? 1 : 0) - (a.is_primary_contact ? 1 : 0))
      contacts.slice(0, 3).forEach((c) => {
        ctx += `- ${c.full_name} (${c.relationship}): ${c.phone_primary}${c.is_primary_contact ? ' [PRIMARY]' : ''}\n`
      })
    }

    if (medical) {
      ctx += `\nMEDICAL:\n`
      if (medical.gp_name) ctx += `GP: ${medical.gp_name} — ${medical.gp_phone ?? 'phone not listed'}\n`
      if (medical.medications?.length) {
        ctx += `Medications: ${medical.medications.map((m) => `${m.name} ${m.dose} ${m.frequency}`).join(', ')}\n`
      }
    }
  }

  if (topic === 'dietary') {
    ctx += `\nDIETARY REQUIREMENTS:\n`
    if (dietary.length === 0) {
      ctx += `No dietary requirements on file.\n`
    } else {
      dietary.forEach((d) => {
        ctx += `- [${formatDietarySeverity(d.severity)}] ${d.description} (${d.requirement_type})`
        if (d.notes) ctx += ` — ${d.notes}`
        ctx += '\n'
      })
    }
  }

  if (topic === 'routine') {
    const routineManuals = manuals.filter((m) =>
      m.category === 'daily_routine' || m.category === 'personal_care'
    )
    if (routineManuals.length > 0) {
      ctx += `\nROUTINE & PERSONAL CARE:\n`
      routineManuals.forEach((m) => {
        ctx += `\n${m.title}:\n${m.content}\n`
      })
    }
  }

  if (topic === 'behaviour') {
    if (bsp) {
      ctx += `\nBEHAVIOUR SUPPORT PLAN — ${bsp.title}:\n`
      if (bsp.summary) ctx += `Summary: ${bsp.summary}\n`
      if (bsp.triggers?.length) {
        ctx += `Triggers: ${bsp.triggers.join('; ')}\n`
      }
      if (bsp.de_escalation_strategies?.length) {
        ctx += `De-escalation strategies:\n`
        bsp.de_escalation_strategies.forEach((s, i) => {
          ctx += `  ${i + 1}. ${s}\n`
        })
      }
    }
  }

  return ctx.trim()
}
