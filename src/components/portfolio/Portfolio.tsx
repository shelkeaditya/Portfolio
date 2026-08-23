import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ArrowLeft,
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
      <h2 className="flex items-baseline whitespace-nowrap text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
        <span>{base}</span>
        {hasDot && (
          <span
            aria-hidden
            className="ml-[0.1em] inline-block shrink-0 rounded-full"
            style={{
              width: "0.22em",
              height: "0.22em",
              marginBottom: "0.01em",
              backgroundColor: "var(--accent-blue)",
            }}
          />
        )}
      </h2>
      <span className="mt-3 flex h-[5px] w-[55px] overflow-hidden rounded-full">
        <span
          className="h-full"
          style={{ width: "18px", flexShrink: 0, backgroundColor: "var(--accent-orange)" }}
        />
        <span className="h-full flex-1" style={{ backgroundColor: "var(--accent-blue)" }} />
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

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.036 19.736 19.736 0 0 0-4.885 1.49.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 2.98.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.121.098.247.195.373.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.077.077 0 0 0 .084.029 19.836 19.836 0 0 0 6.002-2.981.077.077 0 0 0 .032-.055c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028ZM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.311-.956 2.38-2.157 2.38Zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.311-.947 2.38-2.157 2.38Z" />
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

// ═══════════════════════════════════════════════════════════
// GEOMETRIC PATTERN 1 — upper-left triangle-mosaic mark
// (exact code as provided; component renamed from `GeometricPattern`
// to `GeometricPatternMark1` only to avoid colliding with Pattern 2's
// export name, since both now live in this one file. Polygon points,
// palette, grid constants, and viewBox are untouched.)
// ═══════════════════════════════════════════════════════════

type Pattern1Point = {
  x: number;
  y: number;
};

