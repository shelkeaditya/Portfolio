import { useEffect, useMemo, useRef, useState } from "react";
import {
  Instagram,
  Linkedin,
  Github,
  Flag,
  Gamepad2,
  Mail,
  MapPin,
  Download,
  Moon,
  Sun,
  User,
  FileText,
  Briefcase,
  Send,
  ExternalLink,
  ShieldCheck,
  Award,
  Cloud,
  Container,
  Terminal,
  Lock,
  Code2,
  CheckCircle2,
  GraduationCap,
  CircleCheck,
  Clock3,
  FolderKanban,
  BadgeCheck,
  Bot,
  Workflow,
  Activity,
  Link,
  ChevronDown,
  Zap,
  Globe,
  Monitor,
  MessageSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import emailjs from "@emailjs/browser";
import profileImg from "/r2/images/profile.jpeg" ;
import { on } from "events";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type SectionKey = "about" | "resume" | "portfolio" | "infra" | "contact" | "journey";
type PortfolioFilter = "All" | "Projects" | "Certifications" | "Publications" | "Badges";

// ═══════════════════════════════════════════════════════════
// HOOK - Theme
// Single source of truth for both the desktop slider and the
// mobile icon button. Initialized synchronously (lazy useState
// initializer) from localStorage / system preference so the
// correct icon is present on the very first render — no flash,
// no post-mount reset to a hardcoded default.
// ═══════════════════════════════════════════════════════════

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // localStorage unavailable (privacy mode, etc.) — fall through to system preference
  }
  return "dark";
}
function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => getInitialTheme());

  // Keep the `dark` class in sync (covers the initial value too, in case
  // something else touched the class before this hook mounted).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Persist the theme choice whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore write failures (privacy mode, etc.)
    }
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggle };
}

// ═══════════════════════════════════════════════════════════
// COMPONENT - ThemeToggleDesktop (premium sliding pill switch)
// Used on md: and above.
// ═══════════════════════════════════════════════════════════

function ThemeToggleDesktop({
  theme,
  toggle,
  className,
}: {
  theme: "dark" | "light";
  toggle: () => void;
  className?: string;
}) {
  const isDark = theme === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [justSwitched, setJustSwitched] = useState(false);
  const prevTheme = useRef(theme);

  useEffect(() => {
    if (prevTheme.current !== theme) {
      prevTheme.current = theme;
      setJustSwitched(true);
      const t = setTimeout(() => setJustSwitched(false), 500);
      return () => clearTimeout(t);
    }
  }, [theme]);

  const releasePress = () => setIsPressed(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        releasePress();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={releasePress}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") setIsPressed(true);
      }}
      onKeyUp={releasePress}
      onBlur={releasePress}
      className={cn(
        "theme-toggle-track relative inline-flex h-9 w-[104px] shrink-0 items-center rounded-full border outline-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--accent-blue)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark ? "border-border/50" : "",
        className,
      )}
      style={{
        background: isDark ? "#171A22" : "#E7E0D3",
        borderColor: isDark ? undefined : "#DAD0BC",
        boxShadow: isHovered
          ? isDark
            ? "0 0 0 5px color-mix(in oklab, var(--accent-blue) 14%, transparent), inset 0 1px 3px rgba(0,0,0,0.35)"
            : "0 0 0 5px color-mix(in oklab, var(--accent-blue) 10%, transparent), inset 0 1px 2px rgba(0,0,0,0.06)"
          : isDark
            ? "inset 0 1px 3px rgba(0,0,0,0.4)"
            : "inset 0 1px 2px rgba(0,0,0,0.05)",
        transition: "background-color 380ms ease, border-color 380ms ease, box-shadow 250ms ease-out",
      }}
    >
      {/* Tiny stars — dark mode only */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full transition-opacity duration-300"
        style={{ opacity: isDark ? 1 : 0 }}
      >
        <span className="theme-toggle-star" style={{ top: "18px", left: "9px", animationDelay: "0.2s" }} />
        <span className="theme-toggle-star" style={{ top: "21px", left: "15px", animationDelay: "1.1s" }} />
        <span className="theme-toggle-star" style={{ top: "12px", left: "23px", animationDelay: "2.0s" }} />
      </span>

      {/* Knob */}
      <span
        aria-hidden
        className="absolute top-1 flex h-7 w-7 items-center justify-center rounded-full"
        style={{
          left: isDark ? "4px" : "70px",
          transform: `translateY(${isHovered && !isPressed ? "-1px" : "0px"}) scale(${isPressed ? 0.96 : 1})`,
          background: isDark ? "#232733" : "#FFF8EE",
          boxShadow: isDark
            ? "0 2px 6px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 2px 6px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.02)",
          transition:
            "left 340ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 380ms ease",
        }}
      >
        <Moon
          className="absolute h-4 w-4 text-slate-300"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(100deg) scale(1)",
            transition: "opacity 260ms ease-out, transform 300ms ease-out",
          }}
        />
        <Sun
          className="absolute h-4 w-4"
          style={{
            color: "#E89A2B",
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(-100deg) scale(0.5)" : "rotate(0deg) scale(1)",
            transition: "opacity 260ms ease-out, transform 300ms ease-out",
          }}
        />

        {/* Brief sun-ray pulse right after switching to light */}
        {!isDark && justSwitched && (
          <span aria-hidden className="theme-toggle-rays pointer-events-none absolute inset-0 rounded-full" />
        )}
      </span>

      <style>{`
        @keyframes theme-toggle-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.85; transform: scale(1); }
        }
        .theme-toggle-star {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.75);
          animation: theme-toggle-twinkle 3.4s ease-in-out infinite;
        }
        @keyframes theme-toggle-ray-pulse {
          0% { opacity: 0; transform: scale(0.6); }
          45% { opacity: 0.7; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        .theme-toggle-rays {
          background: radial-gradient(circle, rgba(232, 154, 43, 0.35) 0%, transparent 70%);
          animation: theme-toggle-ray-pulse 0.55s ease-out;
        }
      `}</style>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT - ThemeToggleMobile (condensed circular icon button)
// Used below md:. Same visual language and timing as the desktop
// slider's knob, but as a single ~44x44 tap target.
//
// Performance notes:
// - Hover/press states are handled with CSS :hover / :active
//   instead of onMouseEnter/onMouseDown React state, so there are
//   no re-renders on pointer interaction — important on low-end
//   mobile devices.
// - Only transform, opacity, background-color, border-color and
//   box-shadow are ever transitioned (all GPU/compositor-friendly).
//   No `transition: all`, no layout-triggering properties (no
//   `left`, `width`, `top`, etc.).
// - Hover glow is scoped to `@media (hover: hover) and (pointer: fine)`
//   so touchscreens never get a "sticky hover" after tapping.
// ═══════════════════════════════════════════════════════════

function ThemeToggleMobile({
  theme,
  toggleTheme,
  className,
}: {
  theme: "dark" | "light";
  toggleTheme: () => void;
  className?: string;
}) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className={cn(
        "theme-toggle-mobile-btn relative inline-flex h-11 w-11 items-center justify-center rounded-full border outline-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--accent-blue)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark ? "border-border/50" : "",
        className,
      )}
      style={{
        background: isDark ? "#232733" : "#FFF8EE",
        borderColor: isDark ? undefined : "#E3D9C4",
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)"
          : "0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)",
      }}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Moon
          className="theme-toggle-mobile-icon absolute h-5 w-5 text-slate-300"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(100deg) scale(0.5)",
          }}
        />
        <Sun
          className="theme-toggle-mobile-icon absolute h-5 w-5"
          style={{
            color: "#E89A2B",
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(-100deg) scale(0.5)" : "rotate(0deg) scale(1)",
          }}
        />
      </span>
      <style>{`
        .theme-toggle-mobile-btn {
          transition:
            background-color 320ms ease,
            border-color 320ms ease,
            box-shadow 200ms ease-out,
            transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform;
        }
        .theme-toggle-mobile-btn:active {
          transform: scale(0.92);
        }
        @media (hover: hover) and (pointer: fine) {
          .theme-toggle-mobile-btn:hover {
            transform: translateY(-1px);
            box-shadow:
              0 0 0 5px color-mix(in oklab, var(--accent-blue) 12%, transparent),
              0 2px 8px rgba(0, 0, 0, 0.3);
          }
          .theme-toggle-mobile-btn:hover:active {
            transform: translateY(-1px) scale(0.92);
          }
        }
        .theme-toggle-mobile-icon {
          transition: opacity 260ms ease-out, transform 300ms ease-out;
          will-change: transform, opacity;
        }
      `}</style>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// PRIMITIVES - Shared UI building blocks
// ═══════════════════════════════════════════════════════════

