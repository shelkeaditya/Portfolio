import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Instagram,
  Linkedin,
  Github,
  Flag,
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
  Workflow,
  Activity,
  ChevronDown,
  MessageSquare,
  X,
  ArrowLeft,
  Play,
  Square,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import emailjs from "@emailjs/browser";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type SectionKey = "about" | "resume" | "portfolio" | "infra" | "contact" | "journey";
type PortfolioFilter = "All" | "Projects" | "Certifications" | "Publications" | "Badges";

// ═══════════════════════════════════════════════════════════
// ROUTING - section <-> URL path
//
// Each section is its own URL (/about, /resume, /portfolio, /build,
// /contact, /journey), served by routes/$section.tsx. The route passes
// the section in as a prop, so the server renders the right section
// directly (no flash, and crawlers get real content per URL) and the
// browser back/forward buttons work through the router.
// ═══════════════════════════════════════════════════════════

export const SECTION_SLUG: Record<SectionKey, string> = {
  about: "about",
  resume: "resume",
  portfolio: "portfolio",
  infra: "build", // matches the "Build" label in the nav
  contact: "contact",
  journey: "journey",
};

export function sectionFromSlug(slug: string): SectionKey | null {
  const match = (Object.keys(SECTION_SLUG) as SectionKey[]).find((k) => SECTION_SLUG[k] === slug);
  return match ?? null;
}

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

  // The server always guesses "dark" (no access to localStorage), so the
  // very first client render can briefly disagree with the real saved
  // preference. `mounted` flips true right after hydration — consumers
  // that render theme-dependent visuals (e.g. the toggle's slider
  // position) should hold off on the "real" render until this is true,
  // instead of showing the server's guess and then snapping to correct.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Re-resolve on mount rather than trusting the lazy initializer's
    // result blindly. If anything outside this hook — a blocking
    // no-flash script in the document head, a service worker replay,
    // bfcache restoring a previous page state — already touched
    // localStorage or the `dark` class before this effect runs, this
    // re-read guarantees the hook's state actually matches what's on
    // screen instead of drifting from it.
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

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

  return { theme, toggle, mounted };
}

// ═══════════════════════════════════════════════════════════
// HOOK - useIsMobile
// Used by the certificate PDF viewer (see CertificateModal) to pick
// a rendering strategy that actually works on the current device.
// Desktop browsers have a built-in PDF plugin that renders a PDF
// dropped into an <iframe>; most mobile browsers (iOS Safari, Chrome
// for Android, etc.) do NOT — they fall back to a bare "can't
// display this file" prompt with a raw link, which is the bug this
// hook exists to work around. SSR-safe (matches the `typeof window
// === "undefined"` guard already used by useTheme above) and kept in
// sync with viewport changes/rotation via matchMedia's change event.
// ═══════════════════════════════════════════════════════════

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpointPx - 1}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpointPx]);

  return isMobile;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT - ThemeToggleDesktop (premium sliding pill switch)
// Used on md: and above.
// ═══════════════════════════════════════════════════════════

function ThemeToggleDesktop({
  theme,
  toggle,
  mounted = true,
  className,
}: {
  theme: "dark" | "light";
  toggle: () => void;
  // The server can't know the real saved theme (no localStorage access),
  // so it always guesses "dark". Until the client has mounted and
  // resolved the actual value, we render an inert placeholder instead
  // of the server's guess — otherwise the slider would briefly show the
  // wrong position on every load and look like it "resets" itself.
  mounted?: boolean;
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

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={cn("inline-block h-9 w-[104px] shrink-0 rounded-full", className)}
      />
    );
  }

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
  mounted = true,
  className,
}: {
  theme: "dark" | "light";
  toggleTheme: () => void;
  // See ThemeToggleDesktop's `mounted` comment — same reasoning applies
  // here for the mobile icon button.
  mounted?: boolean;
  className?: string;
}) {
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <span aria-hidden className={cn("inline-block h-11 w-11 rounded-full", className)} />
    );
  }

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

/** Lightweight fade-in wrapper for images served from R2 (profile photo,
 *  certificate/project thumbnails, certificate viewer). Shows a soft
 *  pulsing placeholder in place of the image until it has actually
 *  finished loading, then crossfades to the real image instead of the
 *  image popping in abruptly once the network request resolves.
 *
 *  `containerClassName` controls sizing/position of the wrapper (the
 *  space the image occupies in layout); `className` controls the
 *  image's own visual treatment (object-fit, rounding, ring, etc.) —
 *  matches whatever the original bare <img> className was, since this
 *  is a drop-in replacement, not a visual redesign. */
function FadeImage({
  src,
  alt,
  className,
  containerClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // If the browser already has this image cached, it can finish loading
  // before React attaches the onLoad listener below — the 'load' event
  // then never fires, and without this check the image would stay stuck
  // invisible behind the shimmer forever. img.complete catches that case
  // on mount (and whenever `src` changes).
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    // Outer layer: NOT overflow-hidden. Carries containerClassName, which
    // may include a ring/border (box-shadow) — a ring drawn on an element
    // that also has overflow-hidden gets clipped off, so the clip and the
    // ring must live on different elements.
    <div className={cn("relative", containerClassName)}>
      {/* Inner layer: the actual clip. rounded-[inherit] so it always
          matches whatever corner radius containerClassName set, without
          having to repeat it here. */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        {!loaded && !errored && (
          <div aria-hidden className="absolute inset-0 motion-safe:animate-pulse bg-foreground/[0.06]" />
        )}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-300",
            loaded || errored ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      </div>
    </div>
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
      <div className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
// (component renamed from `GeometricPattern` to `GeometricPatternMark2`
// only to avoid colliding with Pattern 1's export name, since both
// live in this one file. Colors and viewBox are untouched.
//
// Shared-vertex pass: every junction where two or more of these
// polygons meet was clustered (vertices within 3px of each other —
// well under the ~74-86px grid spacing, so no unrelated vertices
// were merged) and snapped to one canonical [x, y] value per
// junction, so adjoining edges line up exactly with no gaps or
// overlap. The four detached triangles are intentionally untouched
// — they aren't meant to touch anything.)
// ═══════════════════════════════════════════════════════════

type Pattern2Polygon = {
  points: [number, number][];
  fill: string;
};

const PATTERN2_STROKE = "rgba(0,0,0,0.15)";
const PATTERN2_STROKE_WIDTH = 0.7;

const PATTERN2_POLYGONS: Pattern2Polygon[] = [
  // -------- main mosaic body --------
  { points: [[395, 516], [247, 600], [247, 430]], fill: "#EF3239" }, // large red base triangle
  { points: [[470, 301], [470, 387], [396, 430], [322, 387]], fill: "#EF4D29" }, // orange-red kite
  { points: [[396, 343], [247, 430], [247, 344], [322, 301]], fill: "#F7972A" }, // mid orange kite
  { points: [[396, 430], [470, 472], [470, 558], [395, 516]], fill: "#0C78A3" }, // lower blue kite
  { points: [[322, 387], [396, 430], [395, 516], [321, 472]], fill: "#A5161C" }, // dark red kite
  { points: [[322, 216], [322, 301], [247, 344], [247, 258]], fill: "#F97211" }, // bright orange kite (upper)
  { points: [[470, 217], [470, 301], [396, 343], [396, 258]], fill: "#01BBBE" }, // teal kite
  { points: [[396, 258], [396, 343], [322, 301], [322, 216]], fill: "#0C78A3" }, // upper blue kite
  { points: [[470, 558], [397, 600], [323, 558], [395, 516]], fill: "#01C3C7" }, // bottom-right cyan kite
  { points: [[322, 387], [321, 472], [247, 430]], fill: "#F97211" }, // bright orange triangle (lower)
  { points: [[246, 174], [322, 216], [247, 258]], fill: "#F7972A" }, // orange peak triangle
  { points: [[470, 387], [470, 472], [396, 430]], fill: "#01C3C7" }, // cyan triangle (mid-right)
  { points: [[246, 174], [247, 258], [175, 216]], fill: "#FBCB86" }, // peach peak triangle
  { points: [[322, 216], [396, 172], [396, 258]], fill: "#02D4D8" }, // bright cyan triangle
  { points: [[246, 515], [175, 472], [247, 430]], fill: "#F36246" }, // coral triangle
  { points: [[469, 130], [396, 172], [397, 89]], fill: "#02D4D8" }, // large cyan triangle (top)

  // -------- detached / floating triangles (unchanged, kept separate) --------
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

// ───────────────────────────────────────────────────────────
// PdfReader - a smooth in-page PDF reader (CV and research paper).
//
// Why not an <iframe>? An iframe hands scrolling to the browser's PDF
// plugin. On Chrome (PC and Android) that plugin repaints the whole page
// on every scroll frame - especially under a blurred modal backdrop -
// which is the stickiness. iOS uses its own native renderer, which is why
// it was smooth there. Here every page is a plain <canvas> inside an
// ordinary scroll container, so the browser scrolls it on the GPU like
// any other content, identically on every device.
//
// Pages are drawn lazily: only pages near the viewport are rasterised,
// and pages that scroll far away release their pixels, so memory stays
// low on phones. Pixel density is capped at 2x for the same reason.
// ───────────────────────────────────────────────────────────
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

function PdfReaderPage({
  page,
  width,
  rootRef,
}: {
  page: PDFPageProxy;
  width: number;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);

  const base = useMemo(() => page.getViewport({ scale: 1 }), [page]);
  const height = (width * base.height) / base.width;

  // Track whether this page is near the viewport (one screen of margin).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      root: rootRef.current,
      rootMargin: "100% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

  // Draw while near the viewport; release the pixels when far away.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!visible || width <= 0) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: (width / base.width) * dpr });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const task: RenderTask = page.render({
      canvasContext: ctx,
      canvas,
      viewport,
    } as Parameters<PDFPageProxy["render"]>[0]);
    task.promise.catch(() => {}); // a cancelled render rejects - ignore
    return () => task.cancel();
  }, [visible, width, page, base.width]);

  return (
    <div
      ref={wrapRef}
      className="mx-auto mb-3 overflow-hidden rounded-md bg-white shadow-md last:mb-0"
      style={{ width, height }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

function PdfReader({ src, title }: { src: string; title: string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pageWidth, setPageWidth] = useState(0);

  // Load every page's size up front so the scroll height is correct and
  // stable before anything is drawn.
  useEffect(() => {
    let cancelled = false;
    let doc: PDFDocumentProxy | null = null;
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const task = pdfjs.getDocument(new URL(src, window.location.origin).href);
        doc = await task.promise;
        const loaded: PDFPageProxy[] = [];
        for (let i = 1; i <= doc.numPages; i++) loaded.push(await doc.getPage(i));
        if (cancelled) return;
        setPages(loaded);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void doc?.destroy();
    };
  }, [src]);

  // Fit pages to the reader's width (capped so desktop text stays readable).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      const styles = getComputedStyle(el);
      const inner = el.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      const next = Math.max(0, Math.min(Math.floor(inner), 900));
      setPageWidth((prev) => (Math.abs(prev - next) > 2 ? next : prev));
    };
    measure();
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 120);
    });
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      role="document"
      aria-label={title}
      className="h-full overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-5"
    >
      {status === "loading" && (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}
      {status === "error" && (
        <div className="flex h-full items-center justify-center text-sm">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="text-accent-blue underline underline-offset-2"
          >
            Open the PDF
          </a>
        </div>
      )}
      {status === "ready" &&
        pageWidth > 0 &&
        pages.map((page, i) => (
          <PdfReaderPage key={i} page={page} width={pageWidth} rootRef={scrollRef} />
        ))}
    </div>
  );
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Curriculum Vitae"
        onClick={(e) => e.stopPropagation()}
        className="surface-2 relative flex h-[min(90vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[color:var(--accent-blue)]/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200 motion-safe:ease-out"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 bg-black/20">
          <PdfReader src="/r2/aditya-shelke-cv.pdf" title="Aditya Shelke — CV" />
        </div>

        <div className="shrink-0 border-t border-border/60 p-5">
          <h3 className="text-lg font-semibold text-foreground">Curriculum Vitae</h3>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Hero loading skeleton
//
// Instead of an overlay with guessed shapes, the real hero text/buttons
// are tagged with `.sk`. While `data-sk="true"` (before hydration / until
// `mounted`), each tagged element keeps its exact layout box but shows a
// pulsing block instead of its content — so every placeholder sits exactly
// where the real text will appear, and nothing shifts when it swaps in.
// The attribute is true in the server-rendered HTML, so this paints before
// any JS runs.
//
// Wrapped in `scripting: enabled` so visitors with JavaScript disabled
// (where `mounted` would never flip) still see the real content instead
// of permanent placeholders.
// ═══════════════════════════════════════════════════════════

