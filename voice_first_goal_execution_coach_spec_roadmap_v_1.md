# Voice-First Goal Execution Coach — Spec & Roadmap (v1)

## 0) TL;DR
A voice-first journaling & coaching app that:
- Captures quick thoughts via **voice notes** and supports **full back‑and‑forth voice conversations**.
- **Discovers goals** from your existing chats (Claude/ChatGPT imports) and daily notes, then **evolves them into OKRs** when you’re ready.
- **Monitors daily activity** (GCal, Gmail, Drive, Slack, GitHub, Notion/Todoist, etc.) to reflect what you actually did vs. what you intended.
- Coaches you with a **supportive tone**, helps **reprioritize** when off‑track, and nudges you gently.

You’ll **copy/paste** initial chat history to seed context; app refines with daily questions; goals/OKRs **emerge organically**.

---

## 1) Core Experience
- **Daily touchpoints**: morning intentions, optional midday check‑ins, evening reflection.
- **Voice anywhere**: push‑to‑talk (PTT), continuous listen (hold‑to‑talk), or quick voice note.
- **Two‑way voice**: you talk; the app transcribes and replies in a warm, supportive voice.
- **Smart capture**: auto‑tag by theme (goal, progress, obstacle, idea, venting), attach to goals when recognized.
- **Guided → flexible**: start with structure; loosen as habits form.
- **Success in 6 months**: you know your OKRs and execute them steadily without the “catch‑up” feeling.

Tone: **supportive and gentle**.

---

## 2) Must‑Have Requirements
1. **Voice notes**: instant capture; real‑time transcription.
2. **Conversational coaching**: natural back‑and‑forth voice replies.
3. **Goal discovery**: extract themes from pasted chat history + ongoing notes.
4. **Guided OKRs**: promote themes → Objectives; define measurable KRs; cap active goals (3–5); quarterly review.
5. **Daily execution**: plan AM, adjust midday, reflect PM; gentle re‑engagement after gaps.
6. **Progress tracking**: metrics + qualitative reflection; streaks; trends.
7. **Cloud sync** across devices; private by default.
8. **Data integrations** (opt‑in): GCal, Gmail, Drive, Slack, GitHub, Notion/Todoist; later: chat history imports (Claude/ChatGPT export files).
9. **Reprioritization**: when derailed, suggest focus based on patterns + ask reflective questions.

---

## 3) Architecture (recommended)
**Frontend**
- React Native (iOS/Android) or React PWA; Tailwind/NativeWind UI; offline queue for notes.

**Voice In (STT)**
- **Deepgram Streaming** for real‑time low‑latency transcripts (high accuracy) _or_
- **OpenAI Whisper API** (very high accuracy; real‑time via streaming beta; higher compute).
- Start with **Deepgram** for conversational latency; keep Whisper as fallback/batch.

**Voice Out (TTS)**
- **ElevenLabs** for natural prosody; fallback: OpenAI TTS.

**AI Brain**
- **Claude** (Sonnet class) for coaching, summarization, theme/goal extraction, OKR scaffolding.
- Optional: add a second LLM for retrieval/long context experiments.

**Backend & Storage**
- **Supabase** (Postgres, Row Level Security, Auth, Storage, Realtime queues).
- Audio files in object storage; signed URLs; transcripts in Postgres (vectorized for search).

**Data Pipelines**
- Ingest -> Normalize -> Enrich -> Store -> Index (pgvector) -> Summarize.
- Nightly/weekly jobs for insights, trendlines, and re‑prioritization suggestions.

**Privacy & Security**
- OAuth 2.0 per integration; least‑privilege scopes; encrypt at rest + in transit.
- Transparent data controls (connect/disconnect; delete by source, date, or entity).
- On‑device redaction option for PII in transcripts before upload (toggle).

---

## 4) Data Model (schema sketch)
- **users**: id, email, settings, connected_services[]
- **conversations**: id, user_id, started_at, mode(voice|text|hybrid)
- **messages**: id, conversation_id, role(user|assistant), text, audio_url, ts
- **voice_notes**: id, user_id, audio_url, transcript, ts, tags[], note_type(goal|progress|obstacle|idea|vent)
- **themes**: id, user_id, name, description, confidence, sources[]
- **goals**: id, user_id, objective, description, priority, status(active|parked|done), target_date, theme_id
- **key_results**: id, goal_id, metric_type(count|sum|bool|percent), baseline, target, current, unit
- **daily_check_ins**: id, user_id, type(morning|midday|evening), responses{}, mood, energy, ts
- **activity_data**: id, user_id, date, source(gcal|gmail|slack|github|drive|notion|todoist), payload{}, insights{}
- **external_chats**: id, user_id, source(claude|chatgpt), imported_at, doc_ref
- **embeddings**: id, owner_type(message|note|doc|activity), owner_id, vector

---

## 5) Key Flows
### A) Voice Conversation (MVP)
1. User press‑to‑talk; audio stream → STT.
2. Partial captions shown live; final transcript on release.
3. Context window built from recent messages + user profile + today’s plan.
4. Claude generates supportive response.
5. TTS synthesizes; auto‑play reply; save both audio+text.

### B) Quick Voice Note
- One‑tap capture; STT; auto‑tag + suggest links to themes/goals; inbox for review.

### C) Goal Discovery from Chat History
- User pastes exports (Claude/ChatGPT) → chunk → embed → cluster → label → propose **themes** with quotes.
- Daily questions refine themes ("You mentioned X three times—why important now?").
- Promote to **Objectives**; scaffold KRs with suggested metrics.

