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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import emailjs from "@emailjs/browser";
import profileImg from "@/assets/profile.jpeg";

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
  if (typeof window.matchMedia === "function") {
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
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

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        // ignore write failures
      }
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
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

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
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
              i === index ? "translateY(0)" : i < index ? "translateY(-100%)" : "translateY(100%)",
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

  return (
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
                  src={profileImg}
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
                  href="mailto:work.shelkeaditya@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  work.shelkeaditya@gmail.com
                </a>
                <div className="flex items-center justify-between">
                  <div className="shrink-0">
                    <div className="inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden transition-all hover:-translate-y-0.5">
                      <a
                        href="https://drive.google.com/drive/folders/1c0qffoq846ABrArQxjx9GtoB2ROcjkhy"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        CV
                      </a>
                      <div className="w-px bg-[color:var(--accent-blue)]/30" />
                      <a
                        href="/Aditya Shelke CV.pdf"
                        download
                        aria-label="Download CV"
                        className="flex items-center pl-3 pr-3 py-2 text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors"
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
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[13px]">
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
              <div className="inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden transition-all hover:-translate-y-0.5">
                <a
                  href="https://drive.google.com/drive/folders/1c0qffoq846ABrArQxjx9GtoB2ROcjkhy"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  View CV
                </a>
                <div className="w-px bg-[color:var(--accent-blue)]/30" />
                <a
                  href="/Aditya Shelke CV.pdf"
                  download
                  aria-label="Download CV"
                  className="flex items-center pl-3 pr-3 py-2 text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>

              {/* Email */}
              <a
                href="mailto:work.shelkeaditya@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                work.shelkeaditya@gmail.com
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
  college,
  year,
  location,
  description,
  points,
}: {
  heading: string;
  college?: string;
  year: string;
  location: string;
  description?: string;
  points?: string[];
}) {
  return (
    <div className="surface-2 rounded-xl border border-border/60 p-5">
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-foreground sm:text-xl">{heading}</h4>
        {college && <div className="text-base font-medium text-blue-400">{college}</div>}
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
            college="E-Sutra Technologies"
            year="Jun 2026 – Present"
            location="Remote"
            description="Working on real-world DevOps and cloud tasks including CI/CD pipeline management, infrastructure automation, and security practices in an Agile team environment."
            points={[
              "Participating in sprint rituals - planning, stand-ups, retrospectives",
              "Managing Git branching workflows and PR reviews",
              "Working with Jira for task tracking and project management",
              "Applying DevSecOps practices with SonarQube and security scanning",
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
            college="Ajeenkya DY Patil University"
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
  },
  {
    category: ["Certifications"],
    icon: <ShieldCheck className="h-5 w-5 text-blue-400" />,
    title: "Saylor Academy: Information Security",
    subtitle: "Information Security Fundamentals",
    description:
      "Coursework covering core information security principles, threat models, and security best practices.",
    tech: ["Information Security", "Risk Management"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing",
      },
    ],
  },
  {
    category: ["Certifications"],
    icon: <Activity className="h-5 w-5 text-cyan-400" />,
    title: "Saylor Academy: Computer Networks",
    subtitle: "Networking Fundamentals",
    description:
      "Coursework covering networking concepts including protocols, topologies, and network architecture.",
    tech: ["Networking", "TCP/IP"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing",
      },
    ],
  },
  {
    category: ["Certifications"],
    icon: <Code2 className="h-5 w-5 text-purple-400" />,
    title: "Saylor Academy: Computer Architecture",
    subtitle: "Computer Architecture Fundamentals",
    description:
      "Coursework covering core computer architecture concepts including processor design and system organization.",
    tech: ["Computer Architecture", "Systems"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing",
      },
    ],
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
    title: "Connect2Cure: A Telemedine Platform",
    subtitle: "Published on IRJET",
    description:
      "Co-authored and published a peer-reviewed research paper in IRJET, an established engineering and technology journal.",
    tech: ["Research", "Academic Writing"],
    buttons: [
      {
        label: "Read Paper",
        href: "https://drive.google.com/drive/u/0/folders/1m2cEsQOWPS5yQ7gLjM2Bu_xERdB0nE7A",
      },
    ],
  },
];


// ═══════════════════════════════════════════════════════════
// SECTION - Portfolio
// ═══════════════════════════════════════════════════════════

