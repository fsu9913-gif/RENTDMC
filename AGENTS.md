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

## Cursor Cloud specific instructions

### Services
- **Single service**: Express.js server with Vite middleware (dev mode). Run with `npm run dev` → serves frontend + API on `http://localhost:3000`.
- **Database**: SQLite via `better-sqlite3` (embedded, file: `rentroll_v3.db`). Created automatically on first run with seed data. No external DB service needed.
- **Firebase/Gemini**: Optional. The app works fully without `GEMINI_API_KEY` or Firebase credentials (AI image gen and auth degrade gracefully).

### Commands reference
| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint (type check) | `npm run lint` |
| Build | `npm run build` |
| Clean | `npm run clean` |

### Gotchas
- The dev server runs Express + Vite in a single process (`tsx server.ts`). There is no separate frontend dev server.
- The SQLite database file (`rentroll_v3.db`) is created at the workspace root on first server start. Delete it to reset to seed data.
- `better-sqlite3` requires native addon compilation. If `npm install` fails on this package, ensure `build-essential` and `python3` are available.
- The app has three views toggled via the top nav: **Hub** (landing page), **Admin** (property management dashboard), **Tenant** (resident portal).
- Lint is TypeScript only (`tsc --noEmit`); there is no ESLint configured.