const HERO_SK_CSS = `
@media (scripting: enabled) {
  [data-sk="true"] .sk {
    color: transparent !important;
    text-shadow: none !important;
    background: rgba(128, 128, 128, 0.22);
    border-color: transparent !important;
    border-radius: 6px;
    animation: hero-sk-pulse 1.4s ease-in-out infinite;
  }
  [data-sk="true"] .sk * { visibility: hidden; }
  [data-sk="true"] .sk-role { width: 9.5rem; }
}
@keyframes hero-sk-pulse { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) {
  [data-sk="true"] .sk { animation: none; }
}
`;

function ProfileHero({
  onJourney,
  theme,
  toggleTheme,
  mounted,
}: {
  onJourney: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  mounted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  return (
    <>
    <section className="relative">
      <div
        data-sk={mounted ? "false" : "true"}
        className="surface-2 relative overflow-hidden rounded-2xl border border-border/60 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]"
      >
        <style>{HERO_SK_CSS}</style>
        {/* Mobile theme toggle — condensed circular button, shares theme state with the desktop slider */}
        <ThemeToggleMobile
          theme={theme}
          toggleTheme={toggleTheme}
          mounted={mounted}
          className="absolute top-3 right-3 z-20 md:hidden"
        />

        {/* ── 3-column row ── */}
        <div className="relative flex flex-col px-6 py-5 md:flex-row md:items-stretch md:gap-0 md:px-8 md:py-5">
          {/* ── COL 1 - Photo + name + role + mobile chevron ── */}
          <div className="flex flex-col justify-center md:flex-1 md:pr-8 md:border-r md:border-border/50">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <FadeImage
                  src="/r2/images/profile.jpeg"
                  alt="Aditya Shelke"
                  containerClassName="h-20 w-20 md:h-24 md:w-24 rounded-xl ring-2 ring-[color:var(--accent-orange)]/70"
                  className="rounded-xl object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight w-fit sk">
                  Aditya <span className="font-light text-muted-foreground">Shelke</span>
                </h1>
                {/* No `w-fit` here: VerticalSlide's words are absolutely
                    positioned, so a shrink-wrapped wrapper collapses to 0px
                    wide and its overflow-hidden clips the role text. The
                    skeleton width comes from `.sk-role` while loading only. */}
                <div className="mt-0.5 h-6 md:h-5 sk sk-role">
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
            <div className="md:w-[32%] md:px-19 md:flex md:flex-col md:justify-center md:border-r md:border-border/50">
              {/* Mobile */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/60"></span>

                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium sk">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Open to Work
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground/60 sk">Location :</span>
                    <span className="text-foreground/70 sk">Pune, IN</span>
                  </div>
                </div>

                <span className="block h-px bg-border/60" />

                <a
                  href="mailto:shelkeaditya@proton.me"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit sk"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  shelkeaditya@proton.me
                </a>
                <div className="flex items-center justify-between">
                  <div className="shrink-0">
                    <div className="inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden sk">
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
                    <div className="flex items-center gap-0.3 sk">
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
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-fit sk">
                  Current Status
                </div>
                <div className="gap-1 font-mono text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[11px] text-foreground/70">
                      <span className="sk">status:</span>
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-emerald-400 font-medium text-[13px] sk">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      available
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[11px] text-foreground/70">
                      <span className="sk">tz:</span>
                    </span>
                    <span className="text-[13px] text-foreground/70 sk">UTC+5:30</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[11px] text-foreground/70">
                      <span className="sk">location:</span>
                    </span>
                    <span className="text-[13px] text-foreground/70 sk">Pune, IN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── COL 3 - Download CV + email + socials ── */}
            <div className="hidden md:flex flex-col gap-3 pt-0 md:flex-1 md:pl-8 md:items-end">
              <span aria-hidden className="h-px w-full bg-border/60 md:hidden" />
              {/* Download CV */}
              <div className="inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden sk">
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

              {/* Email — wrapped in a flex-1 spacer so it centers vertically
                  in whatever space is available between the CV button above
                  and the social icons below, instead of sitting flush under
                  the button. */}
              <div className="flex flex-1 items-center">
                <a
                  href="mailto:shelkeaditya@proton.me"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors sk"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  shelkeaditya@proton.me
                </a>
              </div>

              {/* Social icons + theme toggle */}
              <div className="flex items-center gap-0.3 sk">
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
  mounted,
}: {
  active: SectionKey;
  setActive: (s: SectionKey) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  mounted: boolean;
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
        <ThemeToggleDesktop theme={theme} toggle={toggleTheme} mounted={mounted} />
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

      <div className="max-w-5xl space-y-5 text-[15px] leading-relaxed text-body">
        <p>
          I'm currently working as a Cloud & DevOps Engineer while building cloud-native
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
  tech,
  collapsedCount = 6,
}: {
  heading: string;
  organization?: string;
  year: string;
  location: string;
  description?: string;
  points?: string[];
  /** Every technology used in this role; always shown below a divider. */
  tech?: string[];
  /** Number of points shown before the "Show more" toggle appears. */
  collapsedCount?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const pointsId = useId();
  const collapsible = (points?.length ?? 0) > collapsedCount;
  const visiblePoints = points ? (collapsible && !showAll ? points.slice(0, collapsedCount) : points) : [];

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
          <p className="mt-3 text-sm leading-relaxed text-body">{description}</p>
        )}
        {points && points.length > 0 && (
          <>
            <ul id={pointsId} className="mt-3 space-y-1.5">
              {visiblePoints.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue" />
                  {p}
                </li>
              ))}
            </ul>
            {collapsible && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                aria-controls={pointsId}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md font-mono text-xs font-medium text-accent-blue outline-none transition-colors hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[color:var(--accent-blue)]/50"
              >
                {showAll ? "Show Less" : `Show More (${(points?.length ?? 0) - collapsedCount} more)`}
              </button>
            )}
          </>
        )}
        {tech && tech.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-5">
            {tech.map((t) => (
              <span
                key={t}
                className="surface-3 rounded-md border border-border/60 px-2.5 py-1 font-mono text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
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
            heading="Cloud & DevOps Engineer"
            organization="E-Sutra Technologies"
            year="Jun 2026 – Present"
            location="Remote"
            description="Working on real-world DevOps and cloud tasks including CI/CD pipeline management, infrastructure automation, and security practices in an Agile team environment."
            points={[
              "Managed end-to-end deployment and operational support for production applications across Linux-based cloud environments, coordinating application builds, environment configuration, container deployment, release validation, and troubleshooting to maintain reliable application delivery.",
              "Designed, maintained, and troubleshot CI/CD pipelines using Jenkins and GitHub, automating application builds and deployment workflows to improve release consistency and minimize manual intervention.",
              "Provisioned and administered Oracle Cloud Infrastructure (OCI) virtual machines and deployment environments, managing server configuration, application runtime dependencies, remote access, and infrastructure readiness for production workloads.",
              "Containerized and deployed applications using Docker and Docker Compose, configuring service definitions, environment variables, port mappings, volumes, and container networking to standardize deployments and simplify application lifecycle management.",
              "Managed application deployment workflows using Coolify and Git-based repositories, supporting containerized builds, deployment configuration, production hosting, and application release operations.",
              "Configured and maintained Nginx reverse proxy infrastructure, managing domain-based routing, upstream connectivity, and web server configurations to enable reliable access to hosted applications.",
              "Administered Linux servers through SSH, performing service management, process inspection, filesystem operations, permission troubleshooting, and system diagnostics to maintain deployment environments and resolve infrastructure issues.",
              "Conducted vulnerability assessments across server and application environments, identifying security weaknesses, exposed services, misconfigurations, and potential attack vectors, and implementing remediation measures to strengthen infrastructure security.",
              "Investigated and remediated Linux server security issues by reviewing access permissions, SSH configurations, running services, scheduled tasks, and network exposure, helping reduce the attack surface of production infrastructure.",
              "Investigated suspected security compromises by analyzing suspicious cron jobs, unauthorized processes, anomalous filesystem activity, and potential malware indicators to identify persistence mechanisms and support incident containment and remediation.",
              "Supported infrastructure recovery following a suspected server compromise by preserving application backups, provisioning clean Linux environments, reinstalling deployment infrastructure, and restoring applications to re-establish production hosting.",
              "Troubleshot production deployment failures involving container startup issues, application runtime configuration, port-binding mismatches, upstream connectivity, and HTTP gateway errors, using logs and system diagnostics to identify root causes and restore application functionality.",
              "Managed application processes using PM2, monitoring process status, analyzing runtime logs, and troubleshooting execution and configuration issues affecting Node.js-based application deployments.",
              "Performed functional and browser automation testing using Selenium and Playwright, alongside performance testing with Apache JMeter, to validate application behavior, browser compatibility, responsiveness, and release readiness.",
              "Collaborated with development and QA teams in an Agile environment to investigate application and infrastructure issues, coordinate releases, validate deployment readiness, and improve the reliability and consistency of production delivery workflows.",
            ]}
            tech={"Linux, Bash, Shell Scripting, Git, GitHub, Jenkins, GitHub Actions, Docker, Docker Compose, Kubernetes, PM2, Nginx, Apache, SSH, TCP/IP, DNS, HTTP/HTTPS, Selenium, Playwright, Apache JMeter, SonarQube, Postman, Prometheus, Grafana, Trivy, Checkov, HashiCorp Vault, Python".split(", ")}
          />
          <div className="mt-4">
            <ResumeItem
              heading="Cloud, DevOps & Security Projects"
              organization="Independent Practice"
              year="Mar 2023 – Aug 2025"
              location=""
              description="Built and managed personal cloud, virtualization, DevOps, networking, and cybersecurity labs involving cloud infrastructure, Linux administration, automation, and security assessment."
              points={[
                "Provisioned and explored cloud infrastructure using AWS EC2, S3, IAM, VPC, EBS, ELB, EKS, ECR, and CloudWatch, practicing resource configuration, access control, networking, and monitoring.",
                "Created and managed virtualized environments using VMware Workstation, VMware vSphere, and VirtualBox, running Linux distributions and testing isolated infrastructure configurations.",
                "Administered Linux environments including Debian, Ubuntu, and Kali Linux, performing package management, service administration, filesystem operations, user permissions, and system troubleshooting.",
                "Configured SSH-based remote administration, Linux services, network connectivity, DNS resolution, TCP/IP communication, and HTTP/HTTPS troubleshooting across virtual machines and cloud-hosted environments.",
                "Built CI/CD workflows using Jenkins and GitHub Actions, integrating Git/GitHub version control with automated build, testing, and application deployment processes.",
                "Containerized applications using Docker and Docker Compose and explored Kubernetes, Minikube, kubectl, and Helm for container orchestration and workload management.",
                "Practiced Infrastructure as Code using Terraform and explored configuration management, cloud resource provisioning, and repeatable infrastructure deployment.",
                "Performed network reconnaissance and enumeration using Nmap, WHOIS, Shodan, and TheHarvester to investigate exposed services, domain information, and publicly available infrastructure details.",
                "Used Wireshark and Linux networking utilities to inspect network traffic, troubleshoot connectivity, and study network protocols, communication flows, and security weaknesses.",
                "Explored penetration testing and wireless security tools in Kali Linux, including the Aircrack-ng suite, Wash, Reaver, and Hashcat, within authorized lab environments.",
                "Practiced vulnerability assessment, web security testing, and system hardening, investigating misconfigurations, access control weaknesses, exposed services, and potential attack vectors.",
                "Deployed and experimented with self-hosted applications and cloud services, including Nextcloud, while exploring reverse proxy configuration, web hosting, infrastructure monitoring, and application availability.",
              ]}
              tech={"AWS, GCP, Azure, OCI, Cloudflare, VMware Workstation, VMware vSphere, VirtualBox, WSL, Windows, Linux, Debian, Ubuntu, Kali Linux, Bash, Shell Scripting, Git, GitHub, Jenkins, GitHub Actions, Docker, Docker Compose, Kubernetes, Minikube, kubectl, Helm, Terraform, Coolify, PM2, Nginx, Apache, SSH, TCP/IP, DNS, HTTP/HTTPS, Nmap, Wireshark, WHOIS, Shodan, TheHarvester, Prometheus, Grafana, Trivy, Checkov, HashiCorp Vault, Python, Java, Tailwind CSS, Vite, TanStack Start, Nextcloud, Cloudflare Workers, Wrangler, Cloudflare R2, Portainer".split(", ")}
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

  // ── Projects ────────────────────────────────────────────
  // Ordered by relevance to Cloud / DevOps / Cloud Security / Infrastructure:
  // DevSecOps (security+CI/CD) > Resilient Server Monitoring (infra/observability)
  // > CI/CD Platform (automation pipeline) > Nextcloud on Linux (self-hosted infra)
  // > Connect2Cure (full-stack app; least Cloud/DevOps-specific).
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
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/devsecops" }],
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

// ───────────────────────────────────────────────────────────
// PdfCertificate - renders page 1 of a PDF certificate onto a canvas at
// its real size (PDF points -> CSS pixels at 96dpi), shrunk only when it
// would not fit the viewport. Unlike an <iframe>, a canvas has a real
// size, so the modal can wrap the certificate tightly with no blank
// space. It also works on mobile, where browsers have no PDF plugin.
// pdf.js is loaded on demand, so it never touches the initial bundle or
// server rendering.
// ───────────────────────────────────────────────────────────
const PDF_CSS_SCALE = 96 / 72;

function PdfCertificate({ src, title }: { src: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<PDFPageProxy | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cssSize, setCssSize] = useState<{ w: number; h: number } | null>(null);
  const [renderTick, setRenderTick] = useState(0);

  // Load the document and its first page.
  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const task = pdfjs.getDocument(new URL(src, window.location.origin).href);
        loadingTask = task;
        const doc = await task.promise;
        const page = await doc.getPage(1);
        if (cancelled) return;
        pageRef.current = page;
        setRenderTick((n) => n + 1);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      pageRef.current = null;
      void loadingTask?.destroy();
    };
  }, [src]);

  // Re-fit when the window is resized (debounced).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setRenderTick((n) => n + 1), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Draw the page.
  useEffect(() => {
    const page = pageRef.current;
    const canvas = canvasRef.current;
    if (!page || !canvas) return;
    let cancelled = false;
    let task: RenderTask | null = null;
    (async () => {
      const base = page.getViewport({ scale: PDF_CSS_SCALE });
      const maxW = window.innerWidth * 0.94 - 16;
      const maxH = window.innerHeight * 0.78;
      const fit = Math.min(1, maxW / base.width, maxH / base.height);
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: PDF_CSS_SCALE * fit * dpr });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, canvas, viewport } as Parameters<
        PDFPageProxy["render"]
      >[0]);
      try {
        await task.promise;
      } catch {
        return; // cancelled by a newer render
      }
      if (cancelled) return;
      setCssSize({ w: base.width * fit, h: base.height * fit });
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [renderTick]);

  return (
    <div className="relative">
      {status !== "ready" && (
        <div className="flex h-48 w-[min(80vw,420px)] items-center justify-center text-sm text-muted-foreground">
          {status === "error" ? (
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-accent-blue underline underline-offset-2"
            >
              Open certificate PDF
            </a>
          ) : (
            "Loading certificate…"
          )}
        </div>
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={title}
        className={cn("block rounded-lg bg-white", status !== "ready" && "hidden")}
        style={cssSize ? { width: cssSize.w, height: cssSize.h } : undefined}
      />
    </div>
  );
}

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

  // Certificates that ship a preview image (every PDF certificate has a
  // matching .webp) are shown as that image, so the panel hugs the
  // certificate's own size — no empty space on the sides — with the
  // short details underneath. The iframe viewer is only a fallback for a
  // PDF with no preview image.
  // PDF certificates are drawn from the PDF itself (the document file,
  // not the thumbnail). A research paper is a multi-page PDF, so it keeps
  // the scrollable iframe viewer instead.
  const isPaper = Boolean(card.paperDocument) && card.document === card.paperDocument;
  const renderAsPdfCanvas = isPdfDocument && !isPaper;
  const imageSrc = renderAsPdfCanvas
    ? undefined
    : hasDocument
      ? isPdfDocument
        ? undefined
        : card.document
      : card.image;
  const showAsImage = renderAsPdfCanvas || Boolean(imageSrc);

  // A research paper (multi-page PDF) opens in the canvas-based PdfReader.
  const isPaperViewer = hasDocument && !showAsImage;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
        // A scrolling reader under a blurred backdrop forces a re-blur on
        // every frame, so the reader gets a plain dim backdrop instead.
        isPaperViewer ? "bg-black/80" : "bg-black/70 backdrop-blur-sm",
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "surface-2 relative flex w-full flex-col rounded-2xl border shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200 motion-safe:ease-out",
          showAsImage
            ? // Every certificate: the panel is exactly as wide as the
              // certificate shown at its own size (only shrunk when it
              // would not fit the viewport). No minimum width, so it
              // never grows past the certificate.
              "h-fit max-h-[92vh] w-fit max-w-[94vw] overflow-y-auto overflow-x-hidden"
            : hasDocument
              ? // Research paper: a fixed reader box with its own scroll.
                "h-[min(92vh,1100px)] w-full max-w-4xl overflow-hidden"
              : "max-w-lg overflow-hidden",
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

        {showAsImage ? (
          // ── Certificate at its real size ──
          // Natural size, aspect ratio preserved, capped only by the
          // viewport. The panel wraps this tightly, so nothing is wider
          // than the certificate itself.
          <div className="flex items-center justify-center bg-black/20 p-2">
            {renderAsPdfCanvas ? (
              <PdfCertificate src={card.document as string} title={card.title} />
            ) : (
              <img
                src={imageSrc}
                alt={card.title}
                className="block h-auto w-auto max-h-[78vh] max-w-full rounded-lg object-contain"
              />
            )}
          </div>
        ) : (
          hasDocument && (
            <div className="min-h-0 flex-1 bg-black/20">
              <PdfReader src={card.document as string} title={card.title} />
            </div>
          )
        )}

        <div
          className={cn(
            "border-t border-border/60 p-5",
            // width:0 + min-width:100% -> the footer takes the
            // certificate's width but never adds to it.
            showAsImage && "w-0 min-w-full",
          )}
        >
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

  // ── Mobile/touch parity for the hover-reveal card overlays ──
  // The Project / Certificate-and-Badge / Publication cards below all
  // reveal their black detail overlay via CSS `group-hover:`, which
  // only exists on devices with a real pointer — on touch, hover never
  // fires, so the overlay (and the buttons inside it) was effectively
  // unreachable. `openOverlayKey` tracks which single card's overlay is
  // toggled open by a tap; each card's overlay className OR-s this
  // state in alongside its existing `group-hover:` classes, so desktop
  // hover behavior is completely unchanged and this only adds a second,
  // independent way to reach the exact same overlay. A tap outside the
  // open card (see the effect below) or on a different card closes it.
  const [openOverlayKey, setOpenOverlayKey] = useState<string | null>(null);

  useEffect(() => {
    if (!openOverlayKey) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const cardEl = target?.closest("[data-overlay-card]");
      const cardKey = cardEl?.getAttribute("data-overlay-card") ?? null;
      if (cardKey !== openOverlayKey) setOpenOverlayKey(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openOverlayKey]);

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
                ? "border-[color:var(--accent-blue)] bg-[color:var(--accent-blue)] text-background"
                : "surface-2 border-border/60 text-muted-foreground hover:border-[color:var(--accent-blue)]/50 hover:text-[color:var(--accent-blue)]",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid. Keyed by filter so every filter change remounts the
          cards: otherwise cards present in both the old and new filter
          (same key) are reused in place and never animate in. */}
      <div key={filter} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((c) =>
          c.category.includes("Projects") && c.image ? (
            // ── Project card (thumbnail, clean by default, reveals on hover) ──
            <div
              key={c.title}
              data-overlay-card={c.title}
              onClick={() =>
                setOpenOverlayKey((prev) => (prev === c.title ? null : c.title))
              }
              className={cn(
                "surface-2 group flex flex-col overflow-hidden rounded-xl border border-border/60",
                CARD_ELEVATION_CLASSES,
                ACCENT_HOVER_CLASSES.blue,
              )}
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-black/20">
                <FadeImage
                  src={c.image}
                  alt={c.title}
                  containerClassName="h-full w-full"
                  className="object-cover"
                />

                {/* PROJECTS badge — always visible */}
                <span className="surface-3 absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                  Projects
                </span>

                {/* Subtle dark overlay + centered action buttons — same treatment as the Certification hover.
                    Desktop: group-hover: reveals it. Mobile: tapping the card sets openOverlayKey and this
                    OR-s in the same visible classes — same overlay, same buttons, same styling either way. */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/0 p-4 opacity-0 pointer-events-none transition-all duration-300 group-hover:pointer-events-auto group-hover:bg-black/60 group-hover:opacity-100",
                    openOverlayKey === c.title && "pointer-events-auto bg-black/60 opacity-100",
                  )}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      openProject(c.slug!);
                    }}
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
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
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
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
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
              <div
                data-overlay-card={c.title}
                onClick={() =>
                  setOpenOverlayKey((prev) => (prev === c.title ? null : c.title))
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveCert(c);
                  }
                }}
                aria-label={`View ${c.imageLabel ?? c.title} certificate`}
                className="group/img relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-black/20"
              >
                <span className="surface-3 absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
                  🏆 {c.category[0]}
                </span>
                <FadeImage
                  src={c.image}
                  alt={c.title}
                  containerClassName="h-full w-full"
                  className="object-contain p-6"
                />
                {/* Desktop: group-hover/img: reveals it. Mobile: tapping the card sets
                    openOverlayKey and this OR-s in the same visible classes — same
                    overlay, same button, same styling either way. */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 pointer-events-none transition-all duration-300 group-hover/img:pointer-events-auto group-hover/img:bg-black/60 group-hover/img:opacity-100",
                    openOverlayKey === c.title && "pointer-events-auto bg-black/60 opacity-100",
                  )}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCert(c);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/65"
                  >
                    View Certificate
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
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
              data-overlay-card={c.title}
              onClick={() =>
                setOpenOverlayKey((prev) => (prev === c.title ? null : c.title))
              }
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
                  <FadeImage
                    src={c.previewImage}
                    alt={c.title}
                    containerClassName="h-full w-full"
                    className="object-cover object-top"
                  />
                )}
                {/* Desktop: group-hover: reveals it. Mobile: tapping the card sets
                    openOverlayKey and this OR-s in the same visible classes — same
                    overlay, same buttons, same styling either way. */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 pointer-events-none transition-all duration-300 group-hover:pointer-events-auto group-hover:bg-black/55 group-hover:opacity-100",
                    openOverlayKey === c.title && "pointer-events-auto bg-black/55 opacity-100",
                  )}
                >
                  {c.paperDocument && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCert({
                          ...c,
                          title: `${c.title} — Research Paper`,
                          image: undefined,
                          document: c.paperDocument,
                          buttons: [],
                          certDetails: undefined,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:border-[color:var(--accent-blue)]/70 hover:bg-black/65"
                    >
                      Read Paper
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                  {c.certificateDocument && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCert({
                          ...c,
                          title: `${c.title} — Certificate`,
                          image: undefined,
                          document: c.certificateDocument,
                          buttons: [],
                          certDetails: undefined,
                        });
                      }}
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
        className="mb-8 inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-4 text-sm text-muted-foreground transition-colors hover:border-[color:var(--accent-blue)]/50 hover:text-[color:var(--accent-blue)]"
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
                  <p className="text-sm leading-relaxed text-body">
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
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-transparent px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-[color:var(--accent-blue)] hover:!text-background"
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
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--accent-blue)]/50 bg-transparent px-4 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-[color:var(--accent-blue)] hover:!text-background"
          >
            View Live Project
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - Build (native architecture diagram)
//
// Inline-SVG reproduction of the reference architecture diagram
// (classic preset). Geometry is expressed in a fixed 923×589 viewBox
// so node sizes, spacing and connector routing keep their proportions
// at every width; narrow screens scroll horizontally instead of
// squeezing the nodes.
//
// All colours live in CSS variables scoped to `.arch-root`, switched by
// the portfolio's existing theme (`data-theme`) — no second toggle and
// no global styles. Trace / pulse animations only run while the "Trace"
// control is on; `prefers-reduced-motion` disables all motion.
// ═══════════════════════════════════════════════════════════

