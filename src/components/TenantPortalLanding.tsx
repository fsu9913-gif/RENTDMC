import { useMemo, useState } from 'react';
import {
  Mail,
  Bell,
  Smartphone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface TenantIdentity {
  unit: string;
  email: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  subscribedAt: number;
}

interface TenantPortalLandingProps {
  units: string[];
  onComplete: (identity: TenantIdentity) => void;
}

const STORAGE_KEY = 'rent-ruby:tenant';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TenantPortalLanding = ({ units, onComplete }: TenantPortalLandingProps) => {
  const [unit, setUnit] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channels, setChannels] = useState({ email: true, sms: false, push: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitRows = useMemo(() => {
    // 6 units per floor, matching the existing mailbox grid layout.
    const rows: string[][] = [];
    for (let i = 0; i < units.length; i += 6) {
      rows.push(units.slice(i, i + 6));
    }
    return rows;
  }, [units]);

  const canSubmit =
    !!unit &&
    EMAIL_RX.test(email.trim()) &&
    (channels.email || channels.sms || channels.push) &&
    (!channels.sms || phone.trim().length >= 7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!unit) {
      setError('Pick your apartment number to continue.');
      return;
    }
    if (!EMAIL_RX.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!channels.email && !channels.sms && !channels.push) {
      setError('Choose at least one notification channel.');
      return;
    }
    if (channels.sms && phone.trim().length < 7) {
      setError('Add a phone number for SMS notifications, or turn SMS off.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        unit,
        email: email.trim().toLowerCase(),
        phone: channels.sms ? phone.trim() : null,
        notifications: channels,
        subscribedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'tenantSubscriptions', unit), payload, { merge: true });

      const identity: TenantIdentity = {
        unit,
        email: email.trim().toLowerCase(),
        notifications: channels,
        subscribedAt: Date.now(),
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
      } catch {
        // localStorage may be unavailable (Safari private mode) — proceed in-memory only.
      }
      onComplete(identity);
    } catch (err) {
      console.error('Tenant subscription failed:', err);
      setError(
        'We could not save your subscription. Check your connection and try again, or pick a different channel.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[800px] rounded-[4rem] overflow-hidden shadow-2xl bg-[#0B1A2D]">
      {/* Hand-drawn Oakland skyline / Bay sketch — fully inline SVG so the
          hero never depends on a remote image and degrades gracefully on
          slow networks. Subjects, left to right: Cathedral of Christ the
          Light, Tribune Tower (with the iconic clock), Kaiser building
          slab, Lake Merritt necklace of lights, and the Bay Bridge
          eastern span silhouette. */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <OaklandHeroSketch />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1A2D] via-[#0B1A2D]/70 to-transparent" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[800px]">
        {/* Left: Hero / heritage panel */}
        <div className="lg:col-span-3 p-12 lg:p-16 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-app-accent text-white text-[10px] font-bold uppercase tracking-[0.3em]">
              <span>EST. 1924</span>
              <span className="opacity-50">//</span>
              <span>OAKLAND 94609</span>
            </div>
            <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-white">
              Welcome <br />
              <span className="text-app-accent italic font-serif">Home, Ruby.</span>
            </h1>
            <p className="mt-6 max-w-md text-white/70 text-lg leading-relaxed">
              The Tenant Portal is private to residents of 3875 Ruby Street. Activate your unit
              below to start receiving rent reminders, building notices, and maintenance updates
              by email, SMS, or push.
            </p>
          </div>

          {/* Heritage marker — Gertrude Stein nod, flipped. She grew up
              just down 13th Avenue and famously said "there is no there
              there" about Oakland. We disagree. */}
          <div className="mt-12 max-w-md">
            <div className="text-[10px] font-bold text-app-accent uppercase tracking-[0.4em] mb-3">
              94609 // Heritage
            </div>
            <blockquote className="text-2xl font-serif italic text-white/90 leading-snug">
              “There <span className="text-app-accent not-italic font-black">IS</span> a there
              here.”
            </blockquote>
            <div className="mt-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              With apologies, and a wink, to Gertrude Stein — Pill Hill, Mosswood, Temescal.
            </div>
          </div>
        </div>

        {/* Right: Sign-up form */}
        <div className="lg:col-span-2 bg-[#0B1A2D]/95 backdrop-blur-2xl p-10 lg:p-12 border-l border-white/10 flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-grow">
            <header>
              <div className="text-[10px] font-bold text-app-accent uppercase tracking-[0.3em] mb-2">
                Resident Sign-In
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                Activate Your Unit
              </h2>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">
                Apartment number only — we never ask for your name on this screen. Your unit is
                your login.
              </p>
            </header>

            {/* Unit picker */}
            <fieldset>
              <legend className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                Step 1 — Pick your apartment
              </legend>
              <div className="space-y-2">
                {unitRows.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-6 gap-2">
                    {row.map((u) => {
                      const selected = unit === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          aria-pressed={selected}
                          className={`py-2 rounded-xl border text-xs font-black tracking-tight transition-all ${
                            selected
                              ? 'bg-app-accent border-app-accent text-white shadow-[0_0_20px_rgba(255,95,31,0.35)] scale-105'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          {u}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Contact */}
            <fieldset>
              <legend className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                Step 2 — Where should we reach you?
              </legend>
              <label className="block">
                <span className="sr-only">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-app-accent/60 focus:bg-white/10 transition-colors"
                  />
                </div>
              </label>
              {channels.sms && (
                <label className="block mt-3">
                  <span className="sr-only">Mobile phone for SMS</span>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="(510) 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-app-accent/60 focus:bg-white/10 transition-colors"
                    />
                  </div>
                </label>
              )}
            </fieldset>

            {/* Channels */}
            <fieldset>
              <legend className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                Step 3 — Notification channels
              </legend>
              <div className="grid grid-cols-3 gap-2">
                <ChannelToggle
                  label="Email"
                  icon={<Mail className="w-4 h-4" />}
                  active={channels.email}
                  onChange={(v) => setChannels((c) => ({ ...c, email: v }))}
                />
                <ChannelToggle
                  label="SMS"
                  icon={<MessageSquare className="w-4 h-4" />}
                  active={channels.sms}
                  onChange={(v) => setChannels((c) => ({ ...c, sms: v }))}
                />
                <ChannelToggle
                  label="Push"
                  icon={<Bell className="w-4 h-4" />}
                  active={channels.push}
                  onChange={(v) => setChannels((c) => ({ ...c, push: v }))}
                />
              </div>
            </fieldset>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-auto space-y-3">
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-app-accent text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-app-accent/30 hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>Activating…</>
                ) : (
                  <>
                    Activate Unit {unit ?? '—'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                <span>We don't ask for your name. Unsubscribe any time from Notifications.</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ChannelToggleProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onChange: (next: boolean) => void;
}

const ChannelToggle = ({ label, icon, active, onChange }: ChannelToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    onClick={() => onChange(!active)}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
      active
        ? 'bg-app-accent/15 border-app-accent/60 text-white'
        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
    }`}
  >
    <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${active ? 'bg-app-accent text-white' : 'bg-white/10'}`}>
      {active ? <CheckCircle2 className="w-4 h-4" /> : icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

/**
 * Hand-drawn-feeling SVG of the Oakland skyline against a dawn Bay sky.
 * Left → right: Cathedral of Christ the Light, Tribune Tower (with its
 * iconic clock), Kaiser HQ slab, Lake Merritt's "necklace of lights",
 * and the Bay Bridge eastern-span tower silhouette.
 *
 * Everything is geometric SVG primitives so it works offline and at any
 * size. The animated dot above the lake is the famous Lake Merritt "Our
 * Lady of the Lake" sailboat reflection — call it a wink.
 */
const OaklandHeroSketch = () => (
  <svg
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="ruby-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a2b4a" />
        <stop offset="55%" stopColor="#2a1810" />
        <stop offset="100%" stopColor="#0B1A2D" />
      </linearGradient>
      <radialGradient id="ruby-sun" cx="0.78" cy="0.32" r="0.18">
        <stop offset="0%" stopColor="#FF5F1F" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#FF5F1F" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ruby-bay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0B1A2D" />
        <stop offset="100%" stopColor="#020812" />
      </linearGradient>
    </defs>

    {/* Sky + dawn glow */}
    <rect width="1200" height="800" fill="url(#ruby-sky)" />
    <rect width="1200" height="800" fill="url(#ruby-sun)" />

    {/* Background hills (Oakland Hills) */}
    <path
      d="M0 520 C 150 470 280 500 420 480 C 560 460 700 510 840 490 C 980 470 1100 500 1200 485 L 1200 800 L 0 800 Z"
      fill="#0a0f1a"
      opacity="0.9"
    />

    {/* Mid-distance ridge */}
    <path
      d="M0 580 C 200 555 360 575 520 560 C 680 545 820 580 980 565 C 1100 555 1200 575 1200 575 L 1200 800 L 0 800 Z"
      fill="#070d18"
    />

    {/* Skyline — left cluster (Cathedral of Christ the Light: faceted glass tent) */}
    <g transform="translate(120 0)">
      <path d="M0 580 L 60 460 L 120 580 Z" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1.5" opacity="0.95" />
      <line x1="60" y1="460" x2="60" y2="580" stroke="#FF5F1F" strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="520" x2="90" y2="520" stroke="#FF5F1F" strokeWidth="0.5" opacity="0.3" />
    </g>

    {/* Tribune Tower with iconic clock */}
    <g transform="translate(310 0)">
      <rect x="0" y="430" width="50" height="150" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1.5" />
      <rect x="-8" y="400" width="66" height="35" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1.5" />
      {/* Clock face */}
      <circle cx="25" cy="418" r="9" fill="none" stroke="#FF5F1F" strokeWidth="1.5" />
      <line x1="25" y1="418" x2="25" y2="412" stroke="#FF5F1F" strokeWidth="1.2" />
      <line x1="25" y1="418" x2="30" y2="418" stroke="#FF5F1F" strokeWidth="1.2" />
      {/* Spire */}
      <path d="M25 400 L 25 360 L 28 370 L 22 370 Z" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1.5" />
      <circle cx="25" cy="358" r="2" fill="#FF5F1F" />
      {/* "TRIBUNE" lit letters — abstract */}
      <line x1="-2" y1="500" x2="52" y2="500" stroke="#FF5F1F" strokeWidth="0.5" opacity="0.4" />
      <text x="25" y="498" textAnchor="middle" fill="#FF5F1F" fontSize="6" fontWeight="900" letterSpacing="1" opacity="0.7">
        TRIBUNE
      </text>
    </g>

    {/* Kaiser slab — wide rectangle, gridded windows */}
    <g transform="translate(440 0)">
      <rect x="0" y="380" width="140" height="200" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1.2" opacity="0.85" />
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 8 }).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={6 + c * 16}
            y={388 + r * 22}
            width="10"
            height="14"
            fill={(r + c) % 5 === 0 ? '#FF5F1F' : 'transparent'}
            opacity={(r + c) % 5 === 0 ? 0.5 : 0}
            stroke="#FF5F1F"
            strokeWidth="0.3"
            strokeOpacity="0.25"
          />
        )),
      )}
    </g>

    {/* Generic downtown towers */}
    <g transform="translate(620 0)">
      <rect x="0" y="420" width="40" height="160" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1" opacity="0.8" />
      <rect x="50" y="450" width="30" height="130" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1" opacity="0.7" />
      <rect x="90" y="400" width="55" height="180" fill="#0B1A2D" stroke="#FF5F1F" strokeWidth="1" opacity="0.85" />
      <polygon points="117.5,400 117.5,380 122.5,388 112.5,388" fill="#FF5F1F" opacity="0.7" />
    </g>

    {/* Bay Bridge eastern-span silhouette — right side */}
    <g transform="translate(820 0)">
      {/* Tower */}
      <line x1="120" y1="320" x2="120" y2="620" stroke="#FF5F1F" strokeWidth="2" opacity="0.7" />
      <line x1="115" y1="320" x2="115" y2="620" stroke="#FF5F1F" strokeWidth="2" opacity="0.7" />
      {/* Cables */}
      <path d="M0 600 C 60 460 120 320 120 320" stroke="#FF5F1F" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M240 600 C 180 460 120 320 120 320" stroke="#FF5F1F" strokeWidth="1" fill="none" opacity="0.5" />
      {[20, 50, 80, 110, 140, 170, 200, 230].map((x) => {
        const cableY = 600 - Math.abs(120 - x) * 1.7;
        return (
          <line
            key={x}
            x1={x}
            y1="610"
            x2={x}
            y2={cableY}
            stroke="#FF5F1F"
            strokeWidth="0.5"
            opacity="0.35"
          />
        );
      })}
      {/* Deck */}
      <rect x="-30" y="608" width="320" height="5" fill="#FF5F1F" opacity="0.6" />
    </g>

    {/* Bay water */}
    <rect x="0" y="620" width="1200" height="180" fill="url(#ruby-bay)" />

    {/* Lake Merritt necklace of lights — bottom-left foreground */}
    <g transform="translate(0 660)">
      <path
        d="M40 40 C 200 10 380 60 540 30 C 700 0 880 50 1040 25"
        stroke="#FF5F1F"
        strokeWidth="1"
        fill="none"
        opacity="0.45"
        strokeDasharray="1 14"
        strokeLinecap="round"
      />
    </g>

    {/* Lone sailboat — wink */}
    <g transform="translate(880 650)">
      <path d="M0 0 L 10 -24 L 18 0 Z" fill="#FF5F1F" opacity="0.7" />
      <line x1="10" y1="-24" x2="10" y2="6" stroke="#FF5F1F" strokeWidth="1" opacity="0.7" />
      <path d="M-4 6 L 22 6 L 18 12 L 0 12 Z" fill="#FF5F1F" opacity="0.7" />
    </g>

    {/* 94609 ZIP geo-marker, top-right */}
    <g transform="translate(1040 80)">
      <rect x="0" y="0" width="120" height="36" rx="2" fill="#FF5F1F" />
      <text x="60" y="23" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" letterSpacing="6">
        94609
      </text>
    </g>
  </svg>
);

export const readStoredTenantIdentity = (): TenantIdentity | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TenantIdentity>;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.unit === 'string' &&
      typeof parsed.email === 'string' &&
      parsed.notifications &&
      typeof parsed.notifications === 'object'
    ) {
      return parsed as TenantIdentity;
    }
    return null;
  } catch {
    return null;
  }
};

export const clearStoredTenantIdentity = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
