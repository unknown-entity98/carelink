# CareLink Privacy Posture

## Status: Proof of Concept — Not for use with real participant data

---

## Current PoC Privacy Architecture

### What data is collected
- Participant profiles: name, date of birth, disability information, communication preferences, dietary requirements, medications, emergency contacts, behaviour support plans, shift notes
- Worker profiles: name, email, NDIS Worker Screening Check number
- Chat session metadata: when a session occurred (not message content)

### Where data is stored
- **Supabase (Postgres)** — hosted on AWS in the US-East-1 region by default. This means participant data leaves Australia.
- **Groq API** — AI inference provider. Chat context (a summary of participant data) is sent to Groq's servers for each AI request. Groq's infrastructure is in the United States.

### What data the AI sees
The AI assistant receives a minimal, topic-scoped summary of the participant's profile — not the full database record. The `lib/ai/buildContext.ts` function implements minimum data principle:
- Default: name, primary disability, communication profile, critical alerts only
- Emergency keywords: incident protocols + emergency contacts + medications
- Food/meal keywords: dietary requirements
- Routine keywords: relevant support manual sections
- Behaviour keywords: behaviour support plan

Raw participant records are never sent to the AI. UUIDs and database artefacts are stripped.

### Chat message privacy
Individual chat messages are **not stored in the database**. The `chat_sessions` table records only that a session occurred (worker ID, participant ID, timestamps) — not what was said. This is a deliberate design decision. Chat history exists in browser memory only and is cleared when the page is refreshed. This is disclosed to users in the UI.

### Server-side AI proxy
The AI call happens in a Next.js API route (`app/api/chat/route.ts`). The browser never receives raw participant data — only the AI's streamed response. Raw participant data never appears in browser network traffic.

---

## Australian Privacy Principles (APPs) — PoC vs Production

The [Australian Privacy Act 1988](https://www.oaic.gov.au/privacy/australian-privacy-principles) and its 13 Australian Privacy Principles apply to organisations handling personal information. Disability support data is **sensitive information** under the Act and receives heightened protections.

Key gaps in this PoC that must be addressed before any production deployment:

| APP | Gap |
|-----|-----|
| APP 1 — Open and transparent management | No privacy policy displayed to participants |
| APP 3 — Collection of solicited personal information | No explicit consent collected at onboarding |
| APP 6 — Use or disclosure | No documented purpose limitation enforcement |
| APP 8 — Cross-border disclosure | Data sent to US-based Supabase and Groq without participant notification |
| APP 11 — Security of personal information | Encryption at rest (Supabase default) but no field-level encryption for highly sensitive fields |
| APP 12 — Access to personal information | No participant data export or deletion mechanism |

**This PoC must not be used with real participant data until these gaps are addressed and a Privacy Impact Assessment (PIA) is completed.**

---

## Steps to migrate to Ollama for production (AU data sovereignty)

Running AI inference on an Australian server eliminates the cross-border data transfer risk.

1. **Provision an Australian server** — Vultr Sydney (syd1) or AWS ap-southeast-2 (Sydney) are suitable. A 4-core / 8GB RAM instance runs llama3.2 models adequately.

2. **Install Ollama**:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ollama pull llama3.2
   # or for better quality:
   ollama pull mistral
   ```

3. **Update environment variables**:
   ```
   PROVIDER=ollama
   OLLAMA_URL=http://your-au-server-ip:11434
   ```

4. **Implement the Ollama stream** in `lib/ai/provider.ts` — the `streamOllama` function has a stub with implementation notes.

5. **Migrate Supabase to AU region** — Supabase does not currently offer an Australian region. Consider:
   - Self-hosting Supabase on AWS ap-southeast-2
   - Using Neon Postgres (AWS ap-southeast-2 available)
   - Storing data in Supabase but enabling field-level encryption for sensitive fields

6. **Zero Data Retention** — If you retain a cloud AI provider (e.g. Groq, OpenAI), enable Zero Data Retention (ZDR) in their dashboard. This prevents your prompts and responses from being logged or used for training.

---

## Before going live — Privacy Impact Assessment checklist

A PIA is required before deploying with real participant data. Key questions:

- [ ] Has a privacy policy been drafted and reviewed by a lawyer?
- [ ] Is informed consent obtained from each participant (or their guardian/nominee) for data collection and AI processing?
- [ ] Have participants been informed about cross-border data transfers?
- [ ] Is there a data breach response plan? (OAIC breach notification obligations apply)
- [ ] Is there a process for participants to request access to, or deletion of, their data?
- [ ] Have you engaged a behaviour support practitioner to review the AI assistant's outputs?
- [ ] Has the AI assistant been tested for accuracy and potential harm in the disability support context?
- [ ] Is the Supabase service role key stored securely and rotated regularly?
- [ ] Are audit logs enabled for all access to participant data?
- [ ] Has the NDIS Commission's [ICT and Cybersecurity Practice Guide](https://www.ndiscommission.gov.au) been reviewed?

---

## Contact

For privacy questions related to this PoC, contact: [your organisation's privacy contact]
