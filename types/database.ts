export type Role = 'participant' | 'worker' | 'guardian'
export type ManualCategory = 'daily_routine' | 'communication' | 'mobility' | 'personal_care' | 'general'
export type WorkerLinkStatus = 'pending' | 'approved' | 'revoked'
export type DietaryRequirementType = 'allergy' | 'intolerance' | 'preference' | 'texture' | 'religious' | 'medical'
export type DietarySeverity = 'life_threatening' | 'serious' | 'mild' | 'preference'

export interface Profile {
  id: string
  full_name: string | null
  role: Role
  ndis_number: string | null
  worker_screening_check: string | null
  created_at: string
}

export interface Participant {
  id: string
  profile_id: string
  preferred_name: string | null
  date_of_birth: string | null
  primary_disability: string | null
  secondary_disabilities: string[] | null
  communication_profile: string | null
  pronoun: string | null
  profile_photo_url: string | null
  created_at: string
  updated_at: string
}

export interface SupportManual {
  id: string
  participant_id: string
  title: string
  content: string
  category: ManualCategory
  is_critical: boolean
  created_at: string
  updated_at: string
}

export interface IncidentType {
  id: string
  participant_id: string
  name: string
  description: string | null
  response_steps: string[]
  when_to_call_000: boolean
  when_to_call_support_coordinator: boolean
  notes: string | null
  created_at: string
}

export interface DietaryRequirement {
  id: string
  participant_id: string
  requirement_type: DietaryRequirementType
  description: string
  severity: DietarySeverity
  notes: string | null
}

export interface EmergencyContact {
  id: string
  participant_id: string
  full_name: string
  relationship: string
  phone_primary: string
  phone_secondary: string | null
  is_primary_contact: boolean
  notes: string | null
}

export interface Medication {
  name: string
  dose: string
  frequency: string
  notes: string | null
}

export interface Diagnosis {
  condition: string
  diagnosed_date: string | null
  notes: string | null
}

export interface MedicalInfo {
  id: string
  participant_id: string
  gp_name: string | null
  gp_phone: string | null
  specialist_name: string | null
  specialist_phone: string | null
  medications: Medication[] | null
  diagnoses: Diagnosis[] | null
  medicare_number: string | null
  health_insurance: string | null
  advance_care_directive_url: string | null
}

export interface BehaviourSupportPlan {
  id: string
  participant_id: string
  title: string
  document_url: string | null
  summary: string | null
  triggers: string[] | null
  de_escalation_strategies: string[] | null
  last_reviewed: string | null
  reviewed_by: string | null
}

export interface WorkerParticipantLink {
  id: string
  worker_profile_id: string
  participant_id: string
  status: WorkerLinkStatus
  linked_at: string
  linked_by: string | null
}

export interface ShiftNote {
  id: string
  worker_profile_id: string
  participant_id: string
  shift_date: string
  shift_start: string | null
  shift_end: string | null
  note_text: string
  mood_rating: number | null
  incidents_occurred: boolean
  incident_description: string | null
  created_at: string
}

export interface ChatSession {
  id: string
  worker_profile_id: string
  participant_id: string
  started_at: string
  ended_at: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Enriched types for UI
export interface ParticipantWithProfile extends Participant {
  profiles: Profile
}

export interface WorkerParticipantLinkWithParticipant extends WorkerParticipantLink {
  participants: Participant
}