### D) Daily Execution
- **Morning**: “What matters most today?” + propose 1–3 focus items tied to KRs & calendar.
- **Midday**: optional check‑in; adjust if derailed.
- **Evening**: reflection; what moved; gratitude; carry‑forward + backlog triage.

### E) Re‑engagement
- After gaps, gentle recap: what you last cared about; pick one small next step; reset streaks compassionately.

---

## 6) Integrations (opt‑in, staged)
**Phase 1–3** (foundations)
- None required beyond auth + storage.

**Phase 4–6** (execution)
- **Google Calendar**: events, free/busy, time‑use summaries.
- **Google Drive**: activity feed, recent docs for projects.
- **Gmail**: high‑level patterns (counts, threads with labels); avoid reading full content unless granted.
- **Slack**: message volume by channel; top topics/entities.
- **GitHub**: commits/PRs/issues per repo/day.
- **Notion/Todoist**: task creation/completion metrics.

**Phase 7–8** (context import)
- **Claude.ai / ChatGPT**: user‑exported archives; importer guides you to paste/upload; parse to conversations; attribute quotes to themes.

Permissions are granular; you can connect none, some, or all.

---

## 7) Coaching Logic (tone & strategy)
- **Tone**: supportive, curious, gently challenging.
- **Modes**: (a) reflective questions, (b) pattern feedback, (c) prioritization aid, (d) OKR scaffolding.
- **When derailed**: summarize last intent, surface the smallest viable next step, offer reprioritization.

Example prompts the coach might use:
- “You said Y is priority, but your afternoon is meeting‑heavy. Want me to suggest a swap?”
- “You log higher energy before noon—would 90 minutes of deep work on Objective A fit 9–10:30?”

---

## 8) Product Milestones
**Phase 1 — Voice Conversation MVP (2–3 wks)**
- Real‑time STT, Claude replies, TTS playback; save transcripts; PTT UI; auth; basic settings.

**Phase 2 — Smart Organization (1 wk)**
- Quick voice notes; auto‑tag; search; filters; review inbox.

**Phase 3 — Context Import & Goal Discovery (2 wks)**
- Paste/import chat archives; theme extraction; theme dashboard; promote to Objectives.

**Phase 4 — OKR Framework & Prioritization (1–2 wks)**
- Guided OKR creation via voice; KR metric templates; active goals cap.

**Phase 5 — Daily Execution & Coaching (2 wks)**
- Morning/midday/evening flows; gentle re‑engagement; link actions to KRs.

**Phase 6 — Analytics (1 wk)**
- Streaks, KR progress, mood/energy trends; weekly summaries.

**Phase 7 — Data Integration Hub (2–3 wks)**
- GCal, Gmail, Drive, Slack, GitHub, Notion/Todoist connectors; permission UI; source dashboards.

**Phase 8 — AI Activity Synthesis (1–2 wks)**
- Morning briefing; evening reality check; gap analysis vs. OKRs; suggestions.

**Phase 9 — Predictive Coaching (1 wk)**
- Schedule optimization; proactive nudges; “if X then suggest Y” rules + LLM reasoning.

---

## 9) Technical Details & Interfaces
**Realtime Audio**
- Web: MediaRecorder + WebSocket to STT; mobile: RN audio module.
- Backpressure & VAD (voice activity detection) to segment utterances.

**LLM Context Window**
- Recent conversation turns + today’s plan + top goals + calendar highlights + user style prefs.
- Retrieval: pgvector nearest neighbors for relevant past notes/goals.

**Importer (Claude/ChatGPT)**
- Accept pasted text or files; parse by conversation/session; chunk to ~1–2k tokens; embed; cluster; label; extract quotes.

**Tagging**
- Zero‑shot labels (goal/progress/obstacle/idea/vent) + theme keywords; manual edit.

**KR Metrics**
- Types: boolean, count, sum, percentage; automated rollups from integrations when available.

**Notifications**
- Local push for morning/evening; optional nudges based on patterns (respect quiet hours).

---

## 10) Privacy & Controls UX
- **Data control panel**: view connected sources; per‑source delete; global wipe.
- **Explainability**: every insight links to evidence (events, notes, commits).
- **On‑device redact**: optional removal of names/PII pre‑upload.

---

## 11) Costs (rough)
- STT: Deepgram streaming (pay‑as‑you‑go); Whisper as alt.
- TTS: ElevenLabs tier; OpenAI TTS cheaper fallback.
- LLM: Claude usage scales with convo length; cache summaries.
- Supabase: starter plan then scale.

---

## 12) Success Metrics
- Weekly active voice sessions per user.
- Day‑7/30 retention.
- % of notes auto‑tagged correctly (manual correction rate).
- Time‑to‑first OKR and # of weeks with KR movement.
- Delta between planned focus and actual time allocation.

---

## 13) Immediate Next Steps (you can start today)
1. **Scaffold repo** (RN or PWA) + Supabase project.
2. Implement **Phase 1**: streaming STT → Claude → TTS loop; save transcripts.
3. Ship **Quick Voice Note** button with auto‑tag MVP.
4. Build **Import screen** for pasted chat text (Phase 3 starter).

---

## 14) Stretch Ideas (later)
- Wearable glanceable prompts; AirPods head‑nod to confirm.
- On‑device diarization for meetings → action extraction.
- “Focus mode” that mutes select channels during deep work blocks.

— End v1 —

