# Project Context: Rent-Ruby

This document tracks persistent enhancements and project-specific rules for the Rent-Ruby application.

## Core Aesthetic: Giants-Inspired Modern
- **Color Palette**: Vibrant Orange (`#FF5F1F` / `app-accent`), Black/Deep Navy (`#0B1A2D`), and White.
- **Typography**: 
  - Headings: Bold, tight-tracking sans-serif (Inter/font-sans).
  - Accents: Elegant serif italics for subheadings and distances.
  - Metadata: Bold, small-caps, wide-tracking for descriptions and badges.
- **Layout Patterns**: 
  - Use `rounded-sm` for technical badges (e.g., "EST. 1924").
  - Use `rounded-[2rem]` or `rounded-[2.5rem]` for main cards and sections.
  - High-contrast elements with subtle glassmorphism (`bg-white/5 backdrop-blur-md`).

## Key Features & Enhancements

### 1. The Info Nook (Tenant Portal)
- **Purpose**: A central hub for tenant documents, forms, and building knowledge.
- **Location**: `src/components/TenantPortal.tsx` (activeTab: `info-nook`).
- **Content**: 
  - Move-Out Checklist (Required).
  - Building Rules 2026.
  - Parking & Transit Maps.
  - Trash & Recycling Schedule (AI-monitored smart bins).
  - Quick Forms (Sublet, Pet registration, etc.).

### 2. Navigation & UX
- **Simplified Nav**: The "Platform" link has been removed from the main navigation to focus on the Hub, Amenities, Neighborhood, and Gallery.
- **View Toggles**: The app supports three distinct views: Hub (Landing), Admin (Management), and Tenant (Portal).

### 3. Hero Section Specifics
- **Tagline**: "POSITIVE VIBES LIVE HERE STORY." (Blue text + White/40 label).
- **Status Indicator**: "ONLY 2 UNITS LEFT" with a pulsing ruby dot.

## Development Rules
- **Icons**: Always use `lucide-react`.
- **Animations**: Always use `motion/react`.
- **Styling**: Strictly Tailwind CSS.
- **Data**: Prefer real-time patterns with `onSnapshot` if Firebase is used.

## Deployment

- **Hosting target**: Firebase Hosting on GCP project `samantha-gumption` ("Gumption by Silverback AI"), owned by `bryan@norcalcarbmobile.com`. Local repo on the operator's machine lives at `C:\Users\ai_he\VSCODE UNIT\the-unit\web`.
- **Pre-wired config**: `firebase.json` (SPA rewrites, asset cache headers, `npm run build` predeploy hook, `firestore.rules` wired in) and `.firebaserc` (default project alias `samantha-gumption`). Do NOT re-run `firebase init hosting`.
- **Runtime Firebase config**: `src/firebase.ts` reads `VITE_FIREBASE_*` from `.env.local` first, falling back to `firebase-applet-config.json` (the AI Studio default project `gen-lang-client-0013150741`). Never commit a `.env.local`. To switch projects, paste new web-app config into `.env.local` — do NOT edit `firebase-applet-config.json` per environment.
- **Web API keys are public**: Firebase apiKey/appId/projectId are identifiers, not secrets. Security comes from `firestore.rules` + App Check.
- **API proxy (future)**: `gcloud run deploy gumption-api --source ./api --region us-west1 --allow-unauthenticated`. The `api/` directory is intentionally not yet scaffolded.
