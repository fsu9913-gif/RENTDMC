<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Rent-Ruby — Gumption by Silverback AI

Executive property command center for **The Unit** (Samantha's home), built by SILVERBACKAI.AGENCY. React + Vite + TypeScript + Tailwind, with a Firestore-backed tenant portal and a Gemini-powered AI layer.

- **Hub** — public landing experience.
- **Admin** — operator/management dashboard.
- **Tenant Portal** — Samantha's view, including the *Info Nook* (Move-Out Checklist, Building Rules 2026, parking/transit maps, trash & recycling schedule, quick forms).

Origin AI Studio app: <https://ai.studio/apps/85f4144f-dabc-4ffc-b990-b6a65dc46dad>

---

## Run locally

**Prerequisites:** Node.js ≥ 20.

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY at minimum
npm run dev                  # tsx server.ts — Vite middleware + SQLite API on :5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Production Vite build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | `tsc --noEmit` typecheck |
| `npm run clean` | Remove `dist/` |

---

## Firebase configuration

Runtime Firebase config in `src/firebase.ts` reads from `VITE_FIREBASE_*` env vars first, falling back to `firebase-applet-config.json` (the AI Studio-provisioned `gen-lang-client-0013150741` project). To point the app at a different Firebase project — e.g. `samantha-gumption` — paste the web-app config values into `.env.local`; no source edits required.

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=samantha-gumption.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=samantha-gumption
VITE_FIREBASE_STORAGE_BUCKET=samantha-gumption.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_FIRESTORE_DATABASE_ID=    # blank = (default), or a named DB
```

> Firebase web `apiKey`/`appId`/`projectId` are **public** identifiers ([docs](https://firebase.google.com/docs/projects/api-keys)). Access is gated by `firestore.rules` + App Check, not by the key.

---

## Deploy to Firebase Hosting (`samantha-gumption`)

The repo is pre-wired: `firebase.json` points hosting at `dist/` with SPA rewrites, asset cache headers, a `npm run build` predeploy hook, and Firestore rules; `.firebaserc` sets the default project alias to `samantha-gumption`. No `firebase init` is required.

### One-time GCP/Firebase project setup (run on your local machine)

```bash
gcloud auth login                                   # bryan@norcalcarbmobile.com
gcloud projects create samantha-gumption \
  --name="Gumption by Silverback AI"
gcloud config set project samantha-gumption
gcloud services enable \
  run.googleapis.com \
  firebase.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com

# Attach Firebase to the GCP project (console UI or):
firebase projects:addfirebase samantha-gumption

# In Firebase console → samantha-gumption → Project Settings → Your apps:
#   "Add app" → Web → register → copy the printed `firebaseConfig` values
#   into .env.local using the VITE_FIREBASE_* names above.
```

### Deploy

```bash
cd path/to/this/repo              # e.g. C:\Users\ai_he\VSCODE UNIT\the-unit\web on Bryan's machine
npx firebase login                # one-time
npx firebase deploy --only hosting

# Later, after editing firestore.rules:
npx firebase deploy --only firestore:rules
```

The `predeploy` hook in `firebase.json` runs `npm run build` automatically, so you don't need to remember to rebuild before deploying.

### Cloud Run API proxy (future)

```bash
gcloud run deploy gumption-api \
  --source ./api --region us-west1 --allow-unauthenticated
```

The `api/` service is intentionally not yet scaffolded — it lands in a follow-up PR.

---

## Project aesthetic

Giants-inspired modern: orange (`#FF5F1F`) + deep navy (`#0B1A2D`) + white, bold tight-tracked sans-serif headings with serif italic accents, `rounded-sm` technical badges, `rounded-[2rem]`/`rounded-[2.5rem]` cards, subtle glassmorphism (`bg-white/5 backdrop-blur-md`). See `AGENTS.md` for the full spec.

- Icons: `lucide-react`.
- Animations: `motion/react`.
- Styling: Tailwind only.
- Realtime data: prefer Firestore `onSnapshot` patterns.
