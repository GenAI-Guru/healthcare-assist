# healthcare-assist

A healthcare consultation assistant for clinicians. Doctors paste visit notes and get a chart-ready summary, next-step action items, and a patient-friendly email — streamed in real time.

This repo started as a Day 3 SaaS (authenticated idea generator with Clerk billing). It is now **healthcare-assist** on the same stack: Next.js, FastAPI, Clerk, and Vercel.

## What it will do

- Accept a doctor's consultation notes through a structured form (including a visit date picker)
- Generate a professional summary suitable for medical records
- Produce actionable next steps for the clinician
- Draft a clear, patient-friendly follow-up email
- Stream each section as the model writes it

## Current foundation

Already in place from the SaaS build:

| Capability | Status |
|---|---|
| Next.js Pages Router UI | Live in `healthcare-assist/` |
| Clerk sign-in (email, Google, GitHub) | Working |
| Subscription gate (`Protect` + pricing table) | Working |
| FastAPI backend on Vercel (`healthcare-assist/api/index.py`) | Working |
| JWT verification via Clerk JWKS | Working |
| OpenAI streaming over SSE | Working |
| Deployed on Vercel | Prerequisite for this evolution |

The product surface (`/`, `/product`) is branded as **healthcare-assist**. Next, the auto-generated stream becomes a consultation workspace with a notes form and date picker.

## How it works

```
Doctor signs in (Clerk)
        ↓
Subscription check
        ↓
Consultation form (notes + visit date)
        ↓
Browser sends JWT + form payload to FastAPI `/api`
        ↓
Backend verifies the token, calls OpenAI, streams SSE
        ↓
UI renders summary, actions, and patient email as they arrive
```

Frontend and API stay separate: Next.js is the client, Python verifies identity and talks to the model. Session secrets never go to the model provider beyond the note text you submit.

## Repository layout

```
.
├── README.md                 ← you are here
├── docs/
│   ├── day3.md               # Clerk authentication (historical)
│   └── day3.part2.md         # Clerk Billing / subscriptions (historical)
└── healthcare-assist/           # deployable healthcare-assist app
    ├── api/index.py          # FastAPI SSE endpoint
    ├── pages/                # UI (landing + product)
    ├── requirements.txt
    └── package.json
```

## Stack

- **Frontend:** Next.js 16 (Pages Router), React 19, Tailwind CSS, React Markdown
- **Auth & billing:** Clerk (`@clerk/nextjs` v6) with JWT + JWKS
- **API:** FastAPI, `fastapi-clerk-auth`, OpenAI streaming
- **Realtime:** `@microsoft/fetch-event-source` (`text/event-stream`)
- **Host:** Vercel (use `vercel dev` locally so the Python function is mounted)

## Getting started

```bash
cd healthcare-assist
npm install
```

Create `healthcare-assist/.env.local` (never commit this file):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
OPENAI_API_KEY=sk-...
```

Run with Vercel so `/api` is the Python function, not a Next.js HTML 404:

```bash
cd healthcare-assist
vercel dev
```

Then open [http://localhost:3000](http://localhost:3000). Sign in, subscribe if prompted, and open **Go to App**.

Production:

```bash
cd healthcare-assist
vercel --prod
```

Set the same four environment variables in the Vercel project.

## Evolution plan

1. **Keep** Clerk auth, billing, SSE streaming, and the Vercel Python function.
2. **Replace** the demo prompt and `/product` UI with a consultation form (notes + date picker).
3. **Return** three artifacts: clinical summary, doctor action items, patient-friendly email.
4. **Install** a date-picker dependency when the form lands (next implementation step).

Course notes for the auth/billing layers stay in `docs/`. App bootstrap notes are in `healthcare-assist/README.md`.

## Privacy note

This is a learning/demo product. Do not submit real protected health information (PHI) until you have a proper BAA, encryption, audit logging, and a production data policy. Use synthetic notes while developing.