function PortfolioSection() {
  const [filter, setFilter] = useState<PortfolioFilter>("All");

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
        {filtered.map((c) => (
          <div
            key={c.title}
            className="surface-2 group flex flex-col rounded-xl border border-border/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-blue)]/40 hover:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.7)]"
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
        ))}
      </div>
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
  group?: "build" | "observability"; // which dashed group outline this node sits inside, if any
  x: number; // px on the infra canvas
  y: number; // px on the infra canvas
  detail: InfraDetail;
};

type InfraEdgeStyle = "solid" | "dashed" | "dotted" | "vertical";

type InfraEdge = {
  from: string;
  to: string;
  label: string;
  style: InfraEdgeStyle;
  category: InfraCategory; // colors the edge
  bidirectional?: boolean;
};

type InfraGroup = {
  id: "build" | "observability";
  title: string;
  category: InfraCategory;
  x: number;
  y: number;
  w: number;
  h: number;
};


const INFRA_GROUPS: InfraGroup[] = [
  { id: "build", title: "Build", category: "build", x: 55, y: 65, w: 220, h: 290 },
  { id: "observability", title: "Observability", category: "observability", x: 672, y: 65, w: 225, h: 425 },
];

const INFRA_NODES: InfraNode[] = [
  {
    id: "development",
    title: "Development",
    subtitle: "Local Environment",
    meta: "VS Code · React · TS",
    items: ["VS Code", "React", "Vite", "TanStack Start", "TypeScript", "Tailwind CSS", "Git"],
    category: "build",
    icon: Code2,
    group: "build",
    x: 165,
    y: 150,
    detail: {
      purpose:
        "Local development environment where the portfolio is written and iterated on before every commit. `vite dev` runs through TanStack Start, so SSR renders live locally too — not just in production.",
      technologies: ["VS Code", "React", "Vite", "TanStack Start", "TypeScript", "Tailwind CSS", "Git"],
      responsibilities: [
        "Component development",
        "Styling & layout",
        "Type safety",
        "Local testing before commit",
      ],
      relationships: ["Pushes commits to GitHub"],
      configuration: "Vite dev server with hot module reload",
      futureImprovements: "Add Storybook for isolated component development",
    },
  },
  {
    id: "github",
    title: "GitHub",
    subtitle: "Source Control",
    meta: "main branch · git push",
    items: ["Repository", "Version Control", "Main Branch"],
    category: "build",
    icon: Github,
    group: "build",
    x: 165,
    y: 290,
    detail: {
      purpose: "Stores the source code and is the trigger point for every deployment.",
      technologies: ["Git", "GitHub"],
      responsibilities: [
        "Stores source code & commit history",
        "Tracks changes on the main branch",
        "Fires a webhook to Cloudflare on every push to main",
      ],
      relationships: ["Receives pushes from Development", "Triggers Cloudflare Workers via webhook"],
      configuration: "main is the only deploy branch — every push ships automatically",
      futureImprovements: "Add branch preview deployments for pull requests",
    },
  },
  {
    id: "workers",
    title: "Cloudflare Workers",
    subtitle: "Deployment Runtime",
    meta: "SSR · Edge Runtime",
    items: ["SSR Runtime", "Deployment", "Edge Runtime"],
    category: "runtime",
    icon: Cloud,
    size: "lg",
    x: 490,
    y: 290,
    detail: {
      purpose:
        "The center of the deployment — receives GitHub's webhook, builds the app, and runs live server-side rendering on Cloudflare's edge network for every single request.",
      technologies: ["Cloudflare Workers", "TanStack Start SSR", "TanStack Router"],
      responsibilities: [
        "Builds the project on every webhook trigger",
        "TanStack Router resolves the matched route before rendering",
        "Runs src/server.ts to render the page server-side on every request",
        "error-capture.ts / error-page.ts wrap the SSR pipeline for graceful error handling",
        "Serves every request close to the visitor",
      ],
      relationships: [
        "Triggered by GitHub's webhook",
        "Resolved through Cloudflare DNS",
        "Reports to Workers Logs & Traces",
        "Serves the Portfolio application",
      ],
      buildProcess: "Webhook → npm install → vite build (client + server bundles) → deployed as a Worker",
      runtimeDetails:
        "wrangler.jsonc sets \"main\": \"src/server.ts\" and \"compatibility_flags\": [\"nodejs_compat\"] — the Worker genuinely executes this file per request; it's not serving pre-built static files",
    },
  },
  {
    id: "dns",
    title: "Cloudflare DNS",
    subtitle: "Domain Routing",
    meta: "CNAME · HTTPS/TLS",
    items: ["Custom Domain", "HTTPS / TLS"],
    category: "observability",
    icon: Globe,
    group: "observability",
    x: 785,
    y: 290,
    detail: {
      purpose: "Resolves the custom domain and routes every request to the right Worker over HTTPS.",
      technologies: ["Cloudflare DNS", "HTTPS / TLS"],
      responsibilities: ["Custom domain resolution", "TLS termination", "Routes traffic to Cloudflare Workers"],
      relationships: ["Two-way link with Cloudflare Workers", "Hands resolved requests through to the Portfolio"],
    },
  },
  {
    id: "logs",
    title: "Workers Logs",
    subtitle: "Observability",
    meta: "Request logging",
    items: ["Request Logs"],
    category: "observability",
    icon: FileText,
    group: "observability",
    x: 785,
    y: 150,
    detail: {
      purpose: "Captures request-level logs emitted by Cloudflare Workers for debugging.",
      technologies: ["Cloudflare Workers Logs"],
      responsibilities: ["Streams request logs", "Surfaces runtime errors"],
      relationships: ["Fed directly by Cloudflare Workers"],
      configuration: "wrangler.jsonc → observability.logs: { enabled: true, invocation_logs: true }",
    },
  },
  {
    id: "traces",
    title: "Workers Traces",
    subtitle: "Observability",
    meta: "Runtime tracing",
    items: ["Runtime Traces"],
    category: "observability",
    icon: Activity,
    group: "observability",
    x: 785,
    y: 430,
    detail: {
      purpose: "Traces execution inside Cloudflare Workers to spot latency and runtime issues.",
      technologies: ["Cloudflare Workers Traces"],
      responsibilities: ["Captures execution traces", "Helps diagnose slow requests"],
      relationships: ["Fed directly by Cloudflare Workers"],
      configuration: "wrangler.jsonc → observability.traces: { enabled: true }",
    },
  },
  {
    id: "portfolio",
    title: "Portfolio",
    subtitle: "The Application",
    meta: "Home · Projects · Contact",
    items: ["Home", "About", "Projects", "Media", "Resume", "Contact"],
    category: "application",
    icon: Briefcase,
    x: 1130,
    y: 290,
    detail: {
      purpose: "The live application visitors actually interact with.",
      technologies: ["React", "Vite", "TanStack Start", "Tailwind CSS"],
      responsibilities: ["Renders Home, About, Projects, Media & Resume", "Handles the Contact Form submission"],
      relationships: [
        "Served by Cloudflare DNS / Workers",
        "Sends Contact Form submissions to Communication",
        "Loaded by the User Browser",
      ],
      futureImprovements: "Add a blog / MDX-powered writing section",
    },
  },
  {
    id: "userBrowser",
    title: "User Browser",
    subtitle: "Client",
    meta: "Chrome · Firefox · Safari",
    items: ["Chrome", "Firefox", "Safari"],
    category: "client",
    icon: Monitor,
    x: 1370,
    y: 290,
    detail: {
      purpose: "The end of the main request flow — whatever browser a visitor is using to view the site.",
      technologies: ["Chrome", "Firefox", "Safari"],
      responsibilities: ["Renders the Portfolio over HTTPS", "Submits the Contact Form when used"],
      relationships: ["Receives the final response from the Portfolio"],
    },
  },
  {
    id: "communication",
    title: "EmailJS",
    subtitle: "Communication Service",
    meta: "Contact Form → Gmail",
    items: ["Contact Form", "Gmail Delivery"],
    category: "communication",
    icon: Mail,
    x: 1130,
    y: 500,
    detail: {
      purpose:
        "Delivers Contact Form submissions straight to my inbox — a branch off the Portfolio only, with no ties to GitHub or Cloudflare at all.",
      technologies: ["EmailJS", "Gmail"],
      responsibilities: [
        "Receives form data client-side",
        "Relays the message via the EmailJS API",
        "Delivers the email to Gmail",
      ],
      relationships: ["Only the Portfolio connects to it"],
      configuration: "Client-side only call from the Portfolio — no backend, no queue",
      futureImprovements: "Add a serverless fallback queue for guaranteed delivery",
    },
  },
];