function SectionHeading({ title }: { title: string }) {
  const hasDot = title.endsWith(".");
  const base = hasDot ? title.slice(0, -1) : title;
  return (
    <div className="mb-8">
      <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">
        {base}
        {hasDot && <span className="text-accent-violet">.</span>}
      </h2>
      <span className="heading-bar mt-3">
        <span />
        <span />
      </span>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-foreground/5"
    >
      <Icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-[#4F8CFF]" />
    </a>
  );
}

function IconButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-foreground/5"
    >
      <Icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-[#4F8CFF]" />
    </button>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <span className="surface-3 rounded-md border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}

function VerticalSlide({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const current = indexRef.current;
      const next = (current + 1) % words.length;
      setPrevIndex(current);
      setIndex(next);
      indexRef.current = next;
    }, 2500);

    return () => clearInterval(id);
  }, [words.length]);

  return (
    <div className="relative h-6 md:h-7 overflow-hidden">
      {words.map((word, i) => (
        <div
          key={word}
          className="absolute inset-0 flex items-center whitespace-nowrap transition-all duration-700 ease-in-out text-sm md:text-lg font-medium text-muted-foreground"
          style={{
            transform:
              i === index ? "translateY(0)" : i === prevIndex ? "translateY(100%)" : "translateY(-100%)",
            opacity: i === index ? 1 : 0,
          }}
        >
          {word}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// COMPONENT - BackgroundFX
// ═════════════════════════════════════════════════════════════

function BackgroundFX() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-texture opacity-40" />

      {/* ── Decorative corner triangles ── */}
      <div className="poly-bg-left">
        <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 165,0 0,165" fill="#7C3AED" opacity="0.80" />
          <polygon points="165,0 215,0 0,215 0,165" fill="#BE123C" opacity="0.65" />
          <polygon points="215,0 260,0 0,260 0,215" fill="#7C3AED" opacity="0.32" />
          <polygon points="260,0 300,0 0,300 0,260" fill="#BE123C" opacity="0.16" />
          <polygon points="300,0 335,0 0,335 0,300" fill="#7C3AED" opacity="0.08" />
          <defs>
            <linearGradient id="fxL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="40%" stopColor="var(--background)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="fyL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="40%" stopColor="var(--background)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="420" height="420" fill="url(#fxL)" />
          <rect width="420" height="420" fill="url(#fyL)" />
        </svg>
      </div>

      <div className="poly-bg-right">
        <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
          <polygon points="420,420 255,420 420,255" fill="#7C3AED" opacity="0.70" />
          <polygon points="255,420 205,420 420,205 420,255" fill="#5B21B6" opacity="0.55" />
          <polygon points="205,420 162,420 420,162 420,205" fill="#7C3AED" opacity="0.28" />
          <polygon points="162,420 124,420 420,124 420,162" fill="#5B21B6" opacity="0.14" />
          <polygon points="124,420 90,420  420,90  420,124" fill="#7C3AED" opacity="0.07" />
          <defs>
            <linearGradient id="fxR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="40%" stopColor="var(--background)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="fyR" x1="0" y1="1" x2="0" y2="0">
              <stop offset="40%" stopColor="var(--background)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--background)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="420" height="420" fill="url(#fxR)" />
          <rect width="420" height="420" fill="url(#fyR)" />
        </svg>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT - ProfileHero
//   col-1 : photo + name + role + handle
//   col-2 : system status block
//   col-3 : Download CV + email + social icons
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// COMPONENT - CV modal (in-page PDF viewer)
// Mirrors the certificate modal's visual language (dark surface,
// rounded corners, subtle border, close button, blurred backdrop,
// title bar at the bottom) so the CV opens inside the portfolio
// instead of redirecting to Google Drive.
// ═══════════════════════════════════════════════════════════

function CvModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Curriculum Vitae"
        onClick={(e) => e.stopPropagation()}
        className="surface-2 relative flex h-[min(90vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[color:var(--accent-blue)]/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 bg-black/20 p-3 sm:p-5">
          <iframe
            src="/r2/aditya-shelke-cv.pdf"
            title="Aditya Shelke — CV"
            className="h-full w-full rounded-lg bg-white shadow-inner"
          />
        </div>

        <div className="border-t border-border/60 p-5">
          <h3 className="text-lg font-semibold text-foreground">Curriculum Vitae</h3>
        </div>
      </div>
    </div>
  );
}

function ProfileHero({
  onJourney,
  theme,
  toggleTheme,
}: {
  onJourney: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  return (
    <>
    <section className="relative">
      <div className="surface-2 relative overflow-hidden rounded-2xl border border-border/60 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
        {/* Mobile theme toggle — condensed circular button, shares theme state with the desktop slider */}
        <ThemeToggleMobile
          theme={theme}
          toggleTheme={toggleTheme}
          className="absolute top-3 right-3 z-20 md:hidden"
        />

        {/* ── 3-column row ── */}
        <div className="relative flex flex-col px-6 py-5 md:flex-row md:items-stretch md:gap-0 md:px-8 md:py-5">
          {/* ── COL 1 - Photo + name + role + mobile chevron ── */}
          <div className="flex flex-col justify-center md:flex-1 md:pr-8 md:border-r md:border-border/50">
            <div className="flex items-center gap-4 min-w-0">
              <div className="group relative shrink-0">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "color-mix(in oklab, var(--accent-orange) 40%, transparent)",
                  }}
                />

                <img
                  src="/r2/images/profile.jpeg"
                  alt="Aditya Shelke"
                  className="relative h-20 w-20 md:h-24 md:w-24 rounded-xl object-cover ring-2 ring-[color:var(--accent-orange)]/70 transition-all duration-300 group-hover:ring-[color:var(--accent-orange)]"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                  Aditya <span className="font-light text-muted-foreground">Shelke</span>
                </h1>
                <div className="mt-0.5 h-6 md:h-5">
                  <VerticalSlide words={["DevOps Engineer", "Cloud Architect"]} />
                </div>
              </div>
            </div>

            {/* Mobile-only horizontal line + expand/collapse chevron */}
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Collapse details" : "Expand details"}
              aria-expanded={expanded}
              className="md:hidden mt-4 flex w-full items-center gap-3"
            >
              <span aria-hidden className="h-px flex-1 bg-border/60" />
              <span className="absolute right-0 flex h-7 w-12 items-center justify-center rounded-lg bg-[var(--surface-2,inherit)] text-muted-foreground">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-10",
                    expanded && "rotate-180",
                  )}
                />
              </span>
            </button>
          </div>

          {/* ── COL 2 + COL 3 - collapsible on mobile, always visible on desktop ── */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-10 ease-in-out md:contents",
              expanded
                ? "max-h-[400px] opacity-100 mt-3 md:mt-0"
                : "max-h-0 opacity-0 md:opacity-100",
            )}
          >
            <div className="md:w-[32%] md:px-19 md:pt-7 md:border-r md:border-border/50">
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/60"></span>

                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Open to Work
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/60">Location :</span>
                    <span className="text-foreground/70">Pune, India</span>
                  </div>
                </div>

                <span className="block h-px bg-border/60" />

                <a
                  href="mailto:shelkeaditya@proton.me"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  shelkeaditya@proton.me
                </a>
                <div className="flex items-center justify-between">
                  <div className="shrink-0">
                    <div className="inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCvOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-background transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        CV
                      </button>
                      <div className="w-px bg-[color:var(--accent-blue)]/30" />
                      <a
                        href="/r2/aditya-shelke-cv.pdf"
                        download
                        aria-label="Download CV"
                        className="flex items-center pl-3 pr-3 py-2 text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-background transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="flex items-center gap-0.3"> 
                    <IconLink href="https://linkedin.com/in/shelkeaditya" icon={Linkedin} label="LinkedIn" />
                    <IconLink href="https://github.com/shelkeaditya" icon={Github} label="GitHub" />
                    <IconLink href="https://instagram.com/shelke__aditya" icon={Instagram} label="Instagram" />
                    <IconLink href="https://x.com/shelke__aditya" icon={XIcon} label="Twitter" />
                    <IconButton onClick={onJourney} icon={Flag} label="Journey" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Desktop */}
              <div className="hidden md:block">
                <div className="gap-1 font-mono text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-[72px] shrink-0 text-[11px] text-muted-foreground/50">
                      Job Status :
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-emerald-400 font-medium text-[13px]">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Open to Work
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-[72px] shrink-0 text-[11px] text-muted-foreground/50">
                      Time Zone :
                    </span>
                    <span className="text-[13px] text-foreground/70">GMT+5:30</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-[72px] shrink-0 text-[11px] text-muted-foreground/50">
                      Location :
                    </span>
                    <span className="text-[13px] text-foreground/70">Pune, India</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── COL 3 - Download CV + email + socials ── */}
            <div className="hidden md:flex flex-col gap-3 pt-0 md:flex-1 md:pl-8 md:items-end">
              <span aria-hidden className="h-px w-full bg-border/60 md:hidden" />
              {/* Download CV */}
              <div className="inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCvOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-background transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  View CV
                </button>
                <div className="w-px bg-[color:var(--accent-blue)]/30" />
                <a
                  href="/r2/aditya-shelke-cv.pdf"
                  download
                  aria-label="Download CV"
                  className="flex items-center pl-3 pr-3 py-2 text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-background transition-colors"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>

              {/* Email */}
              <a
                href="mailto:shelkeaditya@proton.me"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                shelkeaditya@proton.me
              </a>

              {/* Social icons + theme toggle */}
              <div className="flex items-center gap-0.3">
                <IconLink href="https://linkedin.com/in/shelkeaditya" icon={Linkedin} label="LinkedIn" />
                <IconLink href="https://github.com/shelkeaditya" icon={Github} label="GitHub" />
                <IconLink href="https://instagram.com/shelke__aditya" icon={Instagram} label="Instagram" />
                <IconLink href="https://x.com/shelke__aditya" icon={XIcon} label="Twitter" />
                <IconButton onClick={onJourney} icon={Flag} label="Journey" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {cvOpen && <CvModal onClose={() => setCvOpen(false)} />}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// CONSTANTS - Navigation
// ═════════════════════════════════════════════════════════════

const NAV: {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "about", label: "About", icon: User },
  { key: "resume", label: "Resume", icon: FileText },
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
  { key: "infra", label: "Build", icon: Workflow },
  { key: "contact", label: "Contact", icon: Send },
];

// ═══════════════════════════════════════════════════════════
// COMPONENT - NavPanel (desktop sidebar)
// ═══════════════════════════════════════════════════════════

function NavPanel({
  active,
  setActive,
  theme,
  toggleTheme,
}: {
  active: SectionKey;
  setActive: (s: SectionKey) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  return (
    <aside className="surface-1 sticky top-7 h-fit rounded-3xl border border-border/60 p-5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]">
      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "group relative flex items-center gap-2 rounded-2xl px-4 py-3.5 transition-all duration-300 ease-out",
                isActive
                  ? "bg-violet-500/10 text-violet-500 border-l-2 border-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                  : "text-muted-foreground hover:bg-foreground/8 hover:translate-x-1",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-violet-500/15 text-violet-300"
                    : "bg-transparent text-muted-foreground group-hover:bg-foreground/5",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left">{label}</span>
              {isActive && <span className="h-5 w-1 rounded-full bg-violet-500" aria-hidden />}
            </button>
          );
        })}
      </nav>

      <div className="my-3 h-px bg-border/60" />

      {/* Theme toggle — left-aligned to match the nav buttons' px-4 rhythm,
          with breathing room above/below rather than being centered. */}
      <div className="px-6 pt-2 pb-.5">
        <ThemeToggleDesktop theme={theme} toggle={toggleTheme} />
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - About
// ═══════════════════════════════════════════════════════════

function About() {
  return (
    <div>
      <SectionHeading title="About Me." />

      <div className="max-w-5xl space-y-5 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          I'm currently working as a Cloud & DevOps Engineering Intern while building cloud-native
          applications and infrastructure-focused projects in my free time. I enjoy applying what I
          learn to real-world projects and continuously expanding my knowledge of modern cloud
          technologies.
        </p>

        <p>
          My work revolves around designing cloud infrastructure, automating deployment pipelines,
          and building scalable systems. I enjoy working with Kubernetes, Docker, CI/CD,
          Infrastructure as Code, and cloud platforms to create reliable and secure solutions.
        </p>

        <p>
          What excites me most is building the systems behind modern applications. Whether it's
          provisioning infrastructure, automating deployments, or orchestrating containers, I enjoy
          solving the engineering challenges that make software reliable, scalable, and secure.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Cloud, label: "Cloud", value: "AWS • GCP • Azure" },
          { icon: Container, label: "DevOps", value: "Docker • Kubernetes • CI/CD" },
          { icon: Lock, label: "Security", value: "Linux • Networking • VAPT" },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-blue)]/25"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-5 w-5 text-accent-blue" />
              <div className="text-sm font-medium text-foreground">{label}</div>
            </div>
            <div className="text-xs text-muted-foreground">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - Resume (sub-components + section)
// ═══════════════════════════════════════════════════════════