type ArchCat = "backend" | "database" | "cloud" | "external";
type ArchIcon = "browser" | "code" | "cloud" | "database";
type ArchColor = "green" | "purple" | "red" | "grey";

interface ArchNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cat: ArchCat;
  icon: ArchIcon;
  title: string;
  sub: string;
  src: number;
  titleDy: number;
  subDy: number;
}

interface ArchEdge {
  id: string;
  from: string;
  to: string;
  d: string;
  color: ArchColor;
  dashed: boolean;
  width: number;
  label: string;
  lx: number;
  ly: number;
}

const ARCH_W = 923;
const ARCH_H = 589;

const ARCH_NODES: ArchNode[] = [
  { id: "browser", x: 65, y: 248, w: 155, h: 71, cat: "external", icon: "browser", title: "User Browser", sub: "Portfolio visitor", src: 2, titleDy: 32, subDy: 48 },
  { id: "worker", x: 388, y: 248, w: 184, h: 75, cat: "backend", icon: "code", title: "Cloudflare Worker", sub: "TanStack Start SSR · src/server.ts", src: 3, titleDy: 35, subDy: 50 },
  { id: "r2", x: 685, y: 366, w: 165, h: 71, cat: "database", icon: "database", title: "R2 Bucket", sub: "portfolio-assets", src: 2, titleDy: 32, subDy: 48 },
  { id: "obs", x: 685, y: 102, w: 205, h: 75, cat: "cloud", icon: "cloud", title: "Observability", sub: "Worker logs · invocation logs · traces", src: 1, titleDy: 34, subDy: 50 },
  { id: "email", x: 338, y: 448, w: 174, h: 71, cat: "external", icon: "browser", title: "EmailJS", sub: "Contact form delivery", src: 1, titleDy: 33, subDy: 49 },
];