const INFRA_EDGES: InfraEdge[] = [
  { from: "development", to: "github", label: "git push", style: "dashed", category: "build" },
  { from: "github", to: "workers", label: "webhook", style: "dashed", category: "build" },
  { from: "workers", to: "dns", label: "", style: "solid", category: "runtime", bidirectional: true },
  { from: "workers", to: "logs", label: "", style: "dotted", category: "runtime" },
  { from: "workers", to: "traces", label: "", style: "dotted", category: "runtime" },
  { from: "dns", to: "portfolio", label: "serves request", style: "solid", category: "observability" },
  { from: "portfolio", to: "userBrowser", label: "https", style: "solid", category: "application" },
  { from: "portfolio", to: "communication", label: "contact form", style: "vertical", category: "communication" },
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

const INFRA_CANVAS_W = 1515;
const INFRA_CANVAS_H = 589;

// Approximate rendered half-width/half-height of each node card (at the sm+ breakpoint),
// used to trim connector lines so they stop at the node's edge instead of its center.
function infraNodeHalfDims(node: InfraNode) {
  return node.size === "lg" ? { hw: 105, hh: 34 } : { hw: 75, hh: 34 };
}

// Given a node's center, its half-width/half-height, and a direction vector pointing
// away from that center (toward the other node), returns the point where that ray
// exits the node's rectangle, pushed outward by `gap` extra pixels.
function infraTrimToBox(
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  dx: number,
  dy: number,
  gap: number,
) {
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (adx < 0.0001 && ady < 0.0001) return { x: cx, y: cy };
  const scale = Math.min(adx > 0 ? hw / adx : Infinity, ady > 0 ? hh / ady : Infinity);
  const bx = cx + dx * scale;
  const by = cy + dy * scale;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x: bx + ux * gap, y: by + uy * gap };
}

