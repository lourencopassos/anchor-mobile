# Anchor — Technical PRD v1

## 1. Vision
Anchor is a personal commitment app with real consequences, designed for people who **truly want to change** a habit and are willing to put something at stake to sustain that change. The product avoids gamification, avoids judgment, and does not profit from failure.

Anchor acts as a **commitment infrastructure**: clear rules, predictable consequences, and explicit social support.

---

## 2. Problem
- Difficult habits (addiction, diet, routine, study) fail not because of lack of information, but because of lack of **immediate and social consequence**.
- Traditional habit apps rely on shallow gamification, often generating guilt, anxiety, and abandonment.
- Verbal promises to friends lack structure, memory, and consistent enforcement.

---

## 3. Product Principles

1. **Consequence > Motivation**
2. **Humanity > Performance**
3. **Events > Implicit State**
4. **Transparency > Surprise**
5. **The product must not benefit from failure**

---

## 4. Target Audience

- People who genuinely want to change
- Adults with financial autonomy
- Users comfortable with personal accountability

Not the target audience:
- Habit gamers
- Validation seekers
- Minors

---

## 5. Jobs To Be Done

- "When I want to change a hard habit, I want to create a commitment with real weight, so I don’t rely only on willpower."
- "When I support someone, I want to help without becoming a police officer or a villain."

---

## 6. Official Commitment Templates (v1)

- Diet
- Fitness / Gym
- Addiction (vape, alcohol, etc.)
- Waking up early
- Study

Each template defines:
- Rule type
- Allowed check-in types
- Baseline copy tone

---

## 7. Core Flow (Summary)

1. Template selection
2. Rule configuration
3. Sanity mini-quiz
4. Stake definition
5. Supporter invitation
6. Solemn confirmation
7. Activation

---

## 8. Technical Architecture

### 8.1 Backend
- Node.js + TypeScript monolith (NestJS)
- CQRS + Event-driven architecture
- Kafka as the event backbone

### 8.2 Source of Truth
- Immutable events (Kafka)
- PostgreSQL as read models

### 8.3 Frontend
- React Native (iOS / Android)

---

## 9. Canonical Events (Summary)

- CommitmentCreated
- CommitmentActivated
- CheckInCreated
- EvaluationPassed / WarningIssued / EvaluationFailed
- CommitmentBroken / CommitmentCompleted
- StakeDeposited / StakeDistributed / StakeReleased

---

## 10. Rules Engine

- Deterministic
- Time-window based
- Outcomes: PASS / WARNING / FAIL
- Rule snapshot at activation time

---

## 11. Stake & Payments

- Upfront stake (escrow-based)
- Destination: friends, charity, or mixed
- Anchor does not profit from failure
- Monetization:
  - Flat fee per commitment or
  - Lightweight subscription

---

## 12. Copy & Communication

- Human-first copy as default
- Future AI as contextual editor
- AI never defines rules or consequences

---

## 13. Admin Dashboard

Purpose: system governance, not user surveillance.

Modules:
- System health
- Commitment health
- Rule effectiveness
- Financial safety
- Exceptions & grace
- Abuse signals

---

## 14. Security & Legal

- LGPD / GDPR compliant
- Data minimization for sensitive data
- Clear terms: not gambling, not betting
- Auditable logs

---

## 15. Roadmap

### Phase 0 — Foundation
Architecture, rules engine, events, stake

### Phase 1 — Controlled Public MVP
Emotional UX, retention, support

### Phase 2 — Assistive AI
Contextual copy, personalization

### Phase 3 — Sustainability
Subscription, healthy scaling

### Phase 4 — Maturity
Ecosystem, integrations

---

## 16. Non-goals (Red Lines)

- Social feed
- Public rankings
- Likes or aggressive streaks
- Monetization based on failure

---

## 17. Success Metrics

- Activation rate
- Second commitment rate
- Early failure (D3 / D7)
- Financial sustainability

---

## 18. Product Success Definition

Anchor is successful if:
- It works with a small number of users
- It does not generate guilt
- It does not require a rewrite
- Users say: "this helped me sustain a decision"