// Order matters for the trace stagger (160ms per step).
const ARCH_DESC: Record<string, string> = {
  browser: "The visitor's browser loads the portfolio page, receives the server-rendered HTML, and requests the assets needed to display the site.",
  worker: "Runs the TanStack Start SSR application through src/server.ts. Handles incoming portfolio requests, returns server-rendered HTML, serves application responses, and retrieves static assets from R2.",
  r2: "Stores portfolio assets such as images, the profile photo, favicon, and resume. The Worker retrieves these objects when the application requests them.",
  obs: "Provides visibility into Worker execution through logs, invocation records, and traces, helping diagnose errors and investigate runtime behavior.",
  email: "Handles portfolio contact form delivery through the EmailJS API, allowing visitors to send messages through the contact form.",
};

// Real request lifecycle used by the "Run request trace" walkthrough.
const ARCH_FLOW: string[] = ["req", "assets", "bytes", "html", "logs"];

const ARCH_EDGES: ArchEdge[] = [
  { id: "req-r2", from: "browser", to: "worker", d: "M142 248 V232 Q142 226 148 226 H474 Q480 226 480 232 V246", color: "grey", dashed: false, width: 1.4, label: "GET /r2/* · images and PDFs", lx: 310, ly: 175 },
  { id: "req", from: "browser", to: "worker", d: "M220 276 H386", color: "green", dashed: false, width: 2, label: "HTTPS page request · /portfolio", lx: 304, ly: 264 },
  { id: "html", from: "worker", to: "browser", d: "M480 323 V342 Q480 348 474 348 H148 Q142 348 142 342 V321", color: "purple", dashed: true, width: 1.5, label: "SSR HTML", lx: 310, ly: 337 },
  { id: "assets", from: "worker", to: "r2", d: "M572 299 H622 Q628 299 628 305 V404 Q628 410 634 410 H683", color: "green", dashed: false, width: 2, label: "Assets.get(key)", lx: 585, ly: 355 },
  { id: "bytes", from: "r2", to: "worker", d: "M685 396 H669 Q663 396 663 390 V291 Q663 285 657 285 H574", color: "purple", dashed: true, width: 1.5, label: "Object bytes", lx: 663, ly: 328 },
  { id: "logs", from: "worker", to: "obs", d: "M572 271 H622 Q628 271 628 265 V145 Q628 139 634 139 H683", color: "purple", dashed: true, width: 1.5, label: "Invocation logs · traces", lx: 628, ly: 194 },
  { id: "contact", from: "browser", to: "email", d: "M220 290 H273 Q279 290 279 296 V478 Q279 484 285 484 H336", color: "red", dashed: true, width: 1.5, label: "Contact form · EmailJS API", lx: 279, ly: 375 },
];

/** Final point (the arrowhead tip) of an edge path — where the arrival ping fires.
 *  Handles the M / H / V / Q commands the edges above use. */
function pathEnd(d: string): { x: number; y: number } {
  let x = 0;
  let y = 0;
  const re = /([MLHVQ])([^MLHVQ]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const n = m[2].trim().split(/[\s,]+/).map(Number);
    if (m[1] === "H") x = n[0];
    else if (m[1] === "V") y = n[0];
    else if (m[1] === "Q") {
      x = n[2];
      y = n[3];
    } else {
      x = n[0];
      y = n[1];
    }
  }
  return { x, y };
}

const ARCH_END: Record<string, { x: number; y: number }> = Object.fromEntries(
  ARCH_EDGES.map((e) => [e.id, pathEnd(e.d)]),
);

const ARCH_LEGEND: { cat: ArchCat; label: string; count: number; x: number }[] = [
  { cat: "backend", label: "Backend", count: 1, x: 38 },
  { cat: "database", label: "Database", count: 1, x: 129 },
  { cat: "cloud", label: "Cloud", count: 1, x: 224 },
  { cat: "external", label: "External", count: 2, x: 306 },
];

function ArchIconGlyph({ icon }: { icon: ArchIcon }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  switch (icon) {
    case "browser":
      return (
        <g {...common}>
          <rect x="3" y="0.7" width="6" height="6" rx="1" />
          <rect x="0.7" y="3" width="6" height="6.3" rx="1" />
        </g>
      );
    case "code":
      return <path {...common} d="M3.6 2 .9 5l2.7 3M6.4 2 9.1 5 6.4 8" />;
    case "cloud":
      return <path {...common} d="M3 8.6h5.2a2 2 0 0 0 .3-3.97A3.1 3.1 0 0 0 2.6 5 1.8 1.8 0 0 0 3 8.6Z" />;
    case "database":
      return (
        <g {...common}>
          <ellipse cx="5" cy="2" rx="3.4" ry="1.4" />
          <path d="M1.6 2v5.6c0 .8 1.5 1.4 3.4 1.4s3.4-.6 3.4-1.4V2M1.6 4.8c0 .8 1.5 1.4 3.4 1.4s3.4-.6 3.4-1.4" />
        </g>
      );
  }
}

