# CareLink — Roadmap

## Stage 1 (PoC — current)
- [x] Participant profiles with full support data
- [x] Role-based access (worker, participant, guardian)
- [x] AI assistant with server-side proxy and minimum-data context building
- [x] Shift notes
- [x] Incident response protocols
- [x] Dietary requirement alerts
- [x] Behaviour support plan de-escalation guide
- [x] Emergency contacts
- [x] Medical information
- [x] Privacy banner and demo mode
- [x] Row-level security on all tables

## Stage 2 — Production readiness

### Consent and legal
- [ ] Participant consent flow at onboarding — explicit consent for data collection, AI use, and cross-border transfer
- [ ] Privacy policy page (APP-compliant)
- [ ] Data export and deletion functionality (APP 12)
- [ ] Privacy Impact Assessment (PIA) completion
- [ ] Engagement with NDIS Commission guidance on ICT security

### Worker verification
- [ ] NDIS Worker Screening Check verification — integrate with the Worker Screening Database (WSD) API
- [ ] Document upload for worker credentials
- [ ] Expiry tracking and alerts for screening checks

### Ollama migration (AU data sovereignty)
- [ ] Implement `streamOllama` in `lib/ai/provider.ts`
- [ ] Provision Ollama on Vultr Sydney or AWS ap-southeast-2
- [ ] Load testing with llama3.2 and mistral models
- [ ] Migrate Supabase to Australian-hosted Postgres (self-host or Neon ap-southeast-2)

### Security hardening
- [ ] Field-level encryption for highly sensitive fields (medications, diagnoses)
- [ ] Audit logging — all access to participant data recorded with timestamps
- [ ] Session timeout and automatic sign-out
- [ ] MFA for worker accounts
- [ ] Penetration testing
- [ ] Supabase service role key rotation policy

### AI improvements
- [ ] AI response quality evaluation framework
- [ ] Behaviour support practitioner review of AI outputs
- [ ] Topic detection improvements (regex → ML classifier)
- [ ] Structured AI outputs for shift note generation
- [ ] AI confidence and uncertainty signalling
- [ ] Fallback to static protocol display if AI is unavailable

### Features
- [ ] Real consent flow — participants approve each worker link, not just guardians/coordinators
- [ ] Push notifications for incidents and upcoming shifts
- [ ] Incident report submission to NDIS Quality and Safeguards Commission (notifiable incident reporting)
- [ ] Shift scheduling and calendar integration
- [ ] Document management — upload and version BSPs, care plans, assessments
- [ ] Participant goal tracking (NDIS plan goals)
- [ ] Multi-participant family/household accounts
- [ ] Offline mode for community settings with poor connectivity
- [ ] Bilingual support (CALD communities)

### Infrastructure
- [ ] Vercel production deployment with environment separation (staging, prod)
- [ ] CI/CD pipeline with automated tests
- [ ] Error monitoring (Sentry or similar)
- [ ] Uptime monitoring
- [ ] Database backup and disaster recovery plan