type Pattern1Polygon = {
  points: Pattern1Point[];
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

const pt = (x: number, y: number): Pattern1Point => ({ x, y });

/** Serializes a Point[] into the SVG `points` attribute format. */
function toPointsAttrPattern1(points: Pattern1Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/** Darkens a hex color by `amount` (0–1) — used for each polygon's
 *  hairline edge, so facets read as distinct even when two adjacent
 *  triangles share the exact same fill. */
function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// ── Palette — sampled directly from the reference image ──
const PATTERN1_PALETTE = {
  maroon: "#A4151B",
  red: "#ED3138",
  orangeDeep: "#F77211", // saturated top-peak orange
  orangeBurnt: "#F36B33", // muted mid-column orange
  orange: "#F59629", // main bright orange
  teal: "#01C2C7",
  blue: "#0D77A2",
  peach: "#FBCA84",
} as const;

// Source canvas the coordinates below were measured against.
const PATTERN1_CANVAS_W = 507;
const PATTERN1_CANVAS_H = 625;

// ── Shared grid ──
// Columns (x): C0..C4 are the main vertical grid lines; the two
// C_FAR* values are only used by the small detached orange chip.
const C0 = 0;
const C1 = 56;
const C2 = 111;
const C3 = 167;
const C4 = 222;
const C_FAR1 = 241;
const C_FAR2 = 259;

// Rows (y): consistent 32px step from the top apex down.
const R0 = 2;
const R1 = 34;
const R2 = 66;
const R3 = 98;
const R4 = 130;
const R5 = 162;
const R6 = 194;
const R7 = 226;
const R8 = 258;
const R9 = 290;

// ── The mosaic, piece by piece ──
// Grouped top-to-bottom, matching how the shapes stack in the reference.
const PATTERN1_TRIANGLES: Pattern1Polygon[] = [
  // Small maroon triangle capping the very top of the mark.
  { points: [pt(C2, R0), pt(C1, R1), pt(C2, R2)], fill: PATTERN1_PALETTE.maroon },

  // Saturated orange peak, right of the maroon cap.
  { points: [pt(C2, R0), pt(C2, R2), pt(C3, R1)], fill: PATTERN1_PALETTE.orangeDeep },

  // Large red piece, clipped by the left edge of the canvas —
  // shares its top-right vertex with the maroon/orange peak and
  // its upper-left vertex with the maroon cap.
  { points: [pt(C2, R2), pt(C1, R1), pt(C0, R2), pt(C0, R4)], fill: PATTERN1_PALETTE.red },

  // Big bright-orange field — the widest piece in the composition.
  { points: [pt(C4, R2), pt(C3, R1), pt(C1, R3), pt(C2, R4)], fill: PATTERN1_PALETTE.orange },

  // Small detached orange triangle, floating free to the right.
  { points: [pt(C_FAR2, R2), pt(C_FAR1, 55), pt(C_FAR1 - 1, 78)], fill: PATTERN1_PALETTE.orange },

  // Burnt-orange vertical band running down the middle of the mark.
  { points: [pt(C3, R3), pt(C2, R4), pt(C2, R6), pt(C3, R5)], fill: PATTERN1_PALETTE.orangeBurnt },

  // Blue parallelogram, middle-left of the composition.
  { points: [pt(C1, R3), pt(C1, R5), pt(C2, R6), pt(C2, R4)], fill: PATTERN1_PALETTE.blue },

  // Tiny detached blue triangle, just below-right of the blue field.
  { points: [pt(91, 225), pt(76, 234), pt(90, 244)], fill: PATTERN1_PALETTE.blue },

  // Teal triangle touching the left edge, upper-middle height.
  { points: [pt(C0, R4), pt(C1, R5), pt(C1, R3)], fill: PATTERN1_PALETTE.teal },

  // Teal triangle pointing right, beside the blue field.
  { points: [pt(C1, R5), pt(C1, R7), pt(C2, R6)], fill: PATTERN1_PALETTE.teal },

  // Small detached teal triangle, lower-left, touching the canvas edge.
  { points: [pt(C1, R7), pt(C0, R8), pt(C1, R9)], fill: PATTERN1_PALETTE.teal },

  // Orange triangle beside the peach piece, lower portion of the mark.
  { points: [pt(C2, R6), pt(C3, R7), pt(C3, R5)], fill: PATTERN1_PALETTE.orange },

  // Light peach triangle — the lightest tone, bottom-right of the mosaic.
  { points: [pt(C3, R5), pt(C3, R7), pt(C4, R6)], fill: PATTERN1_PALETTE.peach },
];

type GeometricPatternMark1Props = {
  /** Extra classes for the outer container. */
  className?: string;
};

/**
 * Full-bleed dark canvas with the triangle mosaic anchored to the
 * upper-left corner — the rest of the canvas is intentionally left
 * empty, matching the reference's asymmetric composition.
 */
function GeometricPatternMark1({ className }: GeometricPatternMark1Props) {
  return (
    <div className={`relative h-full min-h-screen w-full overflow-hidden ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${PATTERN1_CANVAS_W} ${PATTERN1_CANVAS_H}`}
        preserveAspectRatio="xMinYMin meet"
        className="absolute inset-0 h-full w-full"
        style={{ transform: "scale(1.6)", transformOrigin: "top left" }}
        aria-hidden="true"
      >
        {PATTERN1_TRIANGLES.map((polygon, i) => (
          <polygon
            key={i}
            points={toPointsAttrPattern1(polygon.points)}
            fill={polygon.fill}
            stroke={polygon.stroke ?? darken(polygon.fill, 0.22)}
            strokeWidth={polygon.strokeWidth ?? 1}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GEOMETRIC PATTERN 2 — irregular triangle mosaic
// (exact code as provided; component renamed from `GeometricPattern`
// to `GeometricPatternMark2` only to avoid colliding with Pattern 1's
// export name, since both now live in this one file. Polygon points,
// fills, and viewBox are untouched.)
// ═══════════════════════════════════════════════════════════

type Pattern2Polygon = {
  points: [number, number][];
  fill: string;
};

const PATTERN2_STROKE = "rgba(0,0,0,0.15)";
const PATTERN2_STROKE_WIDTH = 0.7;

const PATTERN2_POLYGONS: Pattern2Polygon[] = [
  // -------- main mosaic body --------
  { points: [[394, 516], [247, 600], [247, 431]], fill: "#EF3239" }, // large red base triangle
  { points: [[470, 302], [470, 386], [395, 429], [323, 387]], fill: "#EF4D29" }, // orange-red kite
  { points: [[395, 344], [247, 429], [247, 345], [322, 302]], fill: "#F7972A" }, // mid orange kite
  { points: [[396, 430], [470, 472], [470, 558], [395, 516]], fill: "#0C78A3" }, // lower blue kite
  { points: [[322, 387], [395, 430], [395, 515], [321, 473]], fill: "#A5161C" }, // dark red kite
  { points: [[321, 217], [321, 300], [247, 343], [247, 259]], fill: "#F97211" }, // bright orange kite (upper)
  { points: [[470, 217], [470, 300], [396, 343], [396, 260]], fill: "#01BBBE" }, // teal kite
  { points: [[397, 258], [396, 343], [322, 301], [322, 216]], fill: "#0C78A3" }, // upper blue kite
  { points: [[470, 558], [397, 600], [323, 558], [395, 517]], fill: "#01C3C7" }, // bottom-right cyan kite
  { points: [[321, 388], [321, 471], [248, 430]], fill: "#F97211" }, // bright orange triangle (lower)
  { points: [[247, 174], [320, 216], [247, 257]], fill: "#F7972A" }, // orange peak triangle
  { points: [[470, 388], [470, 471], [397, 430]], fill: "#01C3C7" }, // cyan triangle (mid-right)
  { points: [[245, 174], [246, 257], [175, 216]], fill: "#FBCB86" }, // peach peak triangle
  { points: [[323, 216], [395, 174], [395, 257]], fill: "#02D4D8" }, // bright cyan triangle
  { points: [[246, 515], [175, 472], [246, 431]], fill: "#F36246" }, // coral triangle
  { points: [[469, 130], [397, 171], [397, 89]], fill: "#02D4D8" }, // large cyan triangle (top)

  // -------- detached / floating triangles --------
  { points: [[195, 301], [163, 320], [163, 283]], fill: "#F97211" }, // small orange detached triangle
  { points: [[173, 167], [194, 180], [173, 192]], fill: "#FBCB86" }, // small peach detached triangle
  { points: [[442, 41], [442, 62], [423, 52]], fill: "#02D4D8" }, // small cyan detached triangle (top-right)
  { points: [[171, 558], [99, 600], [99, 517]], fill: "#EF3239" }, // large red detached triangle (bottom-left)
];

function toPointsAttrPattern2(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

type GeometricPatternMark2Props = {
  className?: string;
};

function GeometricPatternMark2({ className }: GeometricPatternMark2Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className={className}
    >
      <svg
        viewBox="0 0 475 603"
        preserveAspectRatio="xMinYMin meet"
        width="90%"
        height="90%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {PATTERN2_POLYGONS.map((poly, i) => (
          <polygon
            key={i}
            points={toPointsAttrPattern2(poly.points)}
            fill={poly.fill}
            stroke={PATTERN2_STROKE}
            strokeWidth={PATTERN2_STROKE_WIDTH}
          />
        ))}
      </svg>
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

      {/* ── Decorative corner mosaics ──
          poly-bg-left / poly-bg-right (defined in styles.css) are the
          existing fixed-size corner boxes — upper-left and lower-right
          respectively — that this decoration has always lived in.
          GeometricPatternMark1 (upper-left mosaic) and GeometricPatternMark2
          (lower-right irregular mosaic) are defined above in this same
          file, with their exact polygon data, palette, and viewBox
          untouched from what was provided. */}
      <div className="poly-bg-left" aria-hidden="true">
        <GeometricPatternMark1 />
      </div>

      <div className="poly-bg-right" aria-hidden="true">
        <GeometricPatternMark2 />
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
  /** Projects only: unique slug used to route to this project's detail page. */
  slug?: string;
  /** Projects only: role / project type shown near the top of the detail page.
   *  Falls back to `subtitle` when omitted. */
  role?: string;
  /** Projects only: small badge shown next to the title (e.g. "Team Project"). */
  label?: string;
  /** Projects only: contributors credited on the detail page, shown directly
   *  below the description and before Tech Stack. Omit for solo projects. */
  contributors?: { name: string; github: string }[];
  /** Projects only: short architecture summary shown on the detail page. */
  architecture?: string;
  /** Projects only: notable challenges & how they were solved. Omitted
   *  entirely (not forced) when a project has nothing meaningful to show. */
  challenges?: { title: string; description: string }[];
  /** Projects only: any other relevant info shown at the end of the detail page. */
  otherInfo?: string;
  /** Heading shown above `otherInfo` (e.g. "Project Focus", "My Contribution").
   *  Falls back to "Notes" when omitted. */
  otherInfoTitle?: string;
  /** Projects only: live deployed app URL. When present, the card and detail
   *  page show an extra "View Project ↗" button that opens it in a new tab.
   *  Only set this for projects with a verified live URL. */
  liveUrl?: string;
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
  // WebP thumbnails are served from the "portfolio-assets" R2 bucket under
  // the "thumbnail/" object prefix, through the existing /r2/ Worker route
  // (same convention as the Certificates and Research Paper assets above).
  {
    category: ["Projects"],
    icon: <ShieldCheck className="h-5 w-5 text-green-400" />,
    title: "DevSecOps Flask Platform",
    subtitle: "Secure CI/CD Application",
    role: "Secure CI/CD Application",
    description:
      "A security-focused Flask application implementing DevSecOps practices throughout the development and deployment lifecycle. The platform combines containerization, automated CI/CD, vulnerability scanning, and code-quality analysis to identify security and quality issues before deployment.",
    tech: ["Python", "Flask", "Docker", "Git", "GitHub", "GitHub Actions", "Trivy", "SonarQube"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/devsecops-flask" }],
    slug: "devsecops",
    image: "/r2/thumbnail/devsecops.webp",
    architecture:
      "The Flask application is containerized with Docker and pushed through version control on GitHub. A GitHub Actions pipeline builds the image, runs Trivy to scan it for known vulnerabilities, and runs SonarQube to analyze code quality — surfacing security and quality issues before the build is ever deployed.",
    challenges: [
      {
        title: "Security in CI/CD",
        description:
          "Security checks needed to happen before deployment, not after the application reached the deployment environment. Trivy was integrated directly into the CI/CD workflow to catch vulnerabilities before deployment.",
      },
      {
        title: "Code Quality vs. Security",
        description:
          "Security alone doesn't guarantee maintainable software. SonarQube was added to the pipeline to analyze code quality and surface maintainability issues alongside the security checks.",
      },
      {
        title: "Automated Security Gates",
        description:
          "Manual security scans are inconsistent and easy to skip. GitHub Actions automates the security and quality checks as a required part of the development workflow.",
      },
    ],
  },
  {
    category: ["Projects"],
    icon: <Activity className="h-5 w-5 text-blue-400" />,
    title: "Resilient Server Monitoring Platform",
    subtitle: "Infrastructure Monitoring & Self-Healing",
    role: "Infrastructure Monitoring & Self-Healing",
    description:
      "A cloud-native server monitoring and self-healing platform that continuously monitors system resources, services, containers, and Kubernetes workloads. It detects infrastructure failures and performs automated recovery actions to improve service availability and reliability.",
    tech: [
      "Python",
      "Flask",
      "Linux",
      "Bash",
      "psutil",
      "Prometheus",
      "Node Exporter",
      "Grafana",
      "Docker",
      "Kubernetes",
      "Nginx",
      "Networking",
      "Cron",
      "Git",
      "GitHub",
    ],
    buttons: [
      {
        label: "GitHub",
        href: "https://github.com/shelkeaditya/Resilient-Server-Monitoring-Platform",
      },
    ],
    slug: "resilient-server-monitoring",
    image: "/r2/thumbnail/resilient-server-monitoring.webp",
    architecture:
      "A Python/Flask service uses psutil to continuously poll system resources, services, containers, and Kubernetes workloads, exposing metrics to Prometheus (via Node Exporter) and visualizing them in Grafana. Scheduled checks run through Cron, and detected failures trigger automated recovery actions to keep services available.",
    challenges: [
      {
        title: "Automated Failure Recovery",
        description:
          "Monitoring alone only tells you something failed. A recovery layer identifies the affected resource and performs the right action, such as restarting a service, Docker container, or Kubernetes workload.",
      },
      {
        title: "Multi-Level Health Monitoring",
        description:
          "CPU and memory metrics alone don't indicate whether an application is actually healthy. The platform combines system metrics, process checks, service availability, network checks, container status, and Kubernetes workload health.",
      },
      {
        title: "Infrastructure Observability",
        description:
          "Raw infrastructure metrics are difficult to interpret on their own. Prometheus, Node Exporter, and Grafana provide centralized metric collection and visualization for the whole platform.",
      },
    ],
  },
  {
    category: ["Projects"],
    icon: <Workflow className="h-5 w-5 text-blue-400" />,
    title: "CI/CD Platform",
    subtitle: "Automation Pipeline",
    role: "Automation Pipeline",
    description:
      "An end-to-end CI/CD platform that automates the software delivery lifecycle from source-code changes through build, testing, containerization, and deployment. It combines GitHub Actions and Jenkins with Docker and Linux-based automation to create a repeatable deployment workflow.",
    tech: ["Git", "GitHub", "GitHub Actions", "YAML", "Jenkins", "Docker", "Linux", "Shell/Bash"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/CICD-Platform" }],
    slug: "cicd-platform",
    image: "/r2/thumbnail/cicd-platform.webp",
    architecture:
      "Source changes on GitHub trigger a GitHub Actions workflow that hands off to Jenkins for orchestration. Jenkins builds and containerizes the application with Docker, runs automated tests, and drives Linux-based shell automation to deploy the build — producing a repeatable pipeline from commit to deployment.",
    challenges: [
      {
        title: "Pipeline Coordination",
        description:
          "Build, testing, containerization, and deployment needed to execute in the correct sequence. GitHub Actions and Jenkins were used to orchestrate the stages and enforce dependencies between them.",
      },
      {
        title: "Environment Consistency",
        description:
          "Applications can behave differently across environments. Docker packages the application and its dependencies into consistent containers so the deployed build matches what was tested.",
      },
      {
        title: "Reliable Delivery",
        description:
          "A failed build or validation step should never reach deployment. Pipeline validation gates each stage so unsuccessful builds are stopped before they can progress.",
      },
    ],
  },
  {
    category: ["Projects"],
    icon: <Cloud className="h-5 w-5 text-sky-400" />,
    title: "Nextcloud on Linux",
    subtitle: "Self-Hosted Private Cloud",
    role: "Self-Hosted Private Cloud",
    description:
      "A self-hosted private cloud deployed on a Linux server using Nextcloud, providing centralized file storage, synchronization, sharing, and remote access while maintaining control over the underlying infrastructure and data.",
    tech: ["Linux", "Nextcloud", "Nginx", "PHP", "MariaDB/MySQL", "WebDAV", "SSL/TLS", "Bash"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/Nextcloud-on-Linux" }],
    slug: "nextcloud-on-linux",
    image: "/r2/thumbnail/nextcloud-on-linux.webp",
    architecture:
      "Nextcloud runs on a Linux server behind Nginx, with PHP handling the application layer and MariaDB/MySQL as the backing database. WebDAV enables file sync and remote access, SSL/TLS secures traffic end-to-end, and Bash scripts handle server setup and maintenance.",
    otherInfo:
      "This project demonstrates practical experience with self-hosted cloud infrastructure, Linux server administration, web-stack configuration, persistent storage, database integration, secure remote access, and independently managing a cloud application.",
    otherInfoTitle: "Project Focus",
  },
  {
    category: ["Projects"],
    icon: <FileText className="h-5 w-5 text-indigo-400" />,
    title: "Connect2Cure",
    subtitle: "A Telemedicine Platform",
    role: "A Telemedicine Platform",
    label: "Team Project",
    description:
      "A full-stack telemedicine platform connecting patients and healthcare professionals through a digital healthcare system. The platform provides appointment management, medical records, prescriptions, patient/doctor dashboards, and AI-assisted symptom analysis.",
    tech: [
      "React.js",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Bootstrap",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST API",
      "JWT",
      "Bcrypt",
      "AWS",
      "Git",
      "GitHub",
      "Postman",
    ],
    buttons: [{ label: "GitHub", href: "https://github.com/DivyamOswal/Connect2Cure" }],
    slug: "connect2cure",
    image: "/r2/thumbnail/connect2cure.webp",
    liveUrl: "https://connect2-cure-dedu.vercel.app/",
    contributors: [{ name: "Divyam Oswal", github: "https://github.com/DivyamOswal" }],
    architecture:
      "A React.js front end talks to a Node.js/Express.js REST API, with MongoDB as the data store. JWT and Bcrypt handle authentication and credential security across separate patient and doctor dashboards, covering appointment management, medical records, prescriptions, and AI-assisted symptom analysis.",
    challenges: [
      {
        title: "Role-Based Access & Healthcare Data",
        description:
          "Patients and doctors require different permissions, and healthcare-related information needs controlled access. JWT authentication, Bcrypt password hashing, and role-based authorization separate the two workflows and restrict access to protected functionality.",
      },
    ],
    otherInfo:
      "Deployment & Infrastructure — managed frontend and backend deployment, kept the application live and operational, and managed the deployed application's availability. Also managed the production database containing patient and doctor user data, used AWS services as part of the project infrastructure, and handled deployment/infrastructure configuration to support the platform's ongoing operation and maintenance. Built as part of a team alongside Divyam Oswal.",
    otherInfoTitle: "My Contribution",
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

  // AWS is the only card with no `document` — it keeps its original,
  // untouched image-only viewer below. Every other certificate (PDF or
  // otherwise) goes through the same clean "document viewer" presentation,
  // whether the underlying file is a PDF or an image.
  const hasDocument = Boolean(card.document);
  const isPdfDocument = Boolean(card.document?.toLowerCase().endsWith(".pdf"));
  // Suppress the browser's native PDF toolbar/nav/scrollbar chrome and fit
  // the whole page inside the frame — no cropping, no reader controls.
  const pdfSrc = isPdfDocument
    ? `${card.document}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`
    : card.document;

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
          hasDocument
            ? "h-[min(96vh,1200px)] max-w-6xl"
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

        {hasDocument ? (
          // ── Clean certificate viewer (every non-AWS certificate) ──
          // Same treatment whether the source is a PDF or an image: fills
          // the enlarged modal, preserves aspect ratio, nothing cropped,
          // minimal surrounding padding, no reader chrome.
          <div className="flex min-h-0 flex-1 items-center justify-center bg-black/20 p-2 sm:p-3">
            {isPdfDocument ? (
              <iframe
                src={pdfSrc}
                title={card.title}
                className="h-full w-full rounded-lg border-0 bg-white shadow-inner"
              />
            ) : (
              <img
                src={card.document}
                alt={card.title}
                className="h-full w-full rounded-lg object-contain"
              />
            )}
          </div>
        ) : (
          // ── AWS Certified Cloud Practitioner — untouched original viewer ──
          card.image && (
            <div className="flex items-center justify-center bg-black/20 p-8 sm:p-10">
              <img
                src={card.image}
                alt={card.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

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

  const selectedProject = useMemo(
    () => CARDS.find((c) => c.slug === selectedSlug) ?? null,
    [selectedSlug],
  );

  // Internal navigation to a project's detail page — never opens a new tab,
  // and scrolls back to the top so the detail page opens from the top.
  const openProject = useCallback((slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  if (selectedProject) {
    return (
      <ProjectDetailPage project={selectedProject} onBack={() => setSelectedSlug(null)} />
    );
  }

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
          c.category.includes("Projects") && c.image ? (
            // ── Project card (thumbnail, clean by default, reveals on hover) ──
            <div
              key={c.title}
              className={cn(
                "surface-2 group flex flex-col overflow-hidden rounded-xl border border-border/60",
                CARD_ELEVATION_CLASSES,
                ACCENT_HOVER_CLASSES.blue,
              )}
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-black/20">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />

                {/* PROJECTS badge — always visible */}
                <span className="surface-3 absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                  Projects
                </span>

                {/* Subtle dark overlay + centered action buttons — same treatment as the Certification hover */}
                <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/0 p-4 opacity-0 transition-all duration-300 group-hover:bg-black/60 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => openProject(c.slug!)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/65"
                  >
                    Details
                    <span aria-hidden>→</span>
                  </button>
                  {c.buttons[0]?.href && (
                    <a
                      href={c.buttons[0].href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/65"
                    >
                      GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {c.liveUrl && (
                    <a
                      href={c.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/65"
                    >
                      View Project
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Title — always visible, card stays clean by default */}
              <div className="surface-3 border-t border-border/60 px-4 py-3">
                <h4 className="text-sm font-semibold text-foreground">{c.title}</h4>
              </div>
            </div>
          ) : c.image ? (
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
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors group-hover/img:border-white/40 group-hover/img:bg-black/65">
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

// ═══════════════════════════════════════════════════════════
// COMPONENT - Project detail page
// Clean case-study layout (HideMail reference): pill back-link, hero
// image (untouched), title/subtitle/metadata, description, then
// generously-spaced sections — Contributors (only where applicable),
// Tech Stack, Architecture, Challenges & Solutions (only when
// meaningful), any closing notes, and a GitHub button.
// ═══════════════════════════════════════════════════════════

/** Section heading style shared by Tech Stack / Architecture / Challenges &
 *  Solutions / closing-notes sections — normal title case, bold, no
 *  uppercase transform, no icons. */
function DetailHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 text-2xl font-bold text-foreground">{children}</h3>;
}

/** Compact blue-accent tech pill used only on the project detail page —
 *  distinct from the shared TechBadge used by Certifications/Publications,
 *  which stays exactly as-is elsewhere. */
function ProjectTechPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/10 px-3 py-1 text-xs font-medium text-accent-blue">
      {label}
    </span>
  );
}

function ProjectDetailPage({
  project,
  onBack,
}: {
  project: (typeof CARDS)[number];
  onBack: () => void;
}) {
  const githubHref = project.buttons[0]?.href;

  return (
    <div>
      {/* 1. Back to Portfolio — pill, dark/transparent, thin border, no blue fill */}
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-4 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Portfolio
      </button>

      {/* 2. Large project WebP — img tag itself untouched, do not modify */}
      {project.image && (
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/60 surface-2">
          <img
            src={project.image}
            alt={project.title}
            className="max-h-[440px] w-full object-cover"
          />
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-black/60 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/75"
            >
              View Project
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 3. Title + subtitle */}
      <h2 className="mb-2 text-[32px] font-bold leading-tight tracking-tight text-foreground md:text-[36px]">
        {project.title}
      </h2>
      <div className="mb-4 text-base text-muted-foreground md:text-lg">
        {project.subtitle}
      </div>

      {/* 4. Metadata — role pill, or "Team Project" for team projects */}
      <div className="mb-8 flex flex-wrap gap-2">
        {project.label ? (
          <span className="inline-flex items-center rounded-full border border-[color:var(--accent-blue)]/40 bg-[color:var(--accent-blue)]/10 px-3 py-1 text-xs font-medium text-accent-blue">
            {project.label}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-[color:var(--accent-blue)]/40 bg-[color:var(--accent-blue)]/10 px-3 py-1 text-xs font-medium text-accent-blue">
            {project.role ?? project.subtitle}
          </span>
        )}
      </div>

      {/* 5. Description */}
      <p className="mb-12 max-w-2xl text-[15px] leading-[1.7] text-muted-foreground md:text-base">
        {project.description}
      </p>

      {/* 6. Contributors — only where applicable, directly below description */}
      {project.contributors && project.contributors.length > 0 && (
        <div className="mb-12">
          <DetailHeading>Contributors</DetailHeading>
          <div className="flex flex-wrap gap-2">
            {project.contributors.map((c) => (
              <a
                key={c.name}
                href={c.github}
                target="_blank"
                rel="noreferrer"
                className="surface-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-border"
              >
                <Github className="h-3.5 w-3.5" />
                {c.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tech Stack */}
      {project.tech.length > 0 && (
        <div className="mb-12">
          <DetailHeading>Tech Stack</DetailHeading>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <ProjectTechPill key={t} label={t} />
            ))}
          </div>
        </div>
      )}

      {/* 8. Architecture — plain paragraph, no card */}
      {project.architecture && (
        <div className="mb-12">
          <DetailHeading>Architecture</DetailHeading>
          <p className="max-w-2xl text-[15px] leading-[1.7] text-muted-foreground md:text-base">
            {project.architecture}
          </p>
        </div>
      )}

      {/* 9. Challenges & Solutions — only when meaningful, never forced, max ~3 cards */}
      {project.challenges && project.challenges.length > 0 && (
        <div className="mb-12">
          <DetailHeading>Challenges &amp; Solutions</DetailHeading>
          <div className="space-y-3">
            {project.challenges.slice(0, 3).map((ch, i) => (
              <div
                key={ch.title}
                className="surface-2 flex gap-3.5 rounded-xl border border-border/60 p-5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/10 text-xs font-semibold text-accent-blue">
                  {i + 1}
                </span>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">{ch.title}</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {ch.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. Other relevant project information */}
      {project.otherInfo && (
        <div className="mb-12">
          <DetailHeading>{project.otherInfoTitle ?? "Notes"}</DetailHeading>
          <p className="max-w-2xl text-[15px] leading-[1.7] text-muted-foreground md:text-base">
            {project.otherInfo}
          </p>
        </div>
      )}

      {/* GitHub button (+ live-project button when a verified live URL exists) */}
      <div className="flex flex-wrap gap-3">
        {githubHref && (
          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-[color:var(--accent-blue)]/15"
          >
            View on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-[color:var(--accent-blue)]/15"
          >
            View Live Project
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
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
                <IconLink href="https://discord.com/users/792731006171611157" icon={DiscordIcon} label="Discord" />
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

  // ─────────────────────────────────────────────────────────
  // Centralized navigation handler.
  // Every nav trigger in the app (desktop sidebar, mobile bar,
  // Journey button, and any future nav entry point) must call
  // this single function instead of `setActive` directly. It
  // guarantees the destination section always opens scrolled
  // to the top — including when navigating between sections
  // that are already mounted / previously visited — without
  // requiring scroll logic on individual buttons.
  // ─────────────────────────────────────────────────────────
  const resetScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const navigateTo = useCallback(
    (section: SectionKey) => {
      setActive(section);
      // Reset immediately for instant feel...
      resetScroll();
      // ...and again on the next frame in case content height
      // changes (e.g. animate-in) shift the scroll position
      // after this render commits.
      requestAnimationFrame(resetScroll);
    },
    [resetScroll],
  );

  return (
    <div className="ambient-bg relative min-h-screen text-foreground">
      <BackgroundFX />
      <Toaster />

      {/* ── Main layout ── */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <ProfileHero onJourney={() => navigateTo("journey")} theme={theme} toggleTheme={toggle} />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
          <main className="surface-1 min-h-[420px] rounded-2xl border border-border/60 p-6 md:p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.7)] mb-24 md:mb-0">
            <SectionRenderer active={active} />
          </main>

          <div className="hidden md:block">
            <NavPanel active={active} setActive={navigateTo} theme={theme} toggleTheme={toggle} />
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
                onClick={() => navigateTo(key)}
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