const INFRA_EDGE_GAP = 12; // px between the arrowhead/line end and the node border

const INFRA_SUMMARY_CARDS: { title: string; category: InfraCategory; items: string[] }[] = [
  { title: "Edge Stack", category: "runtime", items: ["Cloudflare Workers", "Cloudflare DNS", "Edge Runtime", "HTTPS/TLS", "Custom Domain"] },
  { title: "Monitoring", category: "observability", items: ["Workers Logs", "Workers Traces", "Runtime Monitoring"] },
  { title: "Build Pipeline", category: "build", items: ["Development", "GitHub", "Git Push", "Webhook", "Automatic Deployment"] },
  { title: "Communication", category: "communication", items: ["EmailJS", "Gmail Delivery"] },
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
        .infra-scroll::-webkit-scrollbar { height: 10px; }
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
                backgroundSize: "28px 28px",
              }}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Group outlines (Build / Observability) */}
              {INFRA_GROUPS.map((g) => {
                const style = INFRA_CATEGORY_STYLE[g.category];
                return (
                  <div
                    key={g.id}
                    className={cn("absolute rounded-2xl border-2 border-dashed", style.ring)}
                    style={{ left: g.x, top: g.y, width: g.w, height: g.h, zIndex: 1 }}
                  >
                    <span
                      className={cn(
                        "surface-2 absolute -top-3 left-4 rounded px-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
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
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={INFRA_CATEGORY_STYLE[cat].stroke} />
                    </marker>
                  ))}
                </defs>
                {INFRA_EDGES.map((edge, i) => {
                  const from = nodeMap[edge.from];
                  const to = nodeMap[edge.to];
                  const isActive = !hovered || (activeIds?.has(edge.from) && activeIds?.has(edge.to));
                  const dash =
                    edge.style === "dashed"
                      ? "7 6"
                      : edge.style === "dotted"
                        ? "2 7"
                        : edge.style === "vertical"
                          ? "10 4 2 4"
                          : undefined;
                  const color = INFRA_CATEGORY_STYLE[edge.category].stroke;
                  const isLive = edge.style === "solid";

                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const fromDims = infraNodeHalfDims(from);
                  const toDims = infraNodeHalfDims(to);
                  const start = infraTrimToBox(
                    from.x,
                    from.y,
                    fromDims.hw,
                    fromDims.hh,
                    dx,
                    dy,
                    edge.bidirectional ? INFRA_EDGE_GAP : 0,
                  );
                  const end = infraTrimToBox(
                    to.x,
                    to.y,
                    toDims.hw,
                    toDims.hh,
                    -dx,
                    -dy,
                    INFRA_EDGE_GAP,
                  );

                  return (
                    <path
                      key={i}
                      d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={edge.style === "vertical" ? 1.6 : 1.8}
                      strokeDasharray={dash}
                      strokeLinecap="round"
                      markerEnd={`url(#infra-arrow-${edge.category})`}
                      markerStart={edge.bidirectional ? `url(#infra-arrow-${edge.category})` : undefined}
                      className={cn("transition-opacity duration-200", isLive && "infra-edge-live")}
                      style={{ opacity: isActive ? 0.9 : 0.12 }}
                    />
                  );
                })}
              </svg>

              {INFRA_EDGES.map((edge, i) => {
                if (!edge.label) return null;
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                const isActive = !hovered || (activeIds?.has(edge.from) && activeIds?.has(edge.to));
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const fromDims = infraNodeHalfDims(from);
                const toDims = infraNodeHalfDims(to);
                const start = infraTrimToBox(
                  from.x,
                  from.y,
                  fromDims.hw,
                  fromDims.hh,
                  dx,
                  dy,
                  edge.bidirectional ? INFRA_EDGE_GAP : 0,
                );
                const end = infraTrimToBox(to.x, to.y, toDims.hw, toDims.hh, -dx, -dy, INFRA_EDGE_GAP);
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;
                return (
                  <span
                    key={i}
                    className="surface-1 absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-border/50 px-1.5 py-0.5 text-[9px] text-muted-foreground transition-opacity duration-200 md:text-[10px]"
                    style={{ left: midX, top: midY, opacity: isActive ? 1 : 0.15, zIndex: 3 }}
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
                        "surface-1 flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-0.5",
                        isLg ? "w-[190px] sm:w-[210px]" : "w-[132px] sm:w-[150px]",
                        style.ring,
                      )}
                      style={{
                        boxShadow: isSelected
                          ? `0 0 0 2px ${style.stroke}, 0 0 22px 2px ${style.stroke}55`
                          : isHovered
                            ? `0 0 0 3px ${style.stroke}30`
                            : `0 0 12px -4px ${style.stroke}40`,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", style.text)} />
                        <span className="truncate text-xs font-semibold text-foreground">
                          {node.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{node.subtitle}</span>
                      <span className="truncate text-[9px] text-muted-foreground/60">{node.meta}</span>
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
        Whether it's a job opportunity, a project or just a tech conversation - I'd love to hear
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
                href="mailto:work.shelkeaditya@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
              >
                work.shelkeaditya@gmail.com
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
              <Send className="h-3.5 w-3.5 shrink-0" />
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

const JOURNEY = [
  {
    year: "Aug 2022",
    title: "Started B.Tech Journey",
    desc: "Began B.Tech in Cloud Technology & Information Security at Ajeenkya DY Patil University.",
  },

  {
    year: "Aug 2023",
    title: "Programming Foundations",
    desc: "Built programming fundamentals with C and Java while strengthening problem-solving skills.",
  },

  {
    year: "Jan 2024",
    title: "Cloud & Security",
    desc: "Started learning Cloud Computing, Linux, Networking, Python, and Information Security, building a strong technical foundation.",
  },

  {
    year: "Aug 2024",
    title: "AWS & Cloud Architecture",
    desc: "Explored AWS fundamentals, cloud architecture, virtualization, networking, and security through coursework and hands-on labs.",
  },

  {
    year: "Apr 2025",
    title: "Infrastructure Automation",
    desc: "Began automating deployments and managing cloud infrastructure using Docker, Linux, and DevOps tools.",
  },

  {
    year: "Jun 2025",
    title: "Real-World Projects",
    desc: "Built the Telemedicine Platform as a final-year group project while developing an internship-level cloud and DevOps project independently and learning Kubernetes.",
  },

  {
    year: "Jan 2026",
    title: "Internship & CI/CD",
    desc: "Worked on Jenkins, Power BI, CI/CD pipelines, and enhanced cloud and DevOps projects during my internship.",
  },

  {
    year: "Apr 2026",
    title: "AWS Certified",
    desc: "Earned the AWS Certified Cloud Practitioner (CLF-C02), validating foundational knowledge of AWS Cloud services, architecture, security, and best practices.",
  },

  {
    year: "Present",
    title: "Growing as a Cloud Engineer",
    desc: "Continuing to build expertise in AWS, Kubernetes, DevOps, Linux, Networking, and Security through hands-on projects and continuous learning.",
  },
];


// ═══════════════════════════════════════════════════════════
// SECTION - Journey
// ═══════════════════════════════════════════════════════════

function Journey() {
  return (
    <div>
      <SectionHeading title="Journey." />
      <ol className="relative ml-3 border-l border-border/70 pl-6">
        {JOURNEY.map((j, i) => (
          <li key={i} className="group relative pb-7 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border border-border/80 bg-card shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-blue)_18%,transparent)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue transition-all group-hover:scale-150" />
            </span>
            <div className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-blue)]/25">
              <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {j.year}
              </span>
              <div className="mt-1 text-base font-medium text-foreground">{j.title}</div>
              <div className="text-sm text-muted-foreground">{j.desc}</div>
            </div>
          </li>
        ))}
      </ol>
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