const ARCH_CSS = `
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap");

.arch-root {
  --arch-font: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --arch-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --arch-bg: #ffffff;
  --arch-dot: #d9dee5;
  --arch-title: #111827;
  --arch-sub: #4b5563;
  --arch-legend: #374151;
  --arch-pill: #6b7280;
  --arch-badge-fill: rgba(255, 255, 255, 0.7);
  --arch-green: #059669;
  --arch-purple: #7c3aed;
  --arch-red: #e11d48;
  --arch-grey: #94a3b8;
  --arch-border: #e2e8f0;
  --arch-hl: #3b82f6;
  --arch-shadow: drop-shadow(0 1px 1px rgba(17, 24, 39, 0.05)) drop-shadow(0 6px 12px rgba(17, 24, 39, 0.06)) drop-shadow(0 0 0 rgba(59, 130, 246, 0));
  --arch-shadow-active: drop-shadow(0 1px 1px rgba(17, 24, 39, 0.05)) drop-shadow(0 6px 12px rgba(17, 24, 39, 0.06)) drop-shadow(0 0 8px rgba(59, 130, 246, 0.45));
  --arch-card-bg: #ffffff;
  --arch-card-border: #e2e8f0;
  --arch-card-text: #374151;
  --arch-card-shadow: 0 1px 2px rgba(17, 24, 39, 0.06), 0 10px 24px rgba(17, 24, 39, 0.12);
  --arch-backend-fill: #d7f4ea;  --arch-backend-stroke: #059669;
  --arch-database-fill: #e9e4fa; --arch-database-stroke: #7c3aed;
  --arch-cloud-fill: #fbf0d4;    --arch-cloud-stroke: #d97706;
  --arch-external-fill: #e9ebef; --arch-external-stroke: #64748b;
}
.arch-root[data-theme="dark"] {
  --arch-bg: #16181f;
  --arch-dot: rgba(148, 163, 184, 0.2);
  --arch-title: #f1f5f9;
  --arch-sub: #94a3b8;
  --arch-legend: #94a3b8;
  --arch-pill: #94a3b8;
  --arch-badge-fill: rgba(255, 255, 255, 0.05);
  --arch-green: #34d399;
  --arch-purple: #a78bfa;
  --arch-red: #fb7185;
  --arch-grey: #64748b;
  --arch-border: rgba(148, 163, 184, 0.16);
  --arch-hl: #60a5fa;
  --arch-shadow: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 0 rgba(96, 165, 250, 0));
  --arch-shadow-active: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
  --arch-card-bg: #0f1219;
  --arch-card-border: rgba(148, 163, 184, 0.24);
  --arch-card-text: #cbd5e1;
  --arch-card-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px rgba(0, 0, 0, 0.45);
  --arch-backend-fill: #0e2c29;  --arch-backend-stroke: #34d399;
  --arch-database-fill: #2a194d; --arch-database-stroke: #a78bfa;
  --arch-cloud-fill: #321f19;    --arch-cloud-stroke: #eab308;
  --arch-external-fill: #181f2b; --arch-external-stroke: #94a3b8;
}

.arch-canvas {
  background-color: var(--arch-bg);
  background-image: radial-gradient(circle, var(--arch-dot) 1px, transparent 1.2px);
  background-size: 20px 20px;
  border: 1px solid var(--arch-border);
  border-radius: 1rem;
  overflow: hidden;
}
.arch-stage { position: relative; }
.arch-scroll { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }
.arch-svg {
  display: block; width: 100%; min-width: 760px; height: auto;
  font-family: var(--arch-font);
}

.arch-cat-backend  { --n-fill: var(--arch-backend-fill);  --n-stroke: var(--arch-backend-stroke); }
.arch-cat-database { --n-fill: var(--arch-database-fill); --n-stroke: var(--arch-database-stroke); }
.arch-cat-cloud    { --n-fill: var(--arch-cloud-fill);    --n-stroke: var(--arch-cloud-stroke); }
.arch-cat-external { --n-fill: var(--arch-external-fill); --n-stroke: var(--arch-external-stroke); }

/* Focus pop — the node springs up from its own centre (overshoot easing) when hovered, focused, pinned or hit by the request flow. */
.arch-node { cursor: pointer; outline: none; transform-box: fill-box; transform-origin: center;
  transition: transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease; }
.arch-node.active, .arch-node:focus-visible { transform: translateY(-1.5px) scale(1.05); }
.arch-node.dim { opacity: 0.28; }
.arch-box { fill: var(--n-fill); stroke: var(--n-stroke); stroke-width: 1.5; filter: var(--arch-shadow);
  transition: stroke 220ms ease, stroke-width 220ms ease, filter 220ms ease; }
.arch-node.active .arch-box, .arch-node:focus-visible .arch-box { stroke: var(--arch-hl); stroke-width: 2; filter: var(--arch-shadow-active); }
.arch-edge-g, .arch-label { transition: opacity 200ms ease; }
.arch-edge-g.dim, .arch-label.dim { opacity: 0.15; }
.arch-label.rel { font-weight: 700; }
.arch-node-icon, .arch-badge-text { color: var(--n-stroke); fill: var(--n-stroke); }
.arch-badge { fill: var(--arch-badge-fill); stroke: var(--n-stroke); stroke-width: 1; }
.arch-title { fill: var(--arch-title); font-size: 10px; font-weight: 700; }
.arch-sub { fill: var(--arch-sub); font-size: 8px; }

.arch-edge { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.arch-edge.green  { stroke: var(--arch-green); }
.arch-edge.purple { stroke: var(--arch-purple); }
.arch-edge.red    { stroke: var(--arch-red); }
.arch-edge.grey   { stroke: var(--arch-grey); }
.arch-edge.dashed { stroke-dasharray: 5 4; }
.arch-label { font-size: 7.2px; paint-order: stroke; stroke: var(--arch-bg); stroke-width: 4px; stroke-linejoin: round; }
.arch-label.green { fill: var(--arch-green); }
.arch-label.purple { fill: var(--arch-purple); }
.arch-label.red { fill: var(--arch-red); }
.arch-label.grey { fill: var(--arch-grey); }
.arch-arrow.green { fill: var(--arch-green); }
.arch-arrow.purple { fill: var(--arch-purple); }
.arch-arrow.red { fill: var(--arch-red); }
.arch-arrow.grey { fill: var(--arch-grey); }

.arch-legend-title { fill: var(--arch-title); font-size: 10.5px; font-weight: 700; }
.arch-legend-label { fill: var(--arch-legend); font-size: 9px; }
.arch-legend-swatch { fill: var(--n-fill); stroke: var(--n-stroke); stroke-width: 1; }
.arch-legend-pill { fill: none; stroke: var(--arch-pill); stroke-opacity: 0.5; stroke-width: 0.8; }
.arch-legend-count { fill: var(--arch-pill); font-size: 7px; }

.arch-card { position: absolute; z-index: 5; width: min(320px, calc(100% - 16px)); box-sizing: border-box;
  padding: 12px 14px; border-radius: 10px; font-family: var(--arch-font);
  background: var(--arch-card-bg); border: 1px solid var(--arch-card-border); color: var(--arch-card-text);
  box-shadow: var(--arch-card-shadow);
  opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(4px) scale(0.97);
  transition: opacity 200ms ease, transform 200ms ease, visibility 0s linear 200ms; }
.arch-card[data-open="true"] { opacity: 1; visibility: visible; pointer-events: auto; transform: none; transition-delay: 0s; }
.arch-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.arch-card-pin { margin-left: 8px; padding: 1px 6px; border: 1px solid var(--arch-card-border); border-radius: 999px;
  font-size: 8.5px; font-weight: 500; letter-spacing: 0.04em; color: var(--arch-sub); vertical-align: 1px; }
.arch-card-title { margin: 0; font-size: 12px; font-weight: 700; color: var(--arch-title); }
.arch-card-close { flex: none; margin: -3px -5px 0 0; padding: 0 5px; border: 0; background: none; cursor: pointer;
  font: inherit; font-size: 16px; line-height: 1.2; color: var(--arch-sub); }
.arch-card-close:hover, .arch-card-close:focus-visible { color: var(--arch-title); }
.arch-card-sec { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--arch-card-border); }
.arch-card-sec-title { margin-bottom: 4px; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--arch-sub); }
.arch-card-sec ul { margin: 0; padding: 0; list-style: none; }
.arch-card-sec li { margin: 0 0 5px; font-size: 10.5px; line-height: 1.45; }
.arch-card-peer { color: var(--arch-title); font-weight: 600; }
.arch-card-lbl { display: block; padding-left: 1.3em; color: var(--arch-sub); }
.arch-card-body { margin: 0; font-size: 11px; line-height: 1.65; }

/* One-time intro reveal (only while data-reveal is set; never loops). */
.arch-root[data-reveal="pending"] .arch-node,
.arch-root[data-reveal="pending"] .arch-edge-g,
.arch-root[data-reveal="pending"] .arch-label { opacity: 0; }
.arch-root[data-reveal="done"] .arch-node { animation: arch-in 420ms var(--arch-ease) backwards; animation-delay: calc(var(--i, 0) * 80ms); }
.arch-root[data-reveal="done"] .arch-edge-g,
.arch-root[data-reveal="done"] .arch-label { animation: arch-fade 500ms ease backwards; animation-delay: calc(450ms + var(--i, 0) * 70ms); }
@keyframes arch-in { from { opacity: 0; transform: translateY(6px); } }
@keyframes arch-fade { from { opacity: 0; } }

/* Trace overlay — drawn once on the active node's own connections. 2.4s linear, once, 160ms stagger. */
.arch-trace { fill: none; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0.95; pointer-events: none;
  animation: arch-trace var(--dur, 2.4s) linear both; animation-delay: calc(var(--step, 0) * 160ms); }
/* Packet: a small dot riding the path in its arrow direction, matching the draw-on head. */
.arch-packet { fill: none; stroke-linecap: round; stroke-dasharray: 0.015 2; stroke-dashoffset: 0.015; pointer-events: none;
  animation: arch-packet calc(var(--dur, 2.4s) * 0.8) linear both; animation-delay: calc(var(--step, 0) * 160ms); }
.arch-packet.green { stroke: var(--arch-green); } .arch-packet.purple { stroke: var(--arch-purple); }
.arch-packet.red { stroke: var(--arch-red); }     .arch-packet.grey { stroke: var(--arch-grey); }
@keyframes arch-packet { 0% { stroke-dashoffset: 0.015; opacity: 1; } 99% { opacity: 1; } 100% { stroke-dashoffset: -1; opacity: 0; } }

.arch-legend-item { cursor: pointer; outline: none; }
.arch-legend-hit { fill: transparent; stroke: transparent; transition: stroke 160ms ease; }
.arch-legend-item:focus-visible .arch-legend-hit { stroke: var(--arch-hl); stroke-width: 1; }
.arch-legend-item:hover .arch-legend-label, .arch-legend-item.on .arch-legend-label { fill: var(--arch-title); }
.arch-legend-item.on .arch-legend-swatch { stroke-width: 1.8; }
.arch-trace.green { stroke: var(--arch-green); } .arch-trace.purple { stroke: var(--arch-purple); }
.arch-trace.red { stroke: var(--arch-red); }     .arch-trace.grey { stroke: var(--arch-grey); }
@keyframes arch-trace { 0% { stroke-dashoffset: 1; opacity: 0.95; } 80% { stroke-dashoffset: 0; opacity: 0.95; } 100% { stroke-dashoffset: 0; opacity: 0; } }

/* Arrival ping — fires at the path's arrowhead the moment the trace/packet gets there
   (delay = trace step offset + 80% of the trace duration), plus a ripple around the destination node. */
.arch-ping-g { pointer-events: none; }
.arch-ping-g.green  { --ping: var(--arch-green); }
.arch-ping-g.purple { --ping: var(--arch-purple); }
.arch-ping-g.red    { --ping: var(--arch-red); }
.arch-ping-g.grey   { --ping: var(--arch-grey); }
.arch-ping, .arch-ping-dot, .arch-ping-node {
  opacity: 0; transform-box: fill-box; transform-origin: center;
  animation-delay: calc(var(--step, 0) * 160ms + var(--dur, 2.4s) * 0.8);
  animation-fill-mode: forwards; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
.arch-ping { fill: none; stroke: var(--ping); stroke-width: 1.6; animation-name: arch-ping; animation-duration: 800ms; }
.arch-ping-2 { stroke-width: 1; animation-delay: calc(var(--step, 0) * 160ms + var(--dur, 2.4s) * 0.8 + 140ms); }
.arch-ping-dot { fill: var(--ping); animation-name: arch-ping-dot; animation-duration: 520ms; }
.arch-ping-node { fill: none; stroke: var(--ping); stroke-width: 1.5; animation-name: arch-ping-node; animation-duration: 700ms; }
@keyframes arch-ping { 0% { opacity: 0.85; transform: scale(0.4); } 100% { opacity: 0; transform: scale(3.4); } }
@keyframes arch-ping-dot { 0% { opacity: 1; transform: scale(1); } 40% { opacity: 1; transform: scale(1.9); } 100% { opacity: 0; transform: scale(0.6); } }
@keyframes arch-ping-node { 0% { opacity: 0.75; transform: scale(1); } 100% { opacity: 0; transform: scale(1.14); } }

@media (prefers-reduced-motion: reduce) {
  .arch-root *, .arch-root *::before, .arch-root *::after { animation: none !important; transition: none !important; }
  .arch-node:hover { transform: none; }
  .arch-node.active, .arch-node:focus-visible { transform: none; }
  .arch-trace, .arch-packet, .arch-ping-g { display: none; }
}
`;