function ResumeBlock({
  title,
  icon,
  children,
}: {
  title: string;
  accent?: "blue" | "purple";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function ResumeItem({
  heading,
  organization,
  year,
  location,
  description,
  points,
}: {
  heading: string;
  organization?: string;
  year: string;
  location: string;
  description?: string;
  points?: string[];
}) {
  return (
    <div className="surface-2 rounded-xl border border-border/60 p-5">
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-foreground sm:text-xl">{heading}</h4>
        {organization && <div className="text-base font-medium text-blue-400">{organization}</div>}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {location && (
            <>
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{location}</span>
              <span className="text-muted-foreground/50">·</span>
            </>
          )}
          <span>{year}</span>
        </div>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {points && points.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue" />
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SkillCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-blue)]/25">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent-blue" />
        <div className="text-sm font-medium text-foreground">{title}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span
            key={i}
            className="surface-3 rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

function Resume() {
  return (
    <div>
      <SectionHeading title="Resume." />
      <div className="space-y-10">
        <ResumeBlock
          title="Experience"
          accent="blue"
          icon={<Briefcase className="h-5 w-5 text-blue-400" />}
        >
          <ResumeItem
            heading="Cloud & DevOps Intern"
            organization="E-Sutra Technologies"
            year="Jun 2026 – Present"
            location="Remote"
            description="Working on real-world DevOps and cloud tasks including CI/CD pipeline management, infrastructure automation, and security practices in an Agile team environment."
            points={[
              "Managed end-to-end deployment of production applications across Linux-based cloud environments.",
              "Designed, built, and maintained CI/CD pipelines using Jenkins to automate build, quality checks, and deployment workflows.",
              "Provisioned and administered Oracle Cloud Infrastructure (OCI) virtual machines and deployment environments.",
              "Performed secure server administration and deployment activities using SSH on remote Linux servers.",
              "Integrated SonarQube into CI/CD pipelines to automate static code analysis and enforce quality gates before deployment.",
              "Containerized and deployed applications using Docker and Docker Compose for consistent production environments.",
              "Configured and maintained Nginx as a reverse proxy for application routing and production hosting.",
              "Executed deployment validation, monitored application health, analyzed logs, and resolved production deployment issues.",
              "Performed functional automation testing using Selenium and conducted performance testing with Apache JMeter as part of release validation.",
              "Collaborated with development teams to coordinate releases, troubleshoot deployment issues, and ensure reliable production deployments.",
            ]}
          />
          <div className="mt-4">
            <ResumeItem
              heading="Cloud Labs & Projects"
              year="Mar 2023 – Aug 2025"
              location=""
              description="Built and managed personal cloud and DevOps projects involving AWS services, Linux administration, containerisation, CI/CD workflows, and infrastructure automation."
              points={[
                "Deployed AWS EC2, S3, IAM, VPC, ELB, EKS, ECR, CloudWatch configurations",
                "Built CI/CD pipelines using GitHub Actions and Jenkins",
                "Practised Terraform for infrastructure-as-code",
                "Managed Linux servers - Debian, Ubuntu, Kali",
                "Containerised applications with Docker and orchestrated with Kubernetes",
              ]}
            />
          </div>
        </ResumeBlock>

        <ResumeBlock
          title="Education"
          accent="blue"
          icon={<GraduationCap className="h-5 w-5 text-violet-400" />}
        >
          <ResumeItem
            heading="B.Tech - Cloud Technology & Information Security"
            organization="Ajeenkya DY Patil University"
            year="Aug 2022 – May 2026"
            location="Pune, India"
          />
        </ResumeBlock>

        <ResumeBlock
          title="Skills"
          accent="purple"
          icon={<Award className="h-5 w-5 text-purple-400" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SkillCard icon={Cloud} title="Cloud" items={["AWS", "GCP", "Azure"]} />
            <SkillCard
              icon={Container}
              title="DevOps"
              items={["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "CI/CD"]}
            />
            <SkillCard
              icon={Terminal}
              title="Linux"
              items={["Bash", "Linux CLI", "SSH", "Ubuntu", "Debian", "Kali"]}
            />
            <SkillCard
              icon={ShieldCheck}
              title="Security"
              items={["Trivy", "SonarQube", "Vault", "Networking", "VAPT"]}
            />
            <SkillCard
              icon={Code2}
              title="Tools"
              items={["Git", "VS Code", "Postman", "Nginx", "Apache", "Cloudflare"]}
            />
            <SkillCard
              icon={Code2}
              title="Languages"
              items={["Python", "Bash / Shell", "Java", "JavaScript"]}
            />
          </div>
        </ResumeBlock>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CONSTANTS - Portfolio cards
// ═════════════════════════════════════════════════════════════

const CARDS: {
  category: Exclude<PortfolioFilter, "All">[];
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  buttons: { label: string; href: string }[];
  /** Optional badge/certificate image. When present, the card renders the
   *  image-first certificate layout instead of the default text card. */
  image?: string;
  /** Optional PDF (or larger image) opened inside the certificate modal.
   *  Falls back to `image` in the modal when omitted. */
  document?: string;
  /** Optional short title shown in the image-first card's dark title bar.
   *  Falls back to `title` when omitted. */
  imageLabel?: string;
  /** Optional metadata shown in the in-page certificate modal. */
  certDetails?: { issued: string; expires: string; issuedBy: string };
  /** Publications only: a large research-paper preview shown across the top
   *  of the card (certificate-card style). Independent of `image` so this
   *  never triggers the certificate-card (image-first) renderer — the
   *  publication keeps its own layout with title/subtitle/description/tags
   *  always visible below the image. */
  previewImage?: string;
  /** Publications only: the research paper PDF opened in the in-page modal
   *  via the "Read Paper" action. Independent of `image`/`document` so this
   *  never triggers the certificate-card renderer. */
  paperDocument?: string;
  /** Publications only: the published certificate image opened in the
   *  in-page modal via the "View Certificate" action. Independent of
   *  `image`/`document` so this never triggers the certificate-card renderer. */
  certificateDocument?: string;
}[] = [
  // ── Certifications ──────────────────────────────────────
  {
    category: ["Certifications", "Badges"],
    icon: <Award className="h-5 w-5 text-yellow-400" />,
    title: "AWS Certified Cloud Practitioner",
    subtitle: "Amazon Web Services · CLF-C02",
    description:
      "Foundational AWS certification validating cloud concepts, architecture, pricing, security, and core AWS services.",
    tech: ["AWS", "Cloud Concepts", "IAM", "EC2", "S3", "Pricing & Support"],
    buttons: [
      {
        label: "Credly Badge",
        href: "https://www.credly.com/badges/30a486c6-e52b-4250-a616-bc685ccf9f9c",
      },
    ],
    image: "/r2/Certificates/AWS.webp",
    imageLabel: "AWS Cloud Practitioner",
    certDetails: {
      issued: "April 8, 2026",
      expires: "April 8, 2029",
      issuedBy: "Amazon Web Services",
    },
  },
  {
    category: ["Certifications"],
    icon: <Award className="h-5 w-5 text-rose-400" />,
    title: "AutoCAD 3D Professional Certification",
    subtitle: "3D Modelling & Design",
    description:
      "Certification validating proficiency in 3D modelling, design workflows, and AutoCAD tools.",
    tech: ["AutoCAD", "3D Modelling"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing",
      },
    ],
    image: "/r2/Certificates/AutoCAD%203D%20Professional%20Certification.webp",
    document: "/r2/Certificates/AutoCAD%203D%20Professional%20Certification.pdf",
  },
  {
    category: ["Certifications"],
    icon: <Cloud className="h-5 w-5 text-blue-300" />,
    title: "AWS Certificate: Udemy",
    subtitle: "AWS Fundamentals",
    description:
      "Hands-on coursework covering core AWS services, deployment patterns, and cloud architecture fundamentals.",
    tech: ["AWS", "Cloud Computing"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing",
      },
    ],
    image: "/r2/Certificates/Udemy%20AWS%20Certificate-4.webp",
    document: "/r2/Certificates/Udemy%20AWS%20Certificate-4.pdf",
  },
  {
    category: ["Certifications", "Badges"],
    icon: <Terminal className="h-5 w-5 text-blue-400" />,
    title: "The Linux Foundation: LFD-103",
    subtitle: "A Beginner's Guide to Linux Kernel Development",
    description:
      "Foundational course covering Linux kernel architecture, development workflow, and contribution basics.",
    tech: ["Linux", "Kernel", "Open Source"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing",
      },
      {
        label: "Credly Badge",
        href: "https://www.credly.com/badges/5f324690-36b9-4b1b-9b6f-4d1e1a97dc5c/public_url",
      },
    ],
    image: "/r2/Certificates/The%20Linux%20Foundation%20%28LFD-103%29.webp",
    document: "/r2/Certificates/The%20Linux%20Foundation%20%28LFD-103%29.pdf",
  },

  // ── Projects ────────────────────────────────────────────
  {
    category: ["Projects"],
    icon: <ShieldCheck className="h-5 w-5 text-green-400" />,
    title: "DevSecOps Flask Platform",
    subtitle: "Secure CI/CD Application",
    description:
      "Flask application with integrated DevSecOps practices - containerised with Docker, scanned with Trivy & SonarQube, and deployed via GitHub Actions.",
    tech: ["Python", "Flask", "Docker", "GitHub Actions", "Trivy", "SonarQube"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/devsecops-flask" }],
  },
  {
    category: ["Projects"],
    icon: <Activity className="h-5 w-5 text-blue-400" />,
    title: "Resilient Server Monitoring Platform",
    subtitle: "Infrastructure Monitoring",
    description:
      "Monitoring platform that tracks server health, CPU/memory metrics, and system availability with alerting for reliable infra management.",
    tech: ["Linux", "Python", "Bash", "Networking", "Nginx"],
    buttons: [
      {
        label: "GitHub",
        href: "https://github.com/shelkeaditya/Resilient-Server-Monitoring-Platform",
      },
    ],
  },
  {
    category: ["Projects"],
    icon: <Workflow className="h-5 w-5 text-blue-400" />,
    title: "CI/CD Platform",
    subtitle: "Automation Pipeline",
    description:
      "End-to-end automated build, test, and deployment pipeline that streamlines software delivery and infrastructure provisioning.",
    tech: ["GitHub Actions", "Docker", "Jenkins", "Linux", "Shell Scripting"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/CICD-Platform" }],
  },
  {
    category: ["Projects"],
    icon: <Bot className="h-5 w-5 text-cyan-400" />,
    title: "AI-Based Backup Management",
    subtitle: "Intelligent Backup Automation",
    description:
      "Backup management solution using Python automation for scheduling, recovery planning, and efficient data protection workflows.",
    tech: ["Python", "Linux", "Bash", "Cron", "Automation"],
    buttons: [
      { label: "GitHub", href: "https://github.com/shelkeaditya/Ai-based-backup-management" },
    ],
  },
  {
    category: ["Projects"],
    icon: <Cloud className="h-5 w-5 text-sky-400" />,
    title: "Nextcloud on Linux",
    subtitle: "Self-Hosted Private Cloud",
    description:
      "Deployed and configured Nextcloud on a Linux server for secure self-hosted file sharing, storage, and team collaboration.",
    tech: ["Linux", "Nextcloud", "Docker", "Nginx", "Networking"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/Nextcloud-on-Linux" }],
  },

  // ── Publications ─────────────────────────────────────────
  {
    category: ["Publications"],
    icon: <FileText className="h-5 w-5 text-indigo-400" />,
    title: "Connect2Cure: A Telemedicine Platform",
    subtitle: "Published on IRJET",
    description:
      "Co-authored and published a peer-reviewed research paper in IRJET, an established engineering and technology journal.",
    tech: ["Research", "Academic Writing"],
    buttons: [],
    // R2 object keys (portfolio-assets/Research Paper/...) served through the
    // existing /r2/ Worker route. Spaces/parentheses are percent-encoded
    // once, matching the convention already used for the certificate PDFs
    // above (e.g. "The%20Linux%20Foundation%20%28LFD-103%29.pdf").
    previewImage:
      "/r2/Research%20Paper/Connect2Cure%20Research%20Paper%20%28IRJET%29-1.webp",
    paperDocument: "/r2/Research%20Paper/Connect2Cure%20Research%20Paper%20%28IRJET%29.pdf",
    certificateDocument:
      "/r2/Research%20Paper/Connect2Cure%20Research%20Paper%20Published%20Certificate%20%28IRJET%29.jpg",
  },
];


// ═══════════════════════════════════════════════════════════
// HELPERS - Category hover accent
// ═══════════════════════════════════════════════════════════

type CardAccent = "orange" | "yellow" | "blue";

/** Certification-tagged cards get the orange accent; badge-only cards get
 *  yellow; everything else (projects, publications) gets blue. Cards are
 *  neutral by default and only pick up their accent color on hover. */
function getCardAccent(categories: Exclude<PortfolioFilter, "All">[]): CardAccent {
  if (categories.includes("Certifications")) return "orange";
  if (categories.includes("Badges")) return "yellow";
  return "blue";
}

const ACCENT_HOVER_CLASSES: Record<CardAccent, string> = {
  // Border-only accent on hover — no colored glow/box-shadow for any
  // category. Elevation/shadow is handled separately (CARD_ELEVATION_CLASSES)
  // and is identical across all cards regardless of accent color.
  orange: "hover:border-[color:var(--accent-orange)]/60",
  yellow: "hover:border-yellow-400/60",
  blue: "hover:border-[color:var(--accent-blue)]/40",
};

const ACCENT_BORDER_CLASSES: Record<CardAccent, string> = {
  orange: "border-[color:var(--accent-orange)]/50",
  yellow: "border-yellow-400/50",
  blue: "border-[color:var(--accent-blue)]/40",
};

/** Shared elevation/lift interaction applied identically to every portfolio
 *  card (Projects, Certifications, Badges, Publications) so the hover
 *  behaviour feels like one cohesive design system. Subtle resting shadow,
 *  a small lift + slightly stronger neutral shadow on hover — never a
 *  colored glow. Combine with ACCENT_HOVER_CLASSES for the category border. */
const CARD_ELEVATION_CLASSES =
  "shadow-[0_2px_10px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_35px_-15px_rgba(0,0,0,0.55)]";

// ═══════════════════════════════════════════════════════════
// COMPONENT - Certificate modal (in-page, image-first cards)
// ═══════════════════════════════════════════════════════════

function CertificateModal({
  card,
  onClose,
}: {
  card: (typeof CARDS)[number];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Prefer an official verification link (e.g. Credly) if one exists.
  const verifyHref = card.buttons.find((b) => b.href.includes("credly.com"))?.href;
  const accent = getCardAccent(card.category);
  const isPdf =
    Boolean(card.document?.toLowerCase().endsWith(".pdf")) && !card.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "surface-2 relative flex w-full flex-col overflow-hidden rounded-2xl border shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]",
          isPdf
            ? "h-[min(90vh,920px)] max-w-5xl"
            : card.document
              ? "max-w-4xl"
              : "max-w-lg",
          ACCENT_BORDER_CLASSES[accent],
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        {isPdf ? (
          <div className="min-h-0 flex-1 bg-black/20 p-3 sm:p-5">
            <iframe
              src={card.document}
              title={card.title}
              className="h-full w-full rounded-lg bg-white shadow-inner"
            />
          </div>
        ) : (
          (card.image ?? card.document) && (
            <div className="flex items-center justify-center bg-black/20 p-8 sm:p-10">
              <img
                src={card.image ?? card.document}
                alt={card.title}
                className={cn(
                  "w-auto max-w-full object-contain",
                  card.document ? "max-h-[80vh]" : "max-h-[70vh]",
                )}
              />
            </div>
          )
        )}

        <div className="border-t border-border/60 p-5">
          <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>

          {card.certDetails && (
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Issued</dt>
                <dd className="text-foreground">{card.certDetails.issued}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Expires</dt>
                <dd className="text-foreground">{card.certDetails.expires}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Issued by</dt>
                <dd className="text-foreground">{card.certDetails.issuedBy}</dd>
              </div>
            </dl>
          )}

          {verifyHref && (
            <a
              href={verifyHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 px-3 py-1.5 text-xs font-medium text-accent-blue transition-colors hover:bg-[color:var(--accent-blue)]/15"
            >
              Verify on Credly
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - Portfolio
// ═══════════════════════════════════════════════════════════

function PortfolioSection() {
  const [filter, setFilter] = useState<PortfolioFilter>("All");
  const [activeCert, setActiveCert] = useState<(typeof CARDS)[number] | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? CARDS : CARDS.filter((c) => c.category.includes(filter))),
    [filter],
  );

  const filters: PortfolioFilter[] = [
    "All",
    "Projects",
    "Certifications",
    "Badges",
    "Publications",
  ];

  return (
    <div>
      <SectionHeading title="Portfolio." />

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 text-accent-violet"
                : "surface-2 border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((c) =>
          c.image ? (
            // ── Image-first certificate card ──────────────────
            <div
              key={c.title}
              className={cn(
                "surface-2 group flex flex-col overflow-hidden rounded-xl border border-border/60",
                CARD_ELEVATION_CLASSES,
                ACCENT_HOVER_CLASSES[getCardAccent(c.category)],
              )}
            >
              <button
                type="button"
                onClick={() => setActiveCert(c)}
                aria-label={`View ${c.imageLabel ?? c.title} certificate`}
                className="group/img relative block aspect-[4/3] w-full overflow-hidden bg-black/20"
              >
                <span className="surface-3 absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                  🏆 {c.category[0]}
                </span>
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-contain p-6"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover/img:bg-black/60 group-hover/img:opacity-100">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    View Certificate
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
              <div className="surface-3 border-t border-border/60 px-4 py-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {c.imageLabel ?? c.title}
                </h4>
              </div>
            </div>
          ) : c.category.includes("Publications") ? (
            // ── Publication card (independent of certificate renderer) ──
            <div
              key={c.title}
              className={cn(
                "surface-2 group flex flex-col overflow-hidden rounded-xl border border-border/60",
                CARD_ELEVATION_CLASSES,
                ACCENT_HOVER_CLASSES.blue,
              )}
            >
              {/* Compact research-paper preview — recognizable but no longer dominates the card */}
              <div className="relative h-24 w-full shrink-0 overflow-hidden bg-black/20 sm:h-28">
                <span className="surface-3 absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                  📄 {c.category[0]}
                </span>
                {c.previewImage && (
                  <img
                    src={c.previewImage}
                    alt={c.title}
                    className="h-full w-full object-cover object-top"
                  />
                )}
                {/* Hover overlay with actions — image and content below stay visible */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/55 group-hover:opacity-100">
                  {c.paperDocument && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCert({
                          ...c,
                          title: `${c.title} — Research Paper`,
                          image: undefined,
                          document: c.paperDocument,
                          buttons: [],
                          certDetails: undefined,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-[color:var(--accent-blue)]/70 hover:bg-black/65"
                    >
                      Read Paper
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                  {c.certificateDocument && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCert({
                          ...c,
                          title: `${c.title} — Certificate`,
                          image: undefined,
                          document: c.certificateDocument,
                          buttons: [],
                          certDetails: undefined,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-[color:var(--accent-blue)]/70 hover:bg-black/65"
                    >
                      View Certificate
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title, subtitle, description, tags — always visible */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl shrink-0">{c.icon}</div>
                  <h4 className="text-base font-semibold text-foreground">{c.title}</h4>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.subtitle}</div>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                {c.tech.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.tech.map((t) => (
                      <TechBadge key={t} label={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ── Default card ────────────────────────────────
            <div
              key={c.title}
              className={cn(
                "surface-2 group flex flex-col rounded-xl border border-border/60 p-5",
                CARD_ELEVATION_CLASSES,
                ACCENT_HOVER_CLASSES.blue,
              )}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="text-3xl shrink-0">{c.icon}</div>
                  <h4 className="text-base font-semibold text-foreground">{c.title}</h4>
                </div>
                <span className="surface-3 max-w-[110px] shrink-0 rounded-md border border-border/60 px-2 py-0.5 text-right text-[10px] uppercase leading-tight tracking-wider text-muted-foreground">
                  {c.category.join(" / ")}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{c.subtitle}</div>

              {/* Description */}
              <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>

              {/* Tech stack */}
              {c.tech.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.tech.map((t) => (
                    <TechBadge key={t} label={t} />
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-auto pt-5 flex flex-wrap gap-2">
                {c.buttons.map((b, i) => (
                  <a
                    key={b.label}
                    href={b.href}
                    target={b.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                      i === 0
                        ? "border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 text-accent-blue hover:bg-[color:var(--accent-blue)]/15"
                        : "surface-3 border-border/60 text-foreground hover:border-border",
                    )}
                  >
                    {b.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          ),
        )}
      </div>

      {activeCert && (
        <CertificateModal card={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CONSTANTS - Infra Build data
// ═════════════════════════════════════════════════════════════

type InfraCategory = "build" | "runtime" | "observability" | "application" | "communication" | "client";

type InfraDetail = {
  purpose: string;
  technologies: string[];
  responsibilities: string[];
  relationships: string[];
  configuration?: string;
  buildProcess?: string;
  runtimeDetails?: string;
  futureImprovements?: string;
};

type InfraNode = {
  id: string;
  title: string;
  subtitle: string;
  meta: string; // short preview shown on the card itself
  items: string[]; // contents shown on the node card
  category: InfraCategory;
  icon: React.ComponentType<{ className?: string }>;
  size?: "md" | "lg";
  group?: "build" | "worker" | "observability" | "browser"; // which dashed group outline this node sits inside, if any
  x: number; // px on the infra canvas
  y: number; // px on the infra canvas
  detail: InfraDetail;
};

type InfraEdgeStyle = "solid" | "dashed" | "dotted" | "vertical" | "curved";

type InfraEdge = {
  from: string;
  to: string;
  label: string;
  style: InfraEdgeStyle;
  category: InfraCategory; // colors the edge
  bidirectional?: boolean;
  // Fixed label position, used instead of the auto-computed longest-segment anchor.
  // Needed for the Worker → Observability telemetry edge: with only two branches (Logs,
  // Traces) fanning out underneath it, the longest straight run of the routed line is
  // whichever branch's final descent into its node, which pulls the label off-center. A
  // pinned anchor keeps "Emits Telemetry" visually centered between the Worker and the
  // Observability container regardless of how the branches route.
  labelAnchor?: InfraPoint;
  // Shifts this edge's endpoint off the node's center point along whichever side it
  // enters — see infraPort. Only applies to edges that get the plain point-to-point
  // route (i.e. don't share a bus with siblings). Used so DNS and R2, which both enter
  // the Worker's top side but come from different sources, land on two distinct points
  // instead of colliding at the one default center-of-side port.
  toPortOffset?: number;
};

type InfraGroup = {
  id: "build" | "worker" | "observability" | "browser";
  title: string;
  category: InfraCategory;
  x: number;
  y: number;
  w: number;
  h: number;
};


// Four containers laid out strictly left → right — Build, Cloudflare Worker,
// Observability, User Browser — each its own dashed boundary so the topology reads as a
// single horizontal pipeline. Build feeds the Worker; the Worker's live request line runs
// straight through Observability's DNS card on its way to the User Browser; R2 taps in
// from Observability's own right edge; Worker Logs/Events branch off DNS underneath it;
// and EmailJS hangs off the User Browser on its own curved connector, outside every box.
const INFRA_GROUPS: InfraGroup[] = [
  { id: "build", title: "Build", category: "build", x: 15, y: 190, w: 200, h: 220 },
  { id: "observability", title: "Observability", category: "observability", x: 535, y: 110, w: 260, h: 440 },
];

const INFRA_NODES: InfraNode[] = [
  {
    id: "development",
    title: "Local Development",
    subtitle: "Local Environment",
    meta: "VS Code · React · TS",
    items: ["VS Code", "React", "TypeScript", "TanStack Start", "TanStack Router", "Tailwind CSS", "Git"],
    category: "build",
    icon: Code2,
    group: "build",
    x: 115,
    y: 250,
    detail: {
      purpose:
        "Local machine where the portfolio is written and iterated on before every commit — SSR renders live locally too, not just in production.",
      technologies: ["VS Code", "React", "TypeScript", "TanStack Start", "TanStack Router", "Tailwind CSS", "Git"],
      responsibilities: [
        "Component development",
        "Styling & layout",
        "Type safety",
        "Local testing before commit",
      ],
      relationships: ["Pushes commits to the GitHub Repository"],
      configuration: "Vite dev server with hot module reload",
      futureImprovements: "Add Storybook for isolated component development",
    },
  },
  {
    id: "github",
    title: "GitHub Repository",
    subtitle: "Source Control",
    meta: "main branch · git push",
    items: ["Main Branch", "Version Control"],
    category: "build",
    icon: Github,
    group: "build",
    x: 115,
    y: 350,
    detail: {
      purpose:
        "Stores the source code and automatically triggers a build and deployment on every push to main — no manual webhook step.",
      technologies: ["Main Branch", "Version Control"],
      responsibilities: [
        "Stores source code & commit history",
        "Tracks changes on the main branch",
        "Automatically triggers a Cloudflare Worker deployment on every push to main",
      ],
      relationships: ["Receives pushes from Local Development", "Automatically deploys to the Cloudflare Worker"],
      configuration: "main is the only deploy branch — every push ships automatically",
      futureImprovements: "Add branch preview deployments for pull requests",
    },
  },
  {
    id: "worker",
    title: "Cloudflare Worker",
    subtitle: "Deployment Runtime",
    meta: "SSR · Edge Runtime",
    items: ["Build Application", "SSR Runtime", "Edge Runtime", "Global Deployment"],
    category: "runtime",
    icon: Cloud,
    size: "lg",
    group: "worker",
    x: 385,
    y: 300,
    detail: {
      purpose:
        "The center of the deployment — automatically builds the app and runs live server-side rendering on Cloudflare's global edge network for every request.",
      technologies: ["Cloudflare Workers", "Bun", "TanStack Start SSR", "TanStack Router"],
      responsibilities: [
        "Builds the project automatically on every push to main",
        "TanStack Router resolves the matched route before rendering",
        "Runs src/server.ts to render the page server-side on every request",
        "Requests static assets from the bound R2 bucket",
        "Serves every request close to the visitor",
      ],
      relationships: [
        "Automatically deployed from the GitHub Repository",
        "Its response travels through Cloudflare DNS on the way to the browser",
        "Fetches assets from the bound R2 bucket",
        "Reports to Worker Logs & Worker Events",
        "Serves the User Browser directly over HTTPS",
      ],
      buildProcess: "push to main → automatic build → wrangler deploy -c dist/server/wrangler.json",
      runtimeDetails:
        "wrangler.jsonc sets \"main\": \"src/server.ts\" and \"compatibility_flags\": [\"nodejs_compat\"] — the Worker genuinely executes this file per request; it's not serving pre-built static files",
    },
  },
  {
    id: "dns",
    title: "Cloudflare DNS",
    subtitle: "Domain Routing",
    meta: "CNAME · HTTPS/TLS",
    items: ["Custom Domain", "HTTPS / TLS", "Traffic Routing"],
    category: "application",
    icon: Globe,
    group: "observability",
    x: 665,
    y: 300,
    detail: {
      purpose: "Resolves the custom domain and routes every request from the Worker to the browser over HTTPS — sitting directly on the main request line.",
      technologies: ["Custom Domain", "HTTPS / TLS", "Traffic Routing"],
      responsibilities: [
        "Custom domain resolution",
        "TLS termination",
        "Routes the Worker's response through to the User Browser",
        "Branches off to Worker Logs & Worker Events",
      ],
      relationships: [
        "Sits on the request line between the Cloudflare Worker and the User Browser",
        "Feeds Worker Logs & Worker Events",
      ],
    },
  },
  {
    id: "r2",
    title: "R2 Assets",
    subtitle: "Static Asset Storage",
    meta: "Images · Resume · Favicon",
    items: ["Profile Image", "Resume PDF", "Favicon", "Static Images"],
    category: "observability",
    icon: FileText,
    group: "observability",
    x: 700,
    y: 190,
    detail: {
      purpose: "Object storage bound straight into the Worker's runtime — never exposed directly to the browser.",
      technologies: ["Profile Image", "Resume PDF", "Favicon", "Static Images"],
      responsibilities: [
        "Stores the profile image, resume PDF, favicon & other static images",
        "Serves reads only through the Worker's binding",
      ],
      relationships: ["Bound directly into the Cloudflare Worker — fetched on demand, never called directly by the browser"],
      configuration: "wrangler.jsonc → r2_buckets: [{ binding: \"ASSETS\" }]",
    },
  },
  {
    id: "logs",
    title: "Worker Logs",
    subtitle: "Observability",
    meta: "Runtime tracing",
    items: ["Runtime Tracing", "Performance", "Diagnostics"],
    category: "observability",
    icon: Activity,
    group: "observability",
    x: 710,
    y: 410,
    detail: {
      purpose: "Traces execution inside the Cloudflare Worker to spot latency and runtime issues — invocation counts, duration and CPU time roll up here too.",
      technologies: ["Performance", "Diagnostics"],
      responsibilities: [
        "Captures performance traces",
        "Helps diagnose slow requests",
        "Tracks invocation count, duration & CPU time per run",
      ],
      relationships: ["Branches off Cloudflare DNS, downstream of the Worker"],
      configuration: "wrangler.jsonc → observability.traces: { enabled: true }",
    },
  },
  {
    id: "events",
    title: "Worker Events",
    subtitle: "Observability",
    meta: "Request · Deploy Events",
    items: ["Request Events", "Deploy Events", "Logs", "Dashboards"],
    category: "observability",
    icon: Zap,
    group: "observability",
    x: 620,
    y: 490,
    detail: {
      purpose:
        "The event feed inside Cloudflare's Workers Observability dashboard — every request, deployment, runtime log and alert the Worker generates, charted into one timeline.",
      technologies: ["Workers Observability"],
      responsibilities: [
        "Timelines incoming requests",
        "Surfaces deployment events",
        "Streams runtime logs & errors",
        "Charts everything into dashboards",
      ],
      relationships: ["Branches off Cloudflare DNS, downstream of the Worker"],
      configuration: "wrangler.jsonc → observability.logs: { enabled: true, invocation_logs: true }",
    },
  },
  {
    id: "userBrowser",
    title: "User Browser",
    subtitle: "Client",
    meta: "Brave · Safari · Edge",
    items: ["Brave", "Safari", "Edge"],
    category: "client",
    icon: Monitor,
    group: "browser",
    x: 930,
    y: 300,
    detail: {
      purpose: "The end of the main request flow — whatever browser a visitor is using to view the site.",
      technologies: ["Brave", "Safari", "Edge"],
      responsibilities: ["Renders the SSR application over HTTPS", "Submits the Contact Form when used"],
      relationships: [
        "Receives the SSR application directly from the Cloudflare Worker",
        "Requests images, favicon & resume through the Worker, which fetches them from R2",
        "Submits the Contact Form to EmailJS",
      ],
    },
  },
  {
    id: "communication",
    title: "EmailJS",
    subtitle: "Communication Service",
    meta: "Contact Form",
    items: ["Contact Form", "Email Delivery", "Communication Service"],
    category: "communication",
    icon: Mail,
    x: 930,
    y: 420,
    detail: {
      purpose:
        "Delivers Contact Form submissions straight to a designated inbox — a branch off the User Browser only, with no ties to GitHub or Cloudflare at all.",
      technologies: ["EmailJS"],
      responsibilities: [
        "Receives form data client-side",
        "Relays the message via the EmailJS API",
        "Delivers the email to a designated inbox",
      ],
      relationships: ["Only the User Browser connects to it — never the Cloudflare Worker"],
      configuration: "Client-side only call from the browser — no backend, no queue",
      futureImprovements: "Add a serverless fallback queue for guaranteed delivery",
    },
  },
];

// Strict left → right pipeline: Build feeds the Worker, and the Worker's live request line
// runs straight through the DNS card (inside Observability) on its way to the User Browser
// — DNS is on the main line, not a side branch. R2 is fed separately by a bold arrow off
// Observability's own right border (drawn directly in the SVG below, not as a node edge).
// Worker Logs & Worker Events branch off DNS underneath it, sharing one trunk. EmailJS sits
// outside every container, reached only by a curved branch off the User Browser.
const INFRA_EDGES: InfraEdge[] = [
  { from: "development", to: "github", label: "git push", style: "dashed", category: "build" },
  { from: "github", to: "worker", label: "Auto Deploy", style: "dashed", category: "build" },
  { from: "worker", to: "dns", label: "", style: "solid", category: "runtime" },
  { from: "r2", to: "worker", label: "", style: "dotted", category: "observability" },
  { from: "dns", to: "userBrowser", label: "HTTPS / SSR Response", style: "solid", category: "runtime" },
  { from: "dns", to: "logs", label: "", style: "dotted", category: "observability" },
  { from: "dns", to: "events", label: "", style: "dotted", category: "observability" },
  {
    from: "userBrowser",
    to: "communication",
    label: "Mail Delivery",
    style: "curved",
    category: "communication",
    labelAnchor: { x: 890, y: 360 },
  },
];

const INFRA_CATEGORY_STYLE: Record<InfraCategory, { text: string; ring: string; dot: string; stroke: string }> = {
  build: {
    text: "text-orange-400",
    ring: "border-orange-400/40",
    dot: "bg-orange-400",
    stroke: "#fb923c",
  },
  runtime: {
    text: "text-emerald-400",
    ring: "border-emerald-400/40",
    dot: "bg-emerald-400",
    stroke: "#34d399",
  },
  observability: {
    text: "text-violet-400",
    ring: "border-violet-400/40",
    dot: "bg-violet-400",
    stroke: "#a78bfa",
  },
  application: {
    text: "text-blue-400",
    ring: "border-blue-400/40",
    dot: "bg-blue-400",
    stroke: "#60a5fa",
  },
  communication: {
    text: "text-fuchsia-400",
    ring: "border-fuchsia-400/40",
    dot: "bg-fuchsia-400",
    stroke: "#e879f9",
  },
  client: {
    text: "text-slate-300",
    ring: "border-slate-300/40",
    dot: "bg-slate-300",
    stroke: "#cbd5e1",
  },
};


// ═══════════════════════════════════════════════════════════
// SECTION - Infra Build
// ═══════════════════════════════════════════════════════════

const INFRA_CANVAS_W = 1057;
const INFRA_CANVAS_H = 577;

// Node width now sizes to its own content (title + icon, subtitle, meta — whichever is
// widest) instead of a fixed "lg | default" bucket, while keeping horizontal padding
// perfectly symmetrical (16px each side, see the px-4 on the node button below). This is
// a deterministic character-width estimate rather than a DOM measurement, so it stays in
// sync with layout on first paint (no measure-then-reflow flash) and works the same on
// server-rendered output.
const INFRA_NODE_MIN_W = 140; // raised from 108 so Workers Logs & Workers Traces — the two
// Observability cards — land on the exact same rendered width (both clamp to this floor)
// instead of each sizing independently to their own text length.
// No max width — nodes must grow to fit their longest line rather than truncate. This is
// only a sanity ceiling against a pathologically long future label, not a real constraint.
const INFRA_NODE_SAFETY_CEILING = 340;
const INFRA_NODE_PAD_X = 16; // symmetrical left/right padding (px-4)
const INFRA_NODE_HH = 26; // half-height — compact card height

// The Worker is the one "lg" node in the graph — the diagram's center of gravity —
// so it renders at a visibly larger scale (bigger padding, taller card, larger type)
// than every other card. Kept as a multiplier off the base metrics so it stays in
// lockstep with estimateInfraNodeWidth/infraNodeHalfDims below, which both connector
// ports and the rendered button read from.
const INFRA_LG_SCALE = 1.3;

function infraNodeHH(node: InfraNode) {
  return node.size === "lg" ? Math.round(INFRA_NODE_HH * INFRA_LG_SCALE) : INFRA_NODE_HH;
}

function estimateInfraNodeWidth(node: InfraNode) {
  const scale = node.size === "lg" ? INFRA_LG_SCALE : 1;
  const iconAndGap = (12 + 4) * scale; // h-3 icon + gap-1
  const titleW = iconAndGap + node.title.length * 6.3 * scale; // text-[11px] font-semibold — slightly generous so it never clips
  const subtitleW = node.subtitle.length * 5.3 * scale; // text-[9px]
  const metaW = node.meta.length * 4.7 * scale; // text-[8px]
  const contentW = Math.max(titleW, subtitleW, metaW);
  const width = Math.ceil(contentW + INFRA_NODE_PAD_X * 2 * scale);
  return Math.min(INFRA_NODE_SAFETY_CEILING, Math.max(INFRA_NODE_MIN_W, width));
}

// Half-width/half-height of each node card, driven by the same content-based width used
// to render it — so connector ports always land exactly on the card's actual edge.
function infraNodeHalfDims(node: InfraNode) {
  return { hw: estimateInfraNodeWidth(node) / 2, hh: infraNodeHH(node) };
}

const INFRA_EDGE_GAP = 5; // px between the arrowhead/line end and the node border — tight, not floaty
const INFRA_CORNER_RADIUS = 8; // px, rounded 90° bends on orthogonal connectors
const INFRA_LABEL_OFFSET = 9; // px, consistent clearance between a label and its connector

type InfraPoint = { x: number; y: number };

// A port sits at the mid-point of whichever side of the node faces the other end,
// pushed outward by `gap` so the line/arrowhead never touches the card. `offset` shifts
// that point along the side (x for top/bottom, y for left/right) — used so two edges
// converging on the same node/side (e.g. DNS and R2 both entering the Worker's top) land
// on two visibly distinct points instead of the exact same coordinate.
function infraPort(node: InfraNode, side: "left" | "right" | "top" | "bottom", gap: number, offset = 0): InfraPoint {
  const { hw, hh } = infraNodeHalfDims(node);
  switch (side) {
    case "right":
      return { x: node.x + hw + gap, y: node.y + offset };
    case "left":
      return { x: node.x - hw - gap, y: node.y + offset };
    case "bottom":
      return { x: node.x + offset, y: node.y + hh + gap };
    case "top":
      return { x: node.x + offset, y: node.y - hh - gap };
  }
}

// Builds the Manhattan (horizontal/vertical-only) waypoints between two nodes. Picks
// whichever axis dominates as the "through" direction, exits/enters on the matching side,
// and — only if the two ports aren't already aligned — inserts a single mid-line jog so
// every segment stays perfectly horizontal or vertical. Already-aligned nodes (the common
// case here) come back as a plain 2-point straight run with zero bends. `fromOffset`/
// `toOffset` nudge either endpoint off-center along its side — see infraPort.
function infraOrthogonalPoints(from: InfraNode, to: InfraNode, gap: number, fromOffset = 0, toOffset = 0): InfraPoint[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const horizontalDominant = Math.abs(dx) >= Math.abs(dy);

  if (horizontalDominant) {
    const start = infraPort(from, dx >= 0 ? "right" : "left", gap, fromOffset);
    const end = infraPort(to, dx >= 0 ? "left" : "right", gap, toOffset);
    if (Math.abs(start.y - end.y) < 0.5) return [start, end];
    const midX = (start.x + end.x) / 2;
    return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
  }
  const start = infraPort(from, dy >= 0 ? "bottom" : "top", gap, fromOffset);
  const end = infraPort(to, dy >= 0 ? "top" : "bottom", gap, toOffset);
  if (Math.abs(start.x - end.x) < 0.5) return [start, end];
  const midY = (start.y + end.y) / 2;
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
}


// Turns a Manhattan polyline into an SVG path string with rounded corners at every
// interior vertex (quadratic-curve corner, radius clamped to half the shorter adjoining
// segment so short jogs never produce an overshooting curve).
function infraRoundedPath(points: InfraPoint[], radius: number): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y) || 1;
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y) || 1;
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const a = { x: curr.x - ((curr.x - prev.x) / inLen) * r, y: curr.y - ((curr.y - prev.y) / inLen) * r };
    const b = { x: curr.x + ((next.x - curr.x) / outLen) * r, y: curr.y + ((next.y - curr.y) / outLen) * r };
    d += ` L ${a.x} ${a.y} Q ${curr.x} ${curr.y} ${b.x} ${b.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

// Finds the longest straight run in the polyline (the whole thing, for a simple 2-point
// line) and returns a label anchor centered on that segment, offset a fixed distance to
// the side so the label clears the line itself, any arrowhead, and the nodes at either end.
function infraLabelAnchor(points: InfraPoint[], offset: number): InfraPoint {
  let bestLen = -1;
  let bestMid: InfraPoint = points[0];
  let bestHorizontal = true;
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    if (len > bestLen) {
      bestLen = len;
      bestMid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      bestHorizontal = Math.abs(q.y - p.y) < 0.5;
    }
  }
  return bestHorizontal ? { x: bestMid.x, y: bestMid.y - offset } : { x: bestMid.x + offset, y: bestMid.y };
}

// Which side of `from` an edge exits, and which side of `to` it enters — same
// horizontal/vertical-dominant rule used by infraOrthogonalPoints, exposed separately so
// the fan-out grouping below can key edges by (node, side) before any points are built.
function infraExitSide(from: InfraNode, to: InfraNode): "left" | "right" | "top" | "bottom" {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}
function infraEntrySide(from: InfraNode, to: InfraNode): "left" | "right" | "top" | "bottom" {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "left" : "right";
  return dy >= 0 ? "top" : "bottom";
}

// Drops any repeated consecutive vertex (e.g. a branch whose target row is level with the
// trunk collapses two of the bus waypoints onto the same point) — infraRoundedPath can't
// round a zero-length segment.
function infraDedupePoints(points: InfraPoint[]): InfraPoint[] {
  const out: InfraPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const last = out[out.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) > 0.5) out.push(p);
  }
  return out;
}

const INFRA_BUS_OFFSET = 26; // px the shared trunk runs before it's allowed to branch

// Computes the routed waypoints for every edge in one pass. Edges that share the same
// exit side of the same source node (e.g. the Cloudflare Worker fanning out to DNS, R2,
// Logs, Traces, and the Browser, all off its right edge) are grouped into a single shared
// trunk: one line leaves the node, runs INFRA_BUS_OFFSET px clear of it, and only THEN
// splits into a bus that the individual branches tap off of — so nothing crosses or
// bundles right at the node boundary, the way Cloudflare's own reference diagrams draw
// fan-out. Edges that don't share an exit side with any sibling fall back to the plain
// point-to-point orthogonal route.
function infraComputeEdgeGeometries(edges: InfraEdge[], nodeMap: Record<string, InfraNode>, gap: number, busOffset: number): InfraPoint[][] {
  const groups = new Map<string, number[]>();
  edges.forEach((edge, i) => {
    const from = nodeMap[edge.from];
    const to = nodeMap[edge.to];
    const key = `${edge.from}::${infraExitSide(from, to)}`;
    groups.set(key, [...(groups.get(key) ?? []), i]);
  });

  const result: InfraPoint[][] = new Array(edges.length);

  groups.forEach((indices) => {
    if (indices.length === 1) {
      const edge = edges[indices[0]];
      result[indices[0]] = infraOrthogonalPoints(nodeMap[edge.from], nodeMap[edge.to], gap, 0, edge.toPortOffset ?? 0);
      return;
    }

    // Shared trunk: same source node + exit side for every edge in this group.
    const first = edges[indices[0]];
    const fromNode = nodeMap[first.from];
    const side = infraExitSide(fromNode, nodeMap[first.to]);
    const trunkStart = infraPort(fromNode, side, gap);
    const horizontalTrunk = side === "left" || side === "right";
    const busCoord = horizontalTrunk
      ? trunkStart.x + (side === "right" ? busOffset : -busOffset)
      : trunkStart.y + (side === "bottom" ? busOffset : -busOffset);

    indices.forEach((i) => {
      const edge = edges[i];
      const toNode = nodeMap[edge.to];
      const entrySide = infraEntrySide(fromNode, toNode);
      const end = infraPort(toNode, entrySide, gap);
      const points = horizontalTrunk
        ? [trunkStart, { x: busCoord, y: trunkStart.y }, { x: busCoord, y: end.y }, end]
        : [trunkStart, { x: trunkStart.x, y: busCoord }, { x: end.x, y: busCoord }, end];
      result[i] = infraDedupePoints(points);
    });
  });

  return result;
}

const INFRA_SUMMARY_CARDS: { title: string; category: InfraCategory; items: string[] }[] = [
  { title: "Edge Stack", category: "runtime", items: ["Cloudflare Workers", "Cloudflare DNS", "Edge Runtime", "HTTPS/TLS", "Custom Domain"] },
  { title: "Monitoring", category: "observability", items: ["Worker Logs", "Worker Events", "R2 Assets", "Runtime Monitoring"] },
  { title: "Build Pipeline", category: "build", items: ["Development", "GitHub", "Git Push", "Automatic Deployment"] },
  { title: "Communication", category: "communication", items: ["EmailJS", "Contact Form"] },
];

function InfraBuild() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, startScrollLeft: 0 });

  const nodeMap = useMemo(
    () => Object.fromEntries(INFRA_NODES.map((n) => [n.id, n])) as Record<string, InfraNode>,
    [],
  );

  // Routed waypoints per edge — shared trunk/bus for any node's fanned-out edges, plain
  // point-to-point orthogonal route otherwise. Computed once so the line pass and the
  // label pass below always agree on exactly where each connector runs.
  const edgeGeometries = useMemo(
    () => infraComputeEdgeGeometries(INFRA_EDGES, nodeMap, INFRA_EDGE_GAP, INFRA_BUS_OFFSET),
    [nodeMap],
  );

  const activeIds = useMemo(() => {
    if (!hovered) return null;
    const ids = new Set<string>([hovered]);
    INFRA_EDGES.forEach((e) => {
      if (e.from === hovered) ids.add(e.to);
      if (e.to === hovered) ids.add(e.from);
    });
    return ids;
  }, [hovered]);

  const selectedNode = selected ? nodeMap[selected] : null;

  // Hover a node -> immediately drive the inspector; the last hovered node
  // stays selected even after the cursor leaves the graph entirely.
  const handleNodeHover = (id: string) => {
    setHovered(id);
    setSelected(id);
  };

  // Grab-to-pan: only starts when the mousedown originates on empty canvas
  // background (node wrappers call stopPropagation so they never trigger this).
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    dragState.current.isDown = true;
    dragState.current.startX = e.pageX;
    dragState.current.startScrollLeft = scrollRef.current.scrollLeft;
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current.isDown || !scrollRef.current) return;
      const dx = e.pageX - dragState.current.startX;
      scrollRef.current.scrollLeft = dragState.current.startScrollLeft - dx;
    };
    const onUp = () => {
      if (dragState.current.isDown) {
        dragState.current.isDown = false;
        setIsDragging(false);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div>
      <style>{`
        .infra-scroll::-webkit-scrollbar { height: 8px; }
        .infra-scroll::-webkit-scrollbar-track { background: color-mix(in oklab, var(--foreground) 6%, transparent); border-radius: 999px; }
        .infra-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, var(--foreground) 22%, transparent); border-radius: 999px; }
        .infra-scroll::-webkit-scrollbar-thumb:hover { background: color-mix(in oklab, var(--foreground) 34%, transparent); }
        .infra-scroll { scrollbar-width: thin; scrollbar-color: color-mix(in oklab, var(--foreground) 22%, transparent) transparent; }
        @keyframes infra-flow { to { stroke-dashoffset: -24; } }
        .infra-edge-live { stroke-dasharray: 5 5; animation: infra-flow 1s linear infinite; }
        @keyframes infra-inspector-in { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }
        .infra-inspector-anim { animation: infra-inspector-in 250ms ease both; }
        .infra-scroll { cursor: grab; }
        .infra-scroll.infra-dragging { cursor: grabbing; }
      `}</style>

      <SectionHeading title="Infrastructure." />
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span>Develop. Debug. Deploy.</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* ── Graph card (canvas + in-graph legend) ── */}
        <div className="surface-2 min-w-0 flex-1 rounded-2xl border border-border/60 p-3 md:p-4 lg:w-[72%] lg:flex-none">
          <div
            ref={scrollRef}
            className={cn(
              "infra-scroll select-none overflow-x-auto overflow-y-hidden rounded-xl",
              isDragging && "infra-dragging",
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
            onMouseDown={handleCanvasMouseDown}
            onDragStart={(e) => e.preventDefault()}
          >
            <div
              className="relative select-none"
              style={{
                width: INFRA_CANVAS_W,
                height: INFRA_CANVAS_H,
                backgroundImage:
                  "linear-gradient(to right, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Group outlines (Build / Observability) — thin dashed borders, tightly
                  wrapped around their child nodes, small monospace title top-left */}
              {INFRA_GROUPS.map((g) => {
                const style = INFRA_CATEGORY_STYLE[g.category];
                return (
                  <div
                    key={g.id}
                    className={cn("absolute rounded-xl border border-dashed", style.ring)}
                    style={{ left: g.x, top: g.y, width: g.w, height: g.h, zIndex: 1 }}
                  >
                    <span
                      className={cn(
                        "surface-2 absolute -top-2.5 left-3 rounded px-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
                        style.text,
                      )}
                    >
                      {g.title}
                    </span>
                  </div>
                );
              })}

              <svg
                viewBox={`0 0 ${INFRA_CANVAS_W} ${INFRA_CANVAS_H}`}
                className="absolute inset-0 h-full w-full overflow-visible"
                style={{ zIndex: 2 }}
              >
                <defs>
                  {(Object.keys(INFRA_CATEGORY_STYLE) as InfraCategory[]).map((cat) => (
                    <marker
                      key={cat}
                      id={`infra-arrow-${cat}`}
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={INFRA_CATEGORY_STYLE[cat].stroke} />
                    </marker>
                  ))}
                </defs>
                {INFRA_EDGES.map((edge, i) => {
                  const isActive = !hovered || (activeIds?.has(edge.from) && activeIds?.has(edge.to));
                  const dash =
                    edge.style === "dashed"
                      ? "6 5"
                      : edge.style === "dotted"
                        ? "2 6"
                        : edge.style === "vertical"
                          ? "9 4 2 4"
                          : undefined;
                  const color = INFRA_CATEGORY_STYLE[edge.category].stroke;
                  const isLive = edge.style === "solid";

                  // Orthogonal (horizontal/vertical-only) waypoints — a plain point-to-point
                  // route, or a shared trunk-then-bus route when this edge fans out from the
                  // same node/side as siblings (see infraComputeEdgeGeometries) — then a
                  // rounded-corner path drawn through them.
                  const points = edgeGeometries[i];
                  const d = infraRoundedPath(points, INFRA_CORNER_RADIUS);

                  return (
                    <path
                      key={i}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={edge.style === "vertical" ? 1.3 : 1.5}
                      strokeDasharray={dash}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={`url(#infra-arrow-${edge.category})`}
                      markerStart={edge.bidirectional ? `url(#infra-arrow-${edge.category})` : undefined}
                      className={cn("transition-opacity duration-200", isLive && "infra-edge-live")}
                      style={{ opacity: isActive ? 0.9 : 0.12 }}
                    />
                  );
                })}
              </svg>

              {/* Connection labels — plain coloured monospace text floating above the
                  line, no background/border/pill, matching the reference diagram. */}
              {INFRA_EDGES.map((edge, i) => {
                if (!edge.label) return null;
                const isActive = !hovered || (activeIds?.has(edge.from) && activeIds?.has(edge.to));
                const anchor = edge.labelAnchor ?? infraLabelAnchor(edgeGeometries[i], INFRA_LABEL_OFFSET);
                return (
                  <span
                    key={i}
                    className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] font-medium transition-opacity duration-200 md:text-[10px]"
                    style={{
                      left: anchor.x,
                      top: anchor.y,
                      opacity: isActive ? 1 : 0.15,
                      zIndex: 3,
                      color: INFRA_CATEGORY_STYLE[edge.category].stroke,
                    }}
                  >
                    {edge.label}
                  </span>
                );
              })}

              {INFRA_NODES.map((node) => {
                const Icon = node.icon;
                const style = INFRA_CATEGORY_STYLE[node.category];
                const isActive = !hovered || activeIds?.has(node.id);
                const isHovered = hovered === node.id;
                const isSelected = selected === node.id;
                const isLg = node.size === "lg";
                return (
                  <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
                    style={{
                      left: node.x,
                      top: node.y,
                      opacity: isActive ? 1 : 0.25,
                      zIndex: isHovered || isSelected ? 30 : 10,
                    }}
                    onMouseEnter={() => handleNodeHover(node.id)}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(node.id)}
                      className={cn(
                        "surface-1 flex flex-col justify-center gap-0.5 rounded-md border text-left shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-0.5",
                        isLg ? "gap-1 rounded-lg border-2 px-5 py-2" : "px-4 py-1.5",
                        style.ring,
                      )}
                      style={{
                        // Content-sized width (see estimateInfraNodeWidth) — same value the
                        // connector ports use, and px-4/px-5 above keeps padding symmetrical
                        // so there's never leftover space stacked on just the right edge. The
                        // Worker is the one "lg" node — the diagram's center of gravity — so
                        // it renders visibly larger than every other card (see INFRA_LG_SCALE).
                        width: estimateInfraNodeWidth(node),
                        height: infraNodeHH(node) * 2,
                        boxShadow: isSelected
                          ? `0 0 0 2px ${style.stroke}, 0 0 18px 2px ${style.stroke}55`
                          : isHovered
                            ? `0 0 0 2px ${style.stroke}30`
                            : isLg
                              ? `0 0 24px -6px ${style.stroke}70`
                              : `0 0 8px -4px ${style.stroke}40`,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn(isLg ? "h-4 w-4" : "h-3 w-3", "shrink-0", style.text)} />
                        <span
                          className={cn(
                            "whitespace-nowrap font-semibold text-foreground",
                            isLg ? "text-[14px]" : "text-[11px]",
                          )}
                        >
                          {node.title}
                        </span>
                      </div>
                      <span className={cn("whitespace-nowrap text-muted-foreground", isLg ? "text-[11px]" : "text-[9px]")}>
                        {node.subtitle}
                      </span>
                      <span
                        className={cn(
                          "whitespace-nowrap text-muted-foreground/60",
                          isLg ? "text-[9px]" : "text-[8px]",
                        )}
                      >
                        {node.meta}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── In-graph legend ── */}
          <div className="mt-4 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                Category
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" /> Build
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" /> Runtime
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400" /> Observability
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" /> Application
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-fuchsia-400" /> Communication
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" /> Client
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                Edge Style
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-[2px] w-5 shrink-0 bg-emerald-400" /> Solid — Runtime Request
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-0 w-5 shrink-0 border-t-2"
                    style={{ borderColor: "#fb923c", borderStyle: "dashed" }}
                  />
                  Dashed — Deployment
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-0 w-5 shrink-0 border-t-2"
                    style={{ borderColor: "#34d399", borderStyle: "dotted" }}
                  />
                  Dotted — Configuration
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-[2px] shrink-0 bg-fuchsia-400" /> Vertical — External Service
                </div>
                <div className="flex items-center gap-2">
                  <span className="infra-edge-live h-[2px] w-5 shrink-0 bg-emerald-400" /> Animated — Live Request
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                Dataflow Direction
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>Left → Right — main pipeline</p>
                <p>Vertical — external service branch</p>
                <p>Hover — highlight connected nodes</p>
                <p>Hover — open inspector</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Inspector ── */}
        <div className="surface-2 flex flex-col rounded-2xl border border-border/60 p-5 lg:w-[28%]">
          <div key={selectedNode ? selectedNode.id : "empty"} className="infra-inspector-anim flex flex-1 flex-col">
          {!selectedNode ? (
            <div className="flex h-full min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
              <Workflow className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                Hover any node to inspect its purpose, responsibilities, technologies and configuration.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <selectedNode.icon
                  className={cn("h-4 w-4 shrink-0", INFRA_CATEGORY_STYLE[selectedNode.category].text)}
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">{selectedNode.title}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {selectedNode.subtitle}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {selectedNode.detail.purpose}
              </p>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                  Technologies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.detail.technologies.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px]",
                        INFRA_CATEGORY_STYLE[selectedNode.category].ring,
                        INFRA_CATEGORY_STYLE[selectedNode.category].text,
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                  Responsibilities
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selectedNode.detail.responsibilities.map((r) => (
                    <li key={r} className="flex gap-1.5">
                      <span className="text-muted-foreground/40">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                  Relationships
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selectedNode.detail.relationships.map((r) => (
                    <li key={r} className="flex gap-1.5">
                      <span className="text-muted-foreground/40">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {(selectedNode.detail.buildProcess || selectedNode.detail.runtimeDetails) && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                    Workflow
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {selectedNode.detail.buildProcess && <p>{selectedNode.detail.buildProcess}</p>}
                    {selectedNode.detail.runtimeDetails && <p>{selectedNode.detail.runtimeDetails}</p>}
                  </div>
                </div>
              )}

              {selectedNode.detail.configuration && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                    Configuration
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedNode.detail.configuration}</p>
                </div>
              )}

              {selectedNode.detail.futureImprovements && (
                <div className="border-t border-border/60 pt-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                    Future Improvements
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedNode.detail.futureImprovements}
                  </p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ── Summary cards: Edge Stack · Monitoring · Build Pipeline · Communication ── */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {INFRA_SUMMARY_CARDS.map((card) => {
          const style = INFRA_CATEGORY_STYLE[card.category];
          return (
            <div key={card.title} className="surface-2 rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
                <span className="text-xs font-semibold text-foreground">{card.title}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {card.items.map((it) => (
                  <li key={it} className="flex gap-1.5">
                    <span className={cn("h-1 w-1 shrink-0 translate-y-1 rounded-full", style.dot)} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - Contact
// ═══════════════════════════════════════════════════════════

// Chrome/Edge re-apply their own black-text + colored-background override on
// autofill separately for the base state, :hover, :focus, and :active — fixing
// only the bare `:-webkit-autofill` state means it silently reappears the
// moment the field is focused (e.g. clicking back in to edit a pasted value).
const AUTOFILL_FIX =
  "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_var(--surface-3)_inset] " +
  "[&:-webkit-autofill:hover]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill:hover]:shadow-[0_0_0px_1000px_var(--surface-3)_inset] " +
  "[&:-webkit-autofill:focus]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill:focus]:shadow-[0_0_0px_1000px_var(--surface-3)_inset] " +
  "[&:-webkit-autofill:active]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill:active]:shadow-[0_0_0px_1000px_var(--surface-3)_inset]";

function Contact() {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [time, setTime] = useState("");

  // Live IST clock
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    emailjs
      .sendForm(
        "service_fdq7bwf",
        "template_jpawssn",
        e.target as HTMLFormElement,
        "X7cczgqlSFWmadFLE",
      )
      .then(() => {
        setSending(false);
        const next = msgCount + 1;
        setMsgCount(next);
        if (next >= 2) {
          setCooldown(true);
          setTimeout(() => {
            setCooldown(false);
            setMsgCount(0);
          }, 60_000);
          toast.warning("Message sent! Please wait 60 seconds before sending again.");
        } else {
          toast.success("Message sent! I'll get back to you shortly.");
        }
      })
      .catch(() => {
        setSending(false);
        toast.error("Something went wrong. Please try again.");
      });
  }

  return (
    <div>
      <SectionHeading title="Let's Connect." />
      <p className="text-muted-foreground max-w-2xl mb-6 text-justify">
        Whether it's a job opportunity, a project or just a tech conversation - I'd love to hear it
        from you.
      </p>

      {/* Two-column layout: wide form + narrow info panel */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* ── Left: contact form (takes all available width) ── */}
        <form
          onSubmit={onSubmit}
          className="surface-2 flex-1 grid gap-4 rounded-2xl border border-border/60 p-6"
        >
          <Field label="Name">
            <Input
              required
              name="name"
              placeholder="Your name"
              className={cn("surface-3 h-10 w-full", AUTOFILL_FIX)}
            />
          </Field>
          <Field label="Email">
            <Input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
              className={cn("surface-3 h-10 w-full", AUTOFILL_FIX)}
            />
          </Field>
          <Field label="Message">
            <Textarea
              required
              name="message"
              placeholder="What's on your mind?"
              rows={2}
              className={cn("surface-3 w-full resize-none overflow-hidden", AUTOFILL_FIX)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />
          </Field>
          <div>
            <Button type="submit" disabled={sending || cooldown} className="gap-2">
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : cooldown ? "Please wait…" : "Send Message"}
            </Button>
          </div>
        </form>

        {/* ── Right: compact info panel ── */}
        <div className="w-full md:w-72 shrink-0 space-y-3">
          {/* Quick info card */}
          <div className="surface-2 rounded-xl border border-border/60 p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Get In Touch
            </p>

            {/* Email row */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href="mailto:shelkeaditya@proton.me"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
              >
                shelkeaditya@proton.me
              </a>
            </div>

            {/* Location row */}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                Pune, Maharashtra
              </span>
            </div>

            {/* Find me on */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50 mb-3">
                Find me on
              </p>
              <div className="flex items-center gap-0.3">
                <IconLink href="https://linkedin.com/in/shelkeaditya" icon={Linkedin} label="LinkedIn" />
                <IconLink href="https://github.com/shelkeaditya" icon={Github} label="GitHub" />
                <IconLink href="https://instagram.com/shelke__aditya" icon={Instagram} label="Instagram" />
                <IconLink href="https://x.com/shelke__aditya" icon={XIcon} label="Twitter" />
              </div>
            </div>

            {/* Response time */}
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground/60 pt-4 border-t border-border/60 ">
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span>Usually responds within 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CONSTANTS - Journey timeline
// ═════════════════════════════════════════════════════════════

type JourneyEvent = {
  date: string; // "Mon D"
  year: number;
  desc: React.ReactNode;
};

const JOURNEY: JourneyEvent[] = [
  {
    date: "May 29",
    year: 2026,
    desc: (
      <>
        Portfolio launched as a server-rendered application on <strong>TanStack Start</strong>,{" "}
        <strong>TanStack Router</strong>, and Vite, deployed on <strong>Cloudflare Workers</strong>.
      </>
    ),
  },
  {
    date: "Jun 1",
    year: 2026,
    desc: "Contact section and mobile layout refined for better usability.",
  },
  {
    date: "Jun 2",
    year: 2026,
    desc: "Project cards, contact section, and resume skills tab restructured for clarity; Search Console verification added to support SEO.",
  },
  {
    date: "Jun 9",
    year: 2026,
    desc: "Homepage tile layout and typography refined.",
  },
  {
    date: "Jun 14",
    year: 2026,
    desc: "Resume content updated.",
  },
  {
    date: "Jun 25",
    year: 2026,
    desc: (
      <>
        Contact form integrated with <strong>EmailJS</strong> for direct, serverless messaging.
      </>
    ),
  },
  {
    date: "Jun 29",
    year: 2026,
    desc: "Journey timeline introduced, and the resume section restructured with refined layout and transitions.",
  },
  {
    date: "Jun 30",
    year: 2026,
    desc: "Certifications linked directly to their verifiable sources, with resume actions split for clarity.",
  },
  {
    date: "Jul 1",
    year: 2026,
    desc: "Favicon and brand touches added for visual consistency across pages.",
  },
  {
    date: "Jul 9",
    year: 2026,
    desc: "Bio copy refined.",
  },
  {
    date: "Jul 10",
    year: 2026,
    desc: "Color palette and mobile presentation adjusted ahead of the full design pass.",
  },
  {
    date: "Jul 11",
    year: 2026,
    desc: "Design system overhaul completed — dark and light themes rebuilt, iconography refreshed, and layouts made mobile-first.",
  },
  {
    date: "Jul 12",
    year: 2026,
    desc: (
      <>
        Deployment pipeline refined, with observability enabled on the <strong>Cloudflare Worker</strong>.
      </>
    ),
  },
  {
    date: "Jul 13",
    year: 2026,
    desc: "Codebase reorganized and repository hygiene improved; professional title updated to Cloud & DevOps Engineer.",
  },
  {
    date: "Jul 15",
    year: 2026,
    desc: "Social icon updated to the official X logomark.",
  },
  {
    date: "Jul 21",
    year: 2026,
    desc: "Theme adjustments and internal reorganization, including status indicators and authentication testing.",
  },
  {
    date: "Jul 22",
    year: 2026,
    desc: "Theme finalized and documentation updated to reflect the current build.",
  },
  {
    date: "Jul 26",
    year: 2026,
    desc: (
      <>
        <strong>Proton Mail</strong> integrated as the primary professional contact address.
      </>
    ),
  },
];

// ═══════════════════════════════════════════════════════════
// SECTION - Journey
// ═══════════════════════════════════════════════════════════

function Journey() {
  const years = useMemo(() => {
    const map = new Map<number, JourneyEvent[]>();
    for (const ev of JOURNEY) {
      if (!map.has(ev.year)) map.set(ev.year, []);
      map.get(ev.year)!.push(ev);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, []);

  const first = JOURNEY[0];
  const last = JOURNEY[JOURNEY.length - 1];

  return (
    <div>
      <SectionHeading title="Journey." />

      <div className="mb-8 text-sm text-muted-foreground">
        <span className="font-semibold text-accent-blue">{JOURNEY.length}</span> milestones ·{" "}
        {first.year} – {last.year}
      </div>

      <div className="space-y-10">
        {years.map(([year, events]) => (
          <div key={year}>
            {/* Year header with ghost numeral */}
            <div className="relative mb-5 flex items-center justify-between">
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 left-0 select-none text-6xl font-black leading-none text-foreground md:text-7xl"
                  style={{ opacity: "var(--ghost-year-opacity)" }}
                >
                  {year}
                </span>
                <div className="relative">
                  <h3 className="text-xl font-bold text-foreground md:text-2xl">{year}</h3>
                  <span className="mt-1 block h-[2px] w-56 rounded-full bg-gradient-to-r from-accent-blue to-transparent" />
                </div>
              </div>
              <span className="rounded-full border border-border/60 bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                {events.length} events
              </span>
            </div>

            {/* Rail of events for this year */}
            <ol className="relative ml-[7px] pl-6">
              {events.map((ev, i) => (
                <li key={i} className="group relative pb-6 last:pb-0">
                  {i !== events.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute -left-[25px] top-3 bottom-0 w-px bg-border/60"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-accent-blue shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-blue)_18%,transparent)] transition-transform group-hover:scale-125"
                  />
                  <span className="mb-2 inline-block rounded-md border border-border/60 bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {ev.date}
                  </span>
                  <div className="text-sm leading-relaxed text-foreground/90">{ev.desc}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROUTER - Section switcher
// ═══════════════════════════════════════════════════════════

function SectionRenderer({ active }: { active: SectionKey }) {
  const map: Record<SectionKey, React.ReactNode> = {
    about: <About />,
    resume: <Resume />,
    portfolio: <PortfolioSection />,
    infra: <InfraBuild />,
    contact: <Contact />,
    journey: <Journey />,
  };
  return (
    <div key={active} className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      {map[active]}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT - Portfolio page
// ═══════════════════════════════════════════════════════════

export default function Portfolio() {
  const [active, setActive] = useState<SectionKey>("about");
  const { theme, toggle } = useTheme();

  return (
    <div className="ambient-bg relative min-h-screen text-foreground">
      <BackgroundFX />
      <Toaster />

      {/* ── Main layout ── */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <ProfileHero onJourney={() => setActive("journey")} theme={theme} toggleTheme={toggle} />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
          <main className="surface-1 min-h-[420px] rounded-2xl border border-border/60 p-6 md:p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.7)] mb-24 md:mb-0">
            <SectionRenderer active={active} />
          </main>

          <div className="hidden md:block">
            <NavPanel active={active} setActive={setActive} theme={theme} toggleTheme={toggle} />
          </div>
        </div>

        <footer className="mt-12 pt-4 pb-2 text-center text-xs text-muted-foreground hidden md:block">
          © 2026 Aditya Rajendra Shelke
        </footer>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="surface-1 flex items-center gap-0 rounded-2xl border border-border/60 px-2 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]">
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                  isActive
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}