function ArchDiagram({ theme }: { theme: "dark" | "light" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const colors: ArchColor[] = ["green", "purple", "red", "grey"];

  // Single source of truth for the interaction: `active` drives node
  // highlight, dimming and the floating card. `cardId` keeps the last
  // selection mounted so the card can fade out instead of vanishing.
  const [active, setActive] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string>("browser");
  const [cardPos, setCardPos] = useState({ left: 0, top: 0, ox: 0, oy: 0 });
  // `pinned` keeps a selection after the pointer leaves; `flow` is the step
  // of the request walkthrough (-1 = idle); `reveal` drives the one-time intro.
  const [pinned, setPinned] = useState<string | null>(null);
  const pinnedRef = useRef<string | null>(null);
  const [flow, setFlow] = useState(-1);
  const [legendCat, setLegendCat] = useState<ArchCat | null>(null);
  const [reveal, setReveal] = useState<"idle" | "pending" | "done">("idle");
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | null>(null);
  const lastPointer = useRef<string>("mouse");
  const hitAttr = uid;
  const cardDomId = `${uid}-card`;

  const cancelLeave = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);
  const pin = useCallback((id: string | null) => {
    pinnedRef.current = id;
    setPinned(id);
  }, []);
  const activate = useCallback(
    (id: string) => {
      cancelLeave();
      setFlow(-1); // interacting with a node takes over from the walkthrough
      setCardId(id);
      setActive(id);
    },
    [cancelLeave],
  );
  const dismiss = useCallback(() => {
    cancelLeave();
    pin(null);
    setActive(null);
    setLegendCat(null);
  }, [cancelLeave, pin]);
  // Legend filter: click a category to spotlight its nodes and their connections.
  const toggleLegend = useCallback(
    (cat: ArchCat) => {
      const next = legendCat === cat ? null : cat;
      dismiss();
      setFlow(-1);
      setLegendCat(next);
    },
    [dismiss, legendCat],
  );
  const togglePin = useCallback(
    (id: string, touch: boolean) => {
      if (pinnedRef.current === id) {
        pin(null);
        if (touch) setActive(null);
      } else {
        activate(id);
        pin(id);
      }
    },
    [activate, pin],
  );
  const startFlow = useCallback(() => {
    dismiss();
    setFlow(0);
  }, [dismiss]);
  // Short grace period so the pointer can cross the gap between a node and
  // its card (or hop between nodes) without the card flickering.
  const scheduleLeave = useCallback(() => {
    cancelLeave();
    leaveTimer.current = window.setTimeout(() => {
      const pin = pinnedRef.current;
      if (pin) setCardId(pin);
      setActive(pin);
    }, 140);
  }, [cancelLeave]);

  useEffect(() => cancelLeave, [cancelLeave]);

  // Walkthrough: advance one step at a time, then stop on its own.
  useEffect(() => {
    if (flow < 0) return;
    const id = window.setTimeout(() => setFlow((f) => (f + 1 >= ARCH_FLOW.length ? -1 : f + 1)), 1600);
    return () => window.clearTimeout(id);
  }, [flow]);

  useEffect(() => {
    if (!active && !pinned && !legendCat) return;
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest(`[data-arch-hit="${hitAttr}"]`)) dismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, pinned, legendCat, hitAttr, dismiss]);

  const related = useMemo(() => {
    const s = new Set<string>();
    if (!active) return s;
    for (const e of ARCH_EDGES) {
      if (e.from === active) s.add(e.to);
      if (e.to === active) s.add(e.from);
    }
    return s;
  }, [active]);
  // Place the card beside the active node. Candidate spots (below, above,
  // right, left) are scored so the card avoids the active node, the
  // connected nodes and — most importantly — the highlighted paths.
  const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsoLayout(() => {
    if (!active) return;
    const stage = stageRef.current;
    const svg = svgRef.current;
    const card = cardRef.current;
    const n = ARCH_NODES.find((x) => x.id === cardId);
    if (!stage || !svg || !card || !n) return;
    const sr = stage.getBoundingClientRect();
    const vr = svg.getBoundingClientRect();
    const s = vr.width / ARCH_W;
    const ox = vr.left - sr.left;
    const oy = vr.top - sr.top;
    const box = (m: ArchNode) => ({ l: ox + m.x * s, t: oy + m.y * s, r: ox + (m.x + m.w) * s, b: oy + (m.y + m.h) * s });
    const nb = box(n);
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const gap = 10;
    const clampX = (v: number) => Math.max(8, Math.min(v, Math.max(8, sr.width - cw - 8)));
    const clampY = (v: number) => Math.max(8, Math.min(v, Math.max(8, sr.height - ch - 8)));
    const cx = (nb.l + nb.r) / 2 - cw / 2;
    const cy = (nb.t + nb.b) / 2 - ch / 2;
    const candidates = [
      { left: clampX(cx), top: clampY(nb.b + gap) },
      { left: clampX(cx), top: clampY(nb.t - ch - gap) },
      { left: clampX(nb.r + gap), top: clampY(cy) },
      { left: clampX(nb.l - cw - gap), top: clampY(cy) },
    ];
    // Sample the highlighted paths in stage pixels.
    const pts: { x: number; y: number }[] = [];
    svg.querySelectorAll<SVGGeometryElement>("[data-edge]").forEach((el) => {
      const ed = ARCH_EDGES.find((e) => e.id === el.getAttribute("data-edge"));
      if (!ed || (ed.from !== cardId && ed.to !== cardId)) return;
      const len = el.getTotalLength();
      for (let d = 0; d <= len; d += 6) {
        const pt = el.getPointAtLength(d);
        pts.push({ x: ox + pt.x * s, y: oy + pt.y * s });
      }
    });
    const hit = (c: { left: number; top: number }, r: { l: number; t: number; r: number; b: number }, pad = 0) =>
      c.left < r.r + pad && c.left + cw > r.l - pad && c.top < r.b + pad && c.top + ch > r.t - pad;
    let best = candidates[0];
    let bestScore = Infinity;
    for (const c of candidates) {
      let score = 0;
      if (hit(c, nb, 2)) score += 1000;
      for (const m of ARCH_NODES) if (related.has(m.id) && hit(c, box(m), 2)) score += 60;
      for (const q of pts) if (q.x > c.left - 4 && q.x < c.left + cw + 4 && q.y > c.top - 4 && q.y < c.top + ch + 4) score += 1;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    const originX = Math.max(-60, Math.min((nb.l + nb.r) / 2 - best.left, cw + 60));
    const originY = Math.max(-60, Math.min((nb.t + nb.b) / 2 - best.top, ch + 60));
    setCardPos({ left: best.left, top: best.top, ox: originX, oy: originY });
  }, [active, cardId, related]);

  // One-time intro: hidden until the diagram scrolls into view, then a short
  // staggered reveal. Skipped entirely under reduced motion.
  useIsoLayout(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setReveal("pending");
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setReveal("done");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const flowEdge = flow >= 0 ? ARCH_EDGES.find((e) => e.id === ARCH_FLOW[flow]) : undefined;
  const nodeTitle = (id: string) => ARCH_NODES.find((m) => m.id === id)?.title ?? id;
  const legendIds = useMemo(
    () => new Set(legendCat ? ARCH_NODES.filter((m) => m.cat === legendCat).map((m) => m.id) : []),
    [legendCat],
  );
  // Priority: request-flow step > hovered/pinned node > legend category.
  const hiEdges: ArchEdge[] | null = flowEdge
    ? [flowEdge]
    : active
      ? ARCH_EDGES.filter((e) => e.from === active || e.to === active)
      : legendCat
        ? ARCH_EDGES.filter((e) => legendIds.has(e.from) || legendIds.has(e.to))
        : null;
  const edgeState = (e: ArchEdge) => (hiEdges ? (hiEdges.includes(e) ? "rel" : "dim") : "");
  const nodeState = (id: string) =>
    flowEdge
      ? id === flowEdge.from || id === flowEdge.to
        ? "active"
        : "dim"
      : active
        ? active === id
          ? "active"
          : related.has(id)
            ? ""
            : "dim"
        : legendCat
          ? legendIds.has(id)
            ? ""
            : "dim"
          : "";

  // Arrow keys hop to the nearest connected node in that direction.
  const moveFocus = (fromId: string, key: string) => {
    const f = ARCH_NODES.find((m) => m.id === fromId);
    if (!f) return;
    const fx = f.x + f.w / 2;
    const fy = f.y + f.h / 2;
    const linked = new Set<string>();
    for (const e of ARCH_EDGES) {
      if (e.from === fromId) linked.add(e.to);
      if (e.to === fromId) linked.add(e.from);
    }
    let best: ArchNode | null = null;
    let bestScore = Infinity;
    for (const m of ARCH_NODES) {
      if (m.id === fromId) continue;
      const dx = m.x + m.w / 2 - fx;
      const dy = m.y + m.h / 2 - fy;
      const ok =
        key === "ArrowRight" ? dx > 0 && Math.abs(dx) >= Math.abs(dy) * 0.6
        : key === "ArrowLeft" ? dx < 0 && Math.abs(dx) >= Math.abs(dy) * 0.6
        : key === "ArrowDown" ? dy > 0 && Math.abs(dy) >= Math.abs(dx) * 0.6
        : dy < 0 && Math.abs(dy) >= Math.abs(dx) * 0.6;
      if (!ok) continue;
      const score = Math.hypot(dx, dy) * (linked.has(m.id) ? 1 : 2.5);
      if (score < bestScore) {
        bestScore = score;
        best = m;
      }
    }
    if (best) svgRef.current?.querySelector<SVGGElement>(`[data-node="${best.id}"]`)?.focus();
  };

  const cardNode = ARCH_NODES.find((n) => n.id === cardId)!;

  return (
    <section className="relative">
      <style>{ARCH_CSS}</style>
      <SectionHeading title="Topology." />
      <p className="-mt-4 mb-5 max-w-xl text-sm text-muted-foreground">
        Explore how the portfolio&apos;s services communicate and how assets are delivered.
      </p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
        <span role="status" aria-live="polite">
          {flowEdge
            ? `${flow + 1}/${ARCH_FLOW.length} · ${nodeTitle(flowEdge.from)} → ${nodeTitle(flowEdge.to)} · ${flowEdge.label}`
            : legendCat && !active
              ? `Highlighting ${ARCH_LEGEND.find((l) => l.cat === legendCat)?.label} nodes · click the legend again to clear.`
              : "Hover over a node to trace its connections."}
        </span>
        <button
          type="button"
          aria-pressed={flow >= 0}
          onClick={() => (flow >= 0 ? setFlow(-1) : startFlow())}
          className={cn(
            // Compact, quiet pill (same family as the portfolio filter/CV buttons): neutral
            // outline, accent only on hover. Fixed width so Run/Stop never resize it.
            "inline-flex h-7 w-[104px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-border/60 font-sans text-xs font-medium text-muted-foreground outline-none transition-colors",
            "hover:border-[color:var(--accent-blue)]/50 hover:text-[color:var(--accent-blue)]",
            "focus-visible:ring-2 focus-visible:ring-[color:var(--accent-blue)]/50",
            flow >= 0 && "border-[color:var(--accent-blue)]/50 text-accent-blue",
          )}
        >
          {flow >= 0 ? (
            <>
              <Square className="h-3 w-3 fill-current" aria-hidden />
              Stop trace
            </>
          ) : (
            <>
              <Play className="h-3 w-3 fill-current" aria-hidden />
              Run trace
            </>
          )}
        </button>
      </div>

      <div className="arch-root" data-sr-skip data-theme={theme} data-reveal={reveal}>
        <div className="arch-stage" ref={stageRef}>
        <div className="arch-canvas">
          <div className="arch-scroll">
            <svg
              ref={svgRef}
              className="arch-svg"
              viewBox={`0 0 ${ARCH_W} ${ARCH_H}`}
              role="img"
              aria-label="Portfolio system architecture: a User Browser requests pages from a Cloudflare Worker, which reads assets from an R2 bucket and sends logs to Observability; the browser also posts the contact form to EmailJS."
            >
              <defs>
                {colors.map((c) => (
                  <marker key={c} id={`${uid}-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
                    <path className={`arch-arrow ${c}`} d="M0 1 L10 5 L0 9 Z" />
                  </marker>
                ))}
              </defs>

              <>
                {ARCH_EDGES.map((e) => (
                  <g key={e.id} className={cn("arch-edge-g", edgeState(e))} style={{ ["--i" as string]: ARCH_EDGES.indexOf(e) } as React.CSSProperties}>
                    <path
                      data-edge={e.id}
                      className={cn("arch-edge", e.color, e.dashed && "dashed")}
                      d={e.d}
                      strokeWidth={e.width}
                      markerEnd={`url(#${uid}-${e.color})`}
                    />
                  </g>
                ))}

                {(hiEdges ?? []).map((e, i) => (
                  <g
                    key={`${e.id}-${flowEdge ? `f${flow}` : (active ?? legendCat)}`}
                    style={{ ["--step" as string]: flowEdge ? 0 : i, ["--dur" as string]: flowEdge ? "1.4s" : "2.4s" } as React.CSSProperties}
                  >
                    <path className={cn("arch-trace", e.color)} d={e.d} pathLength={1} strokeWidth={e.width + 0.6} />
                    <path className={cn("arch-packet", e.color)} d={e.d} pathLength={1} strokeWidth={e.width + 2} />
                  </g>
                ))}

                {ARCH_EDGES.map((e) => (
                  <text key={`${e.id}-l`} className={cn("arch-label", e.color, edgeState(e))} style={{ ["--i" as string]: ARCH_EDGES.indexOf(e) } as React.CSSProperties} x={e.lx} y={e.ly} textAnchor="middle">
                    {e.label}
                  </text>
                ))}

                {ARCH_NODES.map((n) => (
                  <g
                    key={n.id}
                    className={cn(
                      "arch-node",
                      `arch-cat-${n.cat}`,
                      nodeState(n.id),
                      pinned === n.id && "pinned",
                    )}
                    style={{ ["--i" as string]: ARCH_NODES.indexOf(n) } as React.CSSProperties}
                    data-node={n.id}
                    data-arch-hit={hitAttr}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.title}: show details`}
                    aria-describedby={active === n.id ? cardDomId : undefined}
                    onPointerDown={(e) => {
                      lastPointer.current = e.pointerType;
                    }}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "touch") activate(n.id);
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType !== "touch") scheduleLeave();
                    }}
                    onFocus={(e) => {
                      // Keyboard focus only; a tap/click focuses too, but that is handled by onClick.
                      let kb = true;
                      try {
                        kb = e.currentTarget.matches(":focus-visible");
                      } catch {
                        kb = true;
                      }
                      if (kb) activate(n.id);
                    }}
                    onBlur={() => {
                      if (lastPointer.current !== "touch") scheduleLeave();
                    }}
                    onClick={() => togglePin(n.id, lastPointer.current === "touch")}
                    onKeyDown={(e) => {
                      lastPointer.current = "keyboard";
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        togglePin(n.id, false);
                      } else if (e.key === "Escape") dismiss();
                      else if (e.key.startsWith("Arrow")) {
                        e.preventDefault();
                        moveFocus(n.id, e.key);
                      }
                    }}
                  >
                    <rect className="arch-box" x={n.x} y={n.y} width={n.w} height={n.h} rx={7} />
                    <g className="arch-node-icon" transform={`translate(${n.x + 9} ${n.y + 8})`}>
                      <ArchIconGlyph icon={n.icon} />
                    </g>
                    <rect className="arch-badge" x={n.x + n.w - 34} y={n.y + 4} width={28} height={12} rx={6} />
                    <text className="arch-badge-text" x={n.x + n.w - 20} y={n.y + 12.4} textAnchor="middle" fontSize="6.5" fontWeight="700">
                      SRC {n.src}
                    </text>
                    <text className="arch-title" x={n.x + n.w / 2} y={n.y + n.titleDy} textAnchor="middle">
                      {n.title}
                    </text>
                    <text className="arch-sub" x={n.x + n.w / 2} y={n.y + n.subDy} textAnchor="middle">
                      {n.sub}
                    </text>
                  </g>
                ))}

                {/* Arrival pings — drawn above the nodes so the rings stay visible at the arrowhead. */}
                {(hiEdges ?? []).map((e, i) => {
                  const end = ARCH_END[e.id];
                  const to = ARCH_NODES.find((m) => m.id === e.to);
                  if (!end || !to) return null;
                  return (
                    <g
                      key={`ping-${e.id}-${flowEdge ? `f${flow}` : (active ?? legendCat)}`}
                      className={cn("arch-ping-g", e.color)}
                      style={{ ["--step" as string]: flowEdge ? 0 : i, ["--dur" as string]: flowEdge ? "1.4s" : "2.4s" } as React.CSSProperties}
                      aria-hidden
                    >
                      <rect className="arch-ping-node" x={to.x} y={to.y} width={to.w} height={to.h} rx={7} />
                      <circle className="arch-ping" cx={end.x} cy={end.y} r={4} />
                      <circle className="arch-ping arch-ping-2" cx={end.x} cy={end.y} r={4} />
                      <circle className="arch-ping-dot" cx={end.x} cy={end.y} r={2.4} />
                    </g>
                  );
                })}

                <text className="arch-legend-title" x={38} y={549}>
                  Legend
                </text>
                {ARCH_LEGEND.map((l) => {
                  const labelW = l.label.length * 5.4;
                  const px = l.x + 19 + labelW + 6;
                  const on = legendCat === l.cat;
                  return (
                    <g
                      key={l.cat}
                      className={cn("arch-legend-item", `arch-cat-${l.cat}`, on && "on")}
                      data-arch-hit={hitAttr}
                      role="button"
                      tabIndex={0}
                      aria-pressed={on}
                      aria-label={`Highlight ${l.label} nodes`}
                      onClick={() => toggleLegend(l.cat)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleLegend(l.cat);
                        } else if (e.key === "Escape") dismiss();
                      }}
                    >
                      <rect className="arch-legend-hit" x={l.x - 5} y={553} width={px + 21 - l.x} height={22} rx={6} />
                      <rect className="arch-legend-swatch" x={l.x} y={559} width={15} height={9} rx={3} />
                      <text className="arch-legend-label" x={l.x + 19} y={567}>
                        {l.label}
                      </text>
                      <rect className="arch-legend-pill" x={px} y={558} width={11} height={11} rx={5.5} />
                      <text className="arch-legend-count" x={px + 5.5} y={566} textAnchor="middle">
                        {l.count}
                      </text>
                    </g>
                  );
                })}
              </>
            </svg>
          </div>
        </div>
          <div
            ref={cardRef}
            id={cardDomId}
            role="tooltip"
            className="arch-card"
            data-open={active ? "true" : "false"}
            data-arch-hit={hitAttr}
            style={{ left: cardPos.left, top: cardPos.top, transformOrigin: `${cardPos.ox}px ${cardPos.oy}px` }}
            onPointerDown={(e) => {
              lastPointer.current = e.pointerType;
            }}
            onPointerEnter={cancelLeave}
            onPointerLeave={(e) => {
              if (e.pointerType !== "touch") scheduleLeave();
            }}
            onFocus={cancelLeave}
            onBlur={() => {
              if (lastPointer.current !== "touch") scheduleLeave();
            }}
          >
            <div className="arch-card-head">
              <h3 className="arch-card-title">
                {cardNode.title}
                {pinned === cardId && <span className="arch-card-pin">pinned</span>}
              </h3>
              <button type="button" className="arch-card-close" aria-label="Close details" onClick={dismiss}>
                ×
              </button>
            </div>
            <p className="arch-card-body">{ARCH_DESC[cardNode.id]}</p>
            {(
              [
                ["Incoming", ARCH_EDGES.filter((e) => e.to === cardId), "←"],
                ["Outgoing", ARCH_EDGES.filter((e) => e.from === cardId), "→"],
              ] as const
            ).map(([heading, list, glyph]) =>
              list.length === 0 ? null : (
                <div key={heading} className="arch-card-sec">
                  <div className="arch-card-sec-title">{heading}</div>
                  <ul>
                    {list.map((e) => {
                      const peerId = heading === "Incoming" ? e.from : e.to;
                      const peer = ARCH_NODES.find((m) => m.id === peerId)!;
                      return (
                        <li key={e.id}>
                          <span style={{ color: `var(--arch-${e.color})` }} aria-hidden>
                            {glyph}
                          </span>{" "}
                          <span className="arch-card-peer">{peer.title}</span>
                          <span className="arch-card-lbl">{e.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfraBuild({ theme }: { theme: "dark" | "light" }) {
  return <ArchDiagram theme={theme} />;
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

// ─────────────────────────────────────────────────────────
// Contact form spam/rate-limit guards
//
// The old cooldown lived only in React state, so refreshing the
// page (trivial for a bot or a script) reset it instantly and gave
// zero real protection against burning the EmailJS monthly quota.
// This version persists across reloads via localStorage and adds
// two cheap, no-backend bot filters:
//   - a honeypot field invisible to humans (a real bot filling
//     forms via markup will fill it; a person never sees it)
//   - a minimum time-on-page before submit is accepted (bots that
//     submit within ~2s of the form mounting are almost certainly
//     scripted rather than a person actually typing)
// None of this is bulletproof — a targeted attacker can defeat any
// client-side check — but it stops the common case (naive scrapers/
// form bots) without needing a server. For real protection, add
// Cloudflare Turnstile (you're already on Workers, so it's a
// natural fit) in front of the submit handler.
// ─────────────────────────────────────────────────────────
const CONTACT_STORAGE_KEY = "contact_form_guard";
const CONTACT_MAX_SENDS = 2;
const CONTACT_WINDOW_MS = 10 * 60 * 1000; // 2 sends per 10 minutes
const CONTACT_MIN_FILL_MS = 2500; // ignore submits faster than this

// ─────────────────────────────────────────────────────────
// Cloudflare Turnstile
//
// Set VITE_TURNSTILE_SITE_KEY to enable. With a key, the form posts to
// /api/contact (see contact-api.ts), where the Worker verifies the
// token with the secret key and only then sends the email — so the
// EmailJS credentials never reach the browser and a bot can't skip
// the check. Without a key (local dev) it falls back to sending
// straight from the browser via EmailJS, unprotected.
// ─────────────────────────────────────────────────────────
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

const getTurnstile = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

let turnstileScript: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (turnstileScript) return turnstileScript;
  turnstileScript = new Promise<void>((resolve, reject) => {
    if (getTurnstile()) return resolve();
    const el = document.createElement("script");
    el.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => {
      turnstileScript = null; // allow a retry on the next mount
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(el);
  });
  return turnstileScript;
}

type ContactGuardState = {
  sends: number[]; // timestamps of recent successful sends
};

function readContactGuard(): ContactGuardState {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return { sends: [] };
    const parsed = JSON.parse(raw) as ContactGuardState;
    const cutoff = Date.now() - CONTACT_WINDOW_MS;
    return { sends: (parsed.sends || []).filter((t) => t > cutoff) };
  } catch {
    return { sends: [] };
  }
}

function writeContactGuard(state: ContactGuardState) {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write failures (privacy mode, etc.)
  }
}

function Contact() {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const mountedAtRef = useRef(Date.now());
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileBoxRef = useRef<HTMLDivElement | null>(null);
  const turnstileIdRef = useRef<string | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Render the Turnstile widget (only when a site key is configured).
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        const api = getTurnstile();
        if (cancelled || !api || !turnstileBoxRef.current) return;
        turnstileIdRef.current = api.render(turnstileBoxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "auto",
          callback: (token) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => setTurnstileToken(null),
        });
      })
      .catch(() => toast.error("Couldn't load the spam check. Please refresh and try again."));
    return () => {
      cancelled = true;
      if (turnstileIdRef.current) getTurnstile()?.remove(turnstileIdRef.current);
      turnstileIdRef.current = null;
    };
  }, []);

  // Tokens are single-use, so every attempt needs a fresh one.
  function resetTurnstile() {
    setTurnstileToken(null);
    if (turnstileIdRef.current) getTurnstile()?.reset(turnstileIdRef.current);
  }

  // Re-derive cooldown from localStorage on mount, so a refresh
  // mid-cooldown doesn't hand the limit back to a spammer/bot.
  useEffect(() => {
    const { sends } = readContactGuard();
    if (sends.length >= CONTACT_MAX_SENDS) {
      const oldestInWindow = Math.min(...sends);
      const until = oldestInWindow + CONTACT_WINDOW_MS;
      const remaining = until - Date.now();
      if (remaining > 0) startCooldown(remaining);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCooldown(durationMs: number) {
    setCooldown(true);
    setCooldownRemaining(Math.ceil(durationMs / 1000));
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          setCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot: a real visitor never sees or fills this field. If it
    // has a value, silently drop the submission — no error shown, so
    // a bot gets no signal that it was caught.
    const honeypot = (form.elements.namedItem("company") as HTMLInputElement | null)?.value;
    if (honeypot) return;

    // Too-fast submit is almost certainly a script, not a person.
    if (Date.now() - mountedAtRef.current < CONTACT_MIN_FILL_MS) return;

    const { sends } = readContactGuard();
    if (sends.length >= CONTACT_MAX_SENDS) {
      const remaining = Math.min(...sends) + CONTACT_WINDOW_MS - Date.now();
      if (remaining > 0) {
        startCooldown(remaining);
        toast.warning("You've hit the send limit for now — please try again shortly.");
        return;
      }
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.warning("Please complete the verification first.");
      return;
    }

    setSending(true);
    const field = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";

    const request: Promise<unknown> = TURNSTILE_SITE_KEY
      ? fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: field("name"),
            email: field("email"),
            message: field("message"),
            token: turnstileToken,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error(`Contact API ${res.status}`);
        })
      : emailjs.sendForm("service_fdq7bwf", "template_jpawssn", form, "X7cczgqlSFWmadFLE");

    request
      .then(() => {
        setSending(false);
        const next = { sends: [...sends, Date.now()] };
        writeContactGuard(next);
        if (next.sends.length >= CONTACT_MAX_SENDS) {
          startCooldown(CONTACT_WINDOW_MS);
          toast.warning("Message sent! Please wait a few minutes before sending another.");
        } else {
          toast.success("Message sent! I'll get back to you shortly.");
        }
      })
      .catch(() => {
        setSending(false);
        toast.error("Something went wrong. Please try again.");
      })
      .finally(resetTurnstile);
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
          {/* Honeypot — hidden from sighted users and screen readers,
              but present in the DOM/tab order for naive bots that fill
              every field they find. A real person will never touch it. */}
          <div aria-hidden className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
            <label>
              Company
              <input type="text" name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <Field label="Name">
            <Input
              required
              name="name"
              placeholder="Your name"
              className={cn(
                "surface-3 h-9 w-full border-border/80 placeholder:text-muted-foreground/40",
                AUTOFILL_FIX,
              )}
            />
          </Field>
          <Field label="Email">
            <Input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
              className={cn(
                "surface-3 h-9 w-full border-border/80 placeholder:text-muted-foreground/40",
                AUTOFILL_FIX,
              )}
            />
          </Field>
          <Field label="Message">
            <Textarea
              required
              name="message"
              placeholder="What's on your mind?"
              rows={2}
              className={cn(
                "surface-3 w-full resize-none overflow-hidden border-border/80 placeholder:text-muted-foreground/40",
                AUTOFILL_FIX,
              )}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />
          </Field>
          {TURNSTILE_SITE_KEY && <div ref={turnstileBoxRef} className="min-h-[65px]" />}
          <div className="pt-1">
            <Button
              type="submit"
              disabled={sending || cooldown || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sending
                ? "Sending…"
                : cooldown
                  ? `Please wait ${Math.floor(cooldownRemaining / 60)}:${String(cooldownRemaining % 60).padStart(2, "0")}`
                  : "Send Message"}
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

type JourneyMilestone = {
  label: string;
  title: string;
  events: string[];
};

const JOURNEY: JourneyMilestone[] = [
  {
    label: "2014",
    title: "Where It Started",
    events: [
      "Made a first animation in 2014, which started an interest in building things.",
      "Learned HTML and CSS around 2017–18 and built a first webpage.",
    ],
  },
  {
    label: "2018",
    title: "Understanding How the Web Works",
    events: [
      "Learned how frontend and backend fit together, and how data is stored in databases and reached over the internet.",
      "By 2020–21, the question of where that data actually lives pointed toward cloud.",
    ],
  },
  {
    label: "2022",
    title: "Starting My B.Tech",
    events: [
      "Started the first year of a B.Tech in Cloud Technology & Information Security at Ajeenkya DY Patil University in August 2022.",
    ],
  },
  {
    label: "2023",
    title: "Building Technical Foundations",
    events: [
      "Built Linux, networking, and cloud fundamentals through hands-on labs: Debian, Ubuntu, and Kali administration, Wireshark traffic analysis, and core AWS services (EC2, S3, IAM, VPC).",
    ],
  },
  {
    label: "2024",
    title: "Infrastructure & Security in Practice",
    events: [
      "Built a DevSecOps pipeline: a Dockerized Flask app with GitHub Actions running Trivy and SonarQube scans before deployment.",
      "Built a Kubernetes-based server monitoring platform with Prometheus and Grafana, with automated recovery when failures are detected.",
    ],
  },
  {
    label: "2025",
    title: "Moving Into DevOps",
    events: [
      "Built an end-to-end CI/CD platform with GitHub Actions, Jenkins, and Docker covering build, test, containerization, and deployment.",
      "Practiced Infrastructure as Code with Terraform alongside Kubernetes and Git workflows.",
    ],
  },
  {
    label: "2026",
    title: "From Education to Real-World Engineering",
    events: [
      "Earned AWS Certified Cloud Practitioner (CLF-C02) in April 2026.",
      "Completed the B.Tech in Cloud Technology & Information Security (CGPA 8.66).",
      "Joined E-Sutra Technologies as a Cloud & DevOps Engineer: managing Jenkins and GitHub CI/CD pipelines, production deployments on Oracle Cloud, and server security hardening and incident response.",
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// SECTION - Journey
// ═══════════════════════════════════════════════════════════

function Journey() {
  const firstYear = JOURNEY[0].label.slice(0, 4);
  const lastYear = JOURNEY[JOURNEY.length - 1].label.slice(-4);

  return (
    <div>
      <SectionHeading title="Journey." />

      <div className="mb-16 text-sm text-muted-foreground">
        <span className="font-semibold text-accent-blue">{JOURNEY.length}</span> milestones ·{" "}
        {firstYear}–{lastYear}
      </div>

      <div className="space-y-10">
        {JOURNEY.map((milestone) => (
          <div key={milestone.label}>
            {/* Year header with ghost numeral */}
            <div className="relative mb-5 flex items-center justify-between">
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 left-0 select-none whitespace-nowrap text-6xl font-black leading-none text-foreground md:text-7xl"
                  style={{ opacity: "var(--ghost-year-opacity)" }}
                >
                  {milestone.label.slice(0, 4)}
                </span>
                <div className="relative">
                  <h3 className="text-xl font-bold text-foreground md:text-2xl">{milestone.label}</h3>
                  <span className="mt-1 block h-[2px] w-56 rounded-full bg-gradient-to-r from-accent-blue to-transparent" />
                </div>
              </div>
            </div>

            {/* Rail: milestone marker, connecting line, and event markers all
                share the same timeline x-coordinate (left: 6px), so the
                blue milestone dot, the gray event dots, and the vertical
                line are perfectly centered on the same axis. */}
            <ol className="relative">
              <li className="group relative pb-5 pl-7">
                <span
                  aria-hidden
                  className="absolute top-3 bottom-0 w-px -translate-x-1/2 bg-border/60"
                  style={{ left: "6px" }}
                />
                <span
                  aria-hidden
                  className="absolute top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-blue shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-blue)_18%,transparent)] transition-transform group-hover:scale-125"
                  style={{ left: "6px" }}
                />
                <h4 className="text-base font-semibold leading-snug text-foreground md:text-lg">
                  {milestone.title}
                </h4>
              </li>

              {milestone.events.map((event, i) => (
                <li key={i} className="relative pb-3 pl-7 last:pb-0">
                  {i !== milestone.events.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-2 bottom-0 w-px -translate-x-1/2 bg-border/40"
                      style={{ left: "6px" }}
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute top-[7px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-muted-foreground/50"
                    style={{ left: "6px" }}
                  />
                  <span className="text-sm leading-relaxed text-body">{event}</span>
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
// HOOK - useScrollReveal
// Fades + lifts each top-level block of the active section into view
// as it scrolls on screen (one-shot, lightly staggered for blocks that
// arrive together, e.g. a row of cards).
//
// - Targets are the section root's direct children; "list" containers
//   (grid / space-y / md:flex-row) are expanded one level so their
//   items animate individually instead of as one big slab.
// - Elements marked `data-sr-skip` are left alone (the Build diagram
//   has its own intro). Fixed/absolute elements (modals) are skipped.
// - After an element finishes animating, the helper classes are
//   removed so cards go back to their own hover/transition styles and
//   no stray transform is left behind.
// - On the very first (server-rendered) load, blocks already on screen
//   are left visible so there is no hide-then-show flash; everything
//   below the fold still reveals on scroll. Section changes animate
//   from the top.
// - Nothing runs under prefers-reduced-motion, and nothing is hidden
//   on the server, so crawlers and no-JS visitors get full content.
// ═══════════════════════════════════════════════════════════

const SCROLL_REVEAL_CSS = `
.sr-hidden { opacity: 0; transform: translate3d(0, 10px, 0); }
.sr-hidden.sr-in {
  opacity: 1;
  transform: none;
  transition:
    opacity 750ms cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 750ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
@media (prefers-reduced-motion: reduce) {
  .sr-hidden { opacity: 1; transform: none; }
}
`;

const SR_CONTAINER_RE = /(^|\s)((?:[a-z]+:)?grid-cols-\d|space-y-\d+|md:flex-row)(\s|$)/;
const SR_DURATION_MS = 750;
const SR_BASE_DELAY_MS = 60;
const SR_STAGGER_MS = 90;
// How long the old page takes to fade out before the next one loads.
const PAGE_LEAVE_MS = 260;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useScrollReveal(sectionKey: SectionKey) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  useIsoLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const root = wrapper?.firstElementChild;
    if (!wrapper || !root) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const leaveVisibleInView = isFirstRun.current;
    isFirstRun.current = false;
    let firstPass = true;

    const seen = new WeakSet<Element>();
    const timers = new Set<number>();

    const reveal = (el: HTMLElement, delay: number) => {
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("sr-in");
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        el.classList.remove("sr-hidden", "sr-in");
        el.style.transitionDelay = "";
      }, SR_DURATION_MS + delay + 80);
      timers.add(timer);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left,
          );
        visible.forEach((en, i) => {
          io.unobserve(en.target);
          reveal(en.target as HTMLElement, SR_BASE_DELAY_MS + Math.min(i, 4) * SR_STAGGER_MS);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const tagTargets = () => {
      const targets: HTMLElement[] = [];
      const walk = (parent: Element, depth: number) => {
        for (const child of Array.from(parent.children)) {
          if (!(child instanceof HTMLElement)) continue;
          if (child.tagName === "STYLE" || child.tagName === "SCRIPT" || child.tagName === "LINK") {
            continue;
          }
          if (child.hasAttribute("data-sr-skip")) continue;
          const position = window.getComputedStyle(child).position;
          if (position === "fixed" || position === "absolute") continue;
          if (depth < 2 && SR_CONTAINER_RE.test(child.getAttribute("class") ?? "")) {
            walk(child, depth + 1);
            continue;
          }
          targets.push(child);
        }
      };
      walk(root, 0);

      for (const el of targets) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (firstPass && leaveVisibleInView) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) continue;
        }
        el.classList.add("sr-hidden");
        io.observe(el);
      }
      firstPass = false;
    };

    tagTargets();

    // Pick up blocks that mount later (e.g. cards after a filter change).
    let raf = 0;
    const mo = new MutationObserver((records) => {
      if (!records.some((r) => r.addedNodes.length > 0)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tagTargets);
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [sectionKey]);

  return wrapperRef;
}

// ═══════════════════════════════════════════════════════════
// ROUTER - Section switcher
// ═══════════════════════════════════════════════════════════

function SectionRenderer({
  active,
  theme,
  leaving = false,
}: {
  active: SectionKey;
  theme: "dark" | "light";
  leaving?: boolean;
}) {
  const wrapperRef = useScrollReveal(active);
  const map: Record<SectionKey, React.ReactNode> = {
    about: <About />,
    resume: <Resume />,
    portfolio: <PortfolioSection />,
    infra: <InfraBuild theme={theme} />,
    contact: <Contact />,
    journey: <Journey />,
  };
  return (
    <>
      <style>{SCROLL_REVEAL_CSS}</style>
      <div
        key={active}
        ref={wrapperRef}
        className={cn(
          "transition-opacity ease-out motion-reduce:transition-none",
          leaving ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        style={{ transitionDuration: `${PAGE_LEAVE_MS}ms` }}
      >
        {map[active]}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT - Portfolio page
// ═══════════════════════════════════════════════════════════

export default function Portfolio({ section }: { section: SectionKey }) {
  // The URL is the source of truth: routes/$section.tsx passes the
  // current section in, and navigation goes through the router.
  const active = section;
  const navigate = useNavigate();
  const { theme, toggle, mounted } = useTheme();

  // ─────────────────────────────────────────────────────────
  // Centralized navigation handler.
  // Every nav trigger in the app (desktop sidebar, mobile bar,
  // Journey button, and any future nav entry point) must call
  // this single function instead of `setActive` directly. It
  // guarantees the destination section always opens scrolled
  // to the top — including when navigating between sections
  // that are already mounted / previously visited — without
  // requiring scroll logic on individual buttons.
  //
  // The scroll-to-top itself is animated (capped 350–650ms,
  // eased) instead of an instant jump, but:
  //   - it's skipped (instant snap) when the user is already
  //     at/near the top, so there's nothing to visibly interact with
  //   - it's skipped (instant snap) for prefers-reduced-motion
  //   - a new nav click always cancels any in-flight scroll
  //     animation first, so rapid clicking never stacks or glitches
  //   - it always lands exactly on 0, with a follow-up frame to
  //     correct for any late layout/content-height shift
  // ─────────────────────────────────────────────────────────
  const scrollAnimRef = useRef<number | null>(null);

  const cancelScrollAnim = useCallback(() => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }
  }, []);

  const smoothResetScroll = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    cancelScrollAnim();

    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    // Already at (or basically at) the top, or the user prefers
    // reduced motion — just snap, nothing worth animating.
    if (prefersReducedMotion || startY <= 2) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return 0;
    }

    const duration = Math.min(650, Math.max(350, startY * 0.45));
    const startTime = performance.now();
    // Ease in AND out so the glide starts and stops softly.
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);
      const nextY = startY * (1 - eased);
      window.scrollTo(0, nextY);

      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        scrollAnimRef.current = null;
        // One more correction a frame later, in case the newly
        // mounted section's content height settles late (images,
        // fonts) and nudges the scroll position off 0.
        requestAnimationFrame(() => {
          if (window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
      }
    };

    scrollAnimRef.current = requestAnimationFrame(step);
    return duration;
  }, [cancelScrollAnim]);

  useEffect(() => cancelScrollAnim, [cancelScrollAnim]);

  // Page changes are a calm hand-off rather than a cut: the page first
  // glides up to the top (eased in and out), the fade-out is timed to
  // finish exactly as that glide ends, and only then does the router swap
  // in the next page, whose blocks fade in via useScrollReveal. If the
  // page is already at the top there is no glide, just the short fade.
  // `leavingFrom` records which page is fading out; it is cleared as soon
  // as the section prop changes. Reduced-motion users switch immediately.
  const [leavingFrom, setLeavingFrom] = useState<SectionKey | null>(null);
  const leaveTimersRef = useRef<number[]>([]);

  const clearLeaveTimers = useCallback(() => {
    leaveTimersRef.current.forEach((id) => window.clearTimeout(id));
    leaveTimersRef.current = [];
  }, []);

  useEffect(() => {
    setLeavingFrom(null);
  }, [section]);

  useEffect(() => clearLeaveTimers, [clearLeaveTimers]);

  const navigateTo = useCallback(
    (target: SectionKey) => {
      if (target === active) {
        // Already here: cancel any pending switch and return to the top.
        clearLeaveTimers();
        setLeavingFrom(null);
        smoothResetScroll();
        return;
      }

      const go = () => {
        leaveTimersRef.current = [];
        // Safety only: the glide has normally landed on 0 already.
        if ((window.scrollY || 0) > 2) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        // resetScroll:false keeps the router from doing its own scroll
        // reset on top of ours.
        // About is the landing page, so it lives at "/" rather than "/about".
      navigate({
        to: "/{-$section}",
        params: { section: target === "about" ? undefined : SECTION_SLUG[target] },
        resetScroll: false,
      });
      };

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      if (reduceMotion) {
        clearLeaveTimers();
        go();
        return;
      }

      // A second click while switching just retargets the pending switch.
      clearLeaveTimers();
      const glideMs = smoothResetScroll();
      const fadeDelay = Math.max(0, glideMs - PAGE_LEAVE_MS);
      leaveTimersRef.current = [
        window.setTimeout(() => setLeavingFrom(active), fadeDelay),
        window.setTimeout(go, fadeDelay + PAGE_LEAVE_MS),
      ];
    },
    [active, navigate, smoothResetScroll, clearLeaveTimers],
  );

  // Scroll to the top whenever the section changes — covers nav clicks
  // and the browser back/forward buttons. Skipped on first render so a
  // deep link or refresh doesn't animate.
  const firstSectionRender = useRef(true);
  useEffect(() => {
    if (firstSectionRender.current) {
      firstSectionRender.current = false;
      return;
    }
    smoothResetScroll();
  }, [section, smoothResetScroll]);

  return (
    <div className="ambient-bg relative min-h-screen text-foreground">
      <BackgroundFX />
      <Toaster />

      {/* ── Main layout ── */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <ProfileHero
          onJourney={() => navigateTo("journey")}
          theme={theme}
          toggleTheme={toggle}
          mounted={mounted}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
          <main className="surface-1 min-h-[420px] rounded-2xl border border-border/60 p-6 md:p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.7)] mb-24 md:mb-0">
            <SectionRenderer active={active} theme={theme} leaving={leavingFrom === active} />
          </main>

          <div className="hidden md:block">
            <NavPanel
              active={active}
              setActive={navigateTo}
              theme={theme}
              toggleTheme={toggle}
              mounted={mounted}
            />
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