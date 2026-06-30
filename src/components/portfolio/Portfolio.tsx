import { useEffect, useMemo, useState } from "react";
import {
  Instagram,
  Linkedin,
  TwitterIcon,
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
  Rss,
  Send,
  ExternalLink,
  ShieldCheck,
  Award,
  Rocket,
  Cloud,
  Container,
  Terminal,
  Lock,
  Code2,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  CircleCheck,
  Clock3,
  FolderKanban,
  BadgeCheck,
  Bot,
  Workflow,
  Activity,
  Link,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast }    from "sonner";
import { Toaster }  from "@/components/ui/sonner";
import emailjs      from "@emailjs/browser";
import profileImg   from "@/assets/profile.jpeg";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type SectionKey      = "about" | "resume" | "portfolio" | "blog" | "contact" | "journey";
type PortfolioFilter = "All" | "Projects" | "Certifications" | "Publications" | "Badges";

// ═══════════════════════════════════════════════════════════
// CONSTANTS - Navigation
// ═══════════════════════════════════════════════════════════

const NAV: {
  key:   SectionKey;
  label: string;
  icon:  React.ComponentType<{ className?: string }>;
}[] = [
  { key: "about",     label: "About",     icon: User      },
  { key: "resume",    label: "Resume",    icon: FileText   },
  { key: "portfolio", label: "Portfolio", icon: Briefcase  },
  { key: "blog",      label: "Blog",      icon: BookOpen   },
  { key: "contact",   label: "Contact",   icon: Send       },
];

// ═══════════════════════════════════════════════════════════
// CONSTANTS - Journey timeline
// ═══════════════════════════════════════════════════════════

const JOURNEY = [
  { year: "Aug 2022", title: "Started B.Tech Journey",      desc: "Began B.Tech in Cloud Technology & Information Security at Ajeenkya DY Patil University." },

  { year: "Aug 2023", title: "Programming Foundations",     desc: "Built programming fundamentals with C and Java while strengthening problem-solving skills." },

  { year: "Jan 2024", title: "Cloud & Security",            desc: "Started learning Cloud Computing, Linux, Networking, Python, and Information Security, building a strong technical foundation." },

  { year: "Aug 2024", title: "AWS & Cloud Architecture",    desc: "Explored AWS fundamentals, cloud architecture, virtualization, networking, and security through coursework and hands-on labs." },

  { year: "Apr 2025", title: "Infrastructure Automation",   desc: "Began automating deployments and managing cloud infrastructure using Docker, Linux, and DevOps tools." },

  { year: "Jun 2025", title: "Real-World Projects",         desc: "Built the Telemedicine Platform as a final-year group project while developing an internship-level cloud and DevOps project independently and learning Kubernetes." },

  { year: "Jan 2026", title: "Internship & CI/CD",          desc: "Worked on Jenkins, Power BI, CI/CD pipelines, and enhanced cloud and DevOps projects during my internship." },

  { year: "Apr 2026", title: "AWS Certified",               desc: "Earned the AWS Certified Cloud Practitioner (CLF-C02), validating foundational knowledge of AWS Cloud services, architecture, security, and best practices." },

  { year: "Present",  title: "Growing as a Cloud Engineer", desc: "Continuing to build expertise in AWS, Kubernetes, DevOps, Linux, Networking, and Security through hands-on projects and continuous learning." },
];

// ═══════════════════════════════════════════════════════════
// CONSTANTS - Portfolio cards
// ═══════════════════════════════════════════════════════════

const CARDS: {
  category:    Exclude<PortfolioFilter, "All">;
  icon:        React.ReactNode;
  title:       string;
  subtitle:    string;
  description: string;
  tech:        string[];
  buttons:     { label: string; href: string }[];
}[] = [
  
  // ── Certifications ──────────────────────────────────────
  {
    category:    "Certifications", 
    icon:        <Award className="h-5 w-5 text-yellow-400" />,
    title:       "AWS Certified Cloud Practitioner",
    subtitle:    "Amazon Web Services · CLF-C02",
    description: "Foundational AWS certification validating cloud concepts, architecture, pricing, security, and core AWS services.",
    tech:        ["AWS", "Cloud Concepts", "IAM", "EC2", "S3", "Pricing & Support"],
    buttons:     [{ label: "Credly Badge", href: "https://www.credly.com/badges/30a486c6-e52b-4250-a616-bc685ccf9f9c" }],
  },
  {
    category:    "Certifications",
    icon:        <Terminal className="h-5 w-5 text-orange-400" />,
    title:       "The Linux Foundation  LFD-103",
    subtitle:    "A Beginner's Guide to Linux Kernel Development",
    description: "Foundational course covering Linux kernel architecture, development workflow, and contribution basics.",
    tech:        ["Linux", "Kernel", "Open Source"],
    buttons:     [{ label: "Credly Badge", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  {
    category:    "Certifications",
    icon:        <Cloud className="h-5 w-5 text-orange-300" />,
    title:       "AWS Certificate  Udemy",
    subtitle:    "AWS Fundamentals",
    description: "Hands-on coursework covering core AWS services, deployment patterns, and cloud architecture fundamentals.",
    tech:        ["AWS", "Cloud Computing"],
    buttons:     [{ label: "Certificate", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  {
    category:    "Certifications",
    icon:        <ShieldCheck className="h-5 w-5 text-blue-400" />,
    title:       "Saylor Academy  Information Security",
    subtitle:    "Information Security Fundamentals",
    description: "Coursework covering core information security principles, threat models, and security best practices.",
    tech:        ["Information Security", "Risk Management"],
    buttons:     [{ label: "Certificate", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  {
    category:    "Certifications",
    icon:        <Activity className="h-5 w-5 text-cyan-400" />,
    title:       "Saylor Academy  Computer Networks",
    subtitle:    "Networking Fundamentals",
    description: "Coursework covering networking concepts including protocols, topologies, and network architecture.",
    tech:        ["Networking", "TCP/IP"],
    buttons:     [{ label: "Certificate", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  {
    category:    "Certifications",
    icon:        <Code2 className="h-5 w-5 text-purple-400" />,
    title:       "Saylor Academy  Computer Architecture",
    subtitle:    "Computer Architecture Fundamentals",
    description: "Coursework covering core computer architecture concepts including processor design and system organization.",
    tech:        ["Computer Architecture", "Systems"],
    buttons:     [{ label: "Certificate", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  {
    category:    "Certifications",
    icon:        <GraduationCap className="h-5 w-5 text-emerald-400" />,
    title:       "Great Learning  Leadership and Management",
    subtitle:    "Leadership & Management Fundamentals",
    description: "Coursework covering leadership principles, team management, and organizational communication.",
    tech:        ["Leadership", "Management"],
    buttons:     [{ label: "Certificate", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  {
    category:    "Certifications",
    icon:        <Award className="h-5 w-5 text-rose-400" />,
    title:       "AutoCAD 3D Professional Certification",
    subtitle:    "3D Modelling & Design",
    description: "Certification validating proficiency in 3D modelling, design workflows, and AutoCAD tools.",
    tech:        ["AutoCAD", "3D Modelling"],
    buttons:     [{ label: "Certificate", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  
  // ── Projects ────────────────────────────────────────────
  {
    category:    "Projects",
    icon:        <ShieldCheck className="h-5 w-5 text-green-400" />,
    title:       "DevSecOps Flask Platform",
    subtitle:    "Secure CI/CD Application",
    description: "Flask application with integrated DevSecOps practices - containerised with Docker, scanned with Trivy & SonarQube, and deployed via GitHub Actions.",
    tech:        ["Python", "Flask", "Docker", "GitHub Actions", "Trivy", "SonarQube"],
    buttons:     [{ label: "GitHub", href: "https://github.com/shelkeaditya/devsecops-flask" }],
  },
  {
    category:    "Projects",
    icon:        <Activity className="h-5 w-5 text-blue-400" />,
    title:       "Resilient Server Monitoring Platform",
    subtitle:    "Infrastructure Monitoring",
    description: "Monitoring platform that tracks server health, CPU/memory metrics, and system availability with alerting for reliable infra management.",
    tech:        ["Linux", "Python", "Bash", "Networking", "Nginx"],
    buttons:     [{ label: "GitHub", href: "https://github.com/shelkeaditya/Resilient-Server-Monitoring-Platform" }],
  },
  {
    category:    "Projects",
    icon:        <Workflow className="h-5 w-5 text-orange-400" />,
    title:       "CI/CD Platform",
    subtitle:    "Automation Pipeline",
    description: "End-to-end automated build, test, and deployment pipeline that streamlines software delivery and infrastructure provisioning.",
    tech:        ["GitHub Actions", "Docker", "Jenkins", "Linux", "Shell Scripting"],
    buttons:     [{ label: "GitHub", href: "https://github.com/shelkeaditya/CICD-Platform" }],
  },
  {
    category:    "Projects",
    icon:        <Bot className="h-5 w-5 text-cyan-400" />,
    title:       "AI-Based Backup Management",
    subtitle:    "Intelligent Backup Automation",
    description: "Backup management solution using Python automation for scheduling, recovery planning, and efficient data protection workflows.",
    tech:        ["Python", "Linux", "Bash", "Cron", "Automation"],
    buttons:     [{ label: "GitHub", href: "https://github.com/shelkeaditya/Ai-based-backup-management" }],
  },
  {
    category:    "Projects",
    icon:        <Cloud className="h-5 w-5 text-sky-400" />,
    title:       "Nextcloud on Linux",
    subtitle:    "Self-Hosted Private Cloud",
    description: "Deployed and configured Nextcloud on a Linux server for secure self-hosted file sharing, storage, and team collaboration.",
    tech:        ["Linux", "Nextcloud", "Docker", "Nginx", "Networking"],
    buttons:     [{ label: "GitHub", href: "https://github.com/shelkeaditya/Nextcloud-on-Linux" }],
  },

  // ── Badges ──────────────────────────────────────────────
  {
    category:    "Badges", 
    icon:        <Award className="h-5 w-5 text-yellow-400" />,
    title:       "AWS Certified Cloud Practitioner",
    subtitle:    "Amazon Web Services · CLF-C02",
    description: "Foundational AWS certification validating cloud concepts, architecture, pricing, security, and core AWS services.",
    tech:        ["AWS", "Cloud Concepts", "IAM", "EC2", "S3", "Pricing & Support"],
    buttons:     [{ label: "Credly Badge", href: "https://www.credly.com/badges/30a486c6-e52b-4250-a616-bc685ccf9f9c" }],
  },
  {
    category:    "Badges",
    icon:        <Terminal className="h-5 w-5 text-orange-400" />,
    title:       "The Linux Foundation  LFD-103",
    subtitle:    "A Beginner's Guide to Linux Kernel Development",
    description: "Foundational course covering Linux kernel architecture, development workflow, and contribution basics.",
    tech:        ["Linux", "Kernel", "Open Source"],
    buttons:     [{ label: "Credly Badge", href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing" }],
  },
  
  // ── Publication ──────────────────────────────────────────
  {
    category:    "Publications",
    icon:        <FileText className="h-5 w-5 text-indigo-400" />,
    title:       "IRJET — Research Paper",
    subtitle:    "International Research Journal of Engineering and Technology",
    description: "Co-authored and published a peer-reviewed research paper in IRJET, an established engineering and technology journal.",
    tech:        ["Research", "Academic Writing"],
    buttons:     [{ label: "Read Paper", href: "https://drive.google.com/drive/u/0/folders/1m2cEsQOWPS5yQ7gLjM2Bu_xERdB0nE7A" }],
  },

];


// ═══════════════════════════════════════════════════════════
// HOOK - Theme
// ═══════════════════════════════════════════════════════════

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as "dark" | "light" | null;
    const t = saved ?? "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return { theme, toggle };
}

// ═══════════════════════════════════════════════════════════
// PRIMITIVES - Shared UI building blocks
// ═══════════════════════════════════════════════════════════

function SectionHeading({ title }: { title: string }) {
  const hasDot = title.endsWith(".");
  const base   = hasDot ? title.slice(0, -1) : title;
  return (
    <div className="mb-8">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
        {base}
        {hasDot && <span className="text-accent-violet">.</span>}
      </h2>
      <span className="heading-bar mt-3"><span /><span /></span>
    </div>
  );
}

function MetaRow({
  icon: Icon, label, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{children}</span>
      </div>
    </div>
  );
}

function IconLink({
  href, icon: Icon, label,
}: {
  href:  string;
  icon:  React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group surface-3 relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-orange)]/60 hover:text-foreground"
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: "color-mix(in oklab, var(--accent-orange) 25%, transparent)" }} />
      <Icon className="relative h-4 w-4" />
    </a>
  );
}

function IconButton({
  onClick, icon: Icon, label,
}: {
  onClick: () => void;
  icon:    React.ComponentType<{ className?: string }>;
  label:   string;
}) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className="group surface-3 relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-orange)]/60 hover:text-foreground"
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: "color-mix(in oklab, var(--accent-orange) 25%, transparent)" }} />
      <Icon className="relative h-4 w-4" />
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
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
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
    <div className="relative h-7 overflow-hidden">
      {words.map((word, i) => (
        <div
          key={word}
          className="absolute inset-0 flex items-center transition-all duration-700 ease-in-out text-base md:text-lg font-medium text-muted-foreground"
          style={{
            transform:
              i === index
                ? "translateY(0)"
                : i < index
                ? "translateY(-100%)"
                : "translateY(100%)",
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
// COMPONENT - ProfileHero  (3-column terminal layout)
//   col-1 : photo + name + role + handle
//   col-2 : system status block
//   col-3 : Download CV + email + social icons
// ═══════════════════════════════════════════════════════════

function ProfileHero({ onJourney }: { onJourney: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <section className="relative">
      <div className="surface-2 relative overflow-hidden rounded-2xl border border-border/60 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">

        

        {/* Mobile theme toggle */}
        <button onClick={toggle}
          className="absolute top-3 right-3 z-20 md:hidden surface-3 rounded-xl border border-border/60 p-2">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(500px 160px at 0% 50%, color-mix(in oklab, var(--accent-orange) 7%, transparent), transparent 70%)",
        }} />

        {/* ── 3-column row ── */}
        <div className="relative flex flex-col gap-5 px-6 py-5 md:flex-row md:items-center md:gap-0 md:px-8 md:py-5">

          {/* ── COL 1 - Photo + name + role + location ── */}
          <div className="flex items-center gap-4 md:flex-1 md:pr-8 md:border-r md:border-border/50">
            <div className="group relative shrink-0">
              <div aria-hidden
                className="pointer-events-none absolute -inset-0.5 rounded-xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "color-mix(in oklab, var(--accent-orange) 40%, transparent)" }} />
              <img src={profileImg} alt="Aditya Shelke"
                className="relative h-20 w-20 md:h-24 md:w-24 rounded-xl object-cover ring-2 ring-[color:var(--accent-orange)]/70 transition-all duration-300 group-hover:ring-[color:var(--accent-orange)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                Aditya <span className="font-light text-muted-foreground">Shelke</span>
              </h1>
              <div className="mt-0.5 h-5">
                <VerticalSlide 
                words={["DevOps Engineer", "Cloud Architect"]} />
              </div>
              
            </div>
          </div>

          {/* ── COL 2 - System Status ── */}
          <div className="md:w-[32%] md:px-19 md:border-r md:border-border/50">
            
            <div className="space-y-1.5 font-mono text-sm">
              <div className="flex items-center gap-3">
                <span className="w-[72px] shrink-0 text-[11px] text-muted-foreground/50">Job Status :</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[13px]">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[72px] shrink-0 text-[11px] text-muted-foreground/50">Time Zone :</span>
                <span className="text-[13px] text-foreground/70">GMT+5:30</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[72px] shrink-0 text-[11px] text-muted-foreground/50">Location :</span>
                <span className="text-[13px] text-foreground/70">Pune, India</span>
              </div>
            </div>
          </div>

          {/* ── COL 3 - Download CV + email + socials ── */}
          <div className="flex flex-col gap-3 md:flex-1 md:pl-8 md:items-end">
            {/* Download CV */}
            <a href="/Aditya Shelke CV.pdf" download
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--accent-orange)]/60 bg-[color:var(--accent-orange)]/10 px-4 py-2 text-sm font-semibold text-accent-orange transition-all hover:bg-[color:var(--accent-orange)]/20 hover:border-[color:var(--accent-orange)] hover:-translate-y-0.5">
              <Download className="h-4 w-4" />
              Download CV
            </a>

            {/* Email */}
            <a href="mailto:work.shelkeaditya@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              work.shelkeaditya@gmail.com
            </a>

            {/* Social icons + theme toggle */}
            <div className="flex items-center gap-1.5">
              <IconLink href="https://linkedin.com/in/shelkeaditya"  icon={Linkedin}    label="LinkedIn"  />
              <IconLink href="https://github.com/shelkeaditya"       icon={Github}      label="GitHub"    />
              <IconLink href="https://instagram.com/shelke__aditya"  icon={Instagram}   label="Instagram" />
              <IconLink href="https://x.com/shelke__aditya"          icon={TwitterIcon} label="Twitter"   />
              <IconButton onClick={onJourney} icon={Flag} label="Journey" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT - NavPanel (desktop sidebar)
// ═══════════════════════════════════════════════════════════

function NavPanel({
  active, setActive, theme, toggleTheme,
}: {
  active:      SectionKey;
  setActive:   (s: SectionKey) => void;
  theme:       "dark" | "light";
  toggleTheme: () => void;
}) {
  return (
    <aside className="surface-1 sticky top-7 h-fit rounded-3xl border border-border/60 p-5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]">
      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button key={key} onClick={() => setActive(key)}
              className={cn(
                "group relative flex items-center gap-2 rounded-2xl px-4 py-3.5 transition-all duration-300 ease-out",
                isActive
                  ? "bg-violet-500/10 text-violet-500 border-l-2 border-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                  : "text-muted-foreground hover:bg-foreground/8 hover:translate-x-1",
              )}
            >
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-violet-500/15 text-violet-300" : "bg-transparent text-muted-foreground group-hover:bg-foreground/5",
              )}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left">{label}</span>
              {isActive && <span className="h-5 w-1 rounded-full bg-violet-500" aria-hidden />}
            </button>
          );
        })}
      </nav>

      <div className="my-3 h-px bg-border/60" />

      <button onClick={toggleTheme} aria-label="Toggle theme"
        className="surface-3 group flex w-full items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-foreground">
        <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5">
          <Sun className={cn("h-4 w-4 absolute transition-all duration-500",
            theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
          <Moon className={cn("h-4 w-4 absolute transition-all duration-500",
            theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
        </span>
        <span className="flex-1 text-left">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
      </button>
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
      <p className="max-w-5xl text-[15px] leading-relaxed text-muted-foreground">
        I'm Aditya Shelke, a graduate in Cloud Technology and Information Security with a strong
        interest in Cloud Computing, DevOps, Linux, Networking, and Cybersecurity. I enjoy working
        with AWS services, automation tools, Linux environments, and container technologies while
        continuously exploring scalable and secure systems. Over time, I've worked on academic and
        self-learning projects involving cloud deployments, virtualization, CI/CD workflows, and
        infrastructure fundamentals. I'm currently focused on building my expertise in Cloud
        Engineering, DevOps practices, and Security while improving my practical skills through
        continuous learning and hands-on projects.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Cloud,     label: "Cloud",    value: "AWS • GCP • Azure"           },
          { icon: Container, label: "DevOps",   value: "Docker • Kubernetes • CI/CD" },
          { icon: Lock,      label: "Security", value: "Linux • Networking • VAPT"   },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label}
            className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-orange)]/25">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-5 w-5 text-accent-orange" />
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
  title, icon, children,
}: {
  title:    string;
  accent?:  "orange" | "purple";
  icon?:    React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ResumeItem({
  heading, college, year, location, description, points,
}: {
  heading:      string;
  college?:     string;
  year:         string;
  location:     string;
  description?: string;
  points?:      string[];
}) {
  return (
    <div className="surface-2 rounded-xl border border-border/60 p-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h4 className="text-xl font-semibold text-foreground">{heading}</h4>
          {college && <div className="text-base font-medium text-rose-400/50">{college}</div>}
          {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
          {points && points.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-orange" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm text-foreground">{year}</div>
          <div className="mt-1 text-sm text-muted-foreground">{location}</div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({
  icon: Icon, title, items,
}: {
  icon:  React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-orange)]/25">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent-orange" />
        <div className="text-sm font-medium text-foreground">{title}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="surface-3 rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground">{i}</span>
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

        <ResumeBlock title="Experience" accent="orange" icon={<Briefcase className="h-5 w-5 text-orange-400" />}>
          <ResumeItem
            heading="Cloud & DevSecOps Intern"
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

        <ResumeBlock title="Education" accent="orange" icon={<GraduationCap className="h-5 w-5 text-violet-400" />}>
          <ResumeItem
            heading="B.Tech - Cloud Technology & Information Security"
            college="Ajeenkya DY Patil University"
            year="Aug 2022 – May 2026"
            location="Pune, India"
          />
        </ResumeBlock>

        <ResumeBlock title="Skills" accent="purple" icon={<Award className="h-5 w-5 text-purple-400" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SkillCard icon={Cloud}       title="Cloud"     items={["AWS", "GCP", "Azure"]}                                                    />
            <SkillCard icon={Container}   title="DevOps"    items={["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "CI/CD"]} />
            <SkillCard icon={Terminal}    title="Linux"     items={["Bash", "Linux CLI", "SSH", "Ubuntu", "Debian", "Kali"]}                   />
            <SkillCard icon={ShieldCheck} title="Security"  items={["Trivy", "SonarQube", "Vault", "Networking", "VAPT"]}                      />
            <SkillCard icon={Code2}       title="Tools"     items={["Git", "VS Code", "Postman", "Nginx", "Apache", "Cloudflare"]}              />
            <SkillCard icon={Code2}       title="Languages" items={["Python", "Bash / Shell", "Java", "JavaScript"]}                           />
          </div>
        </ResumeBlock>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - Portfolio
// ═══════════════════════════════════════════════════════════

function PortfolioSection() {
  const [filter, setFilter] = useState<PortfolioFilter>("All");

  const filtered = useMemo(
    () => (filter === "All" ? CARDS : CARDS.filter((c) => c.category === filter)),
    [filter],
  );

  const filters: PortfolioFilter[] = ["All", "Projects", "Certifications", "Badges", "Publications"];

  return (
    <div>
      <SectionHeading title="Portfolio." />

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-[color:var(--accent-orange)]/50 bg-[color:var(--accent-orange)]/10 text-accent-violet"
                : "surface-2 border-border/60 text-muted-foreground hover:text-foreground",
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((c) => (
          <div key={c.title}
            className="surface-2 group flex flex-col rounded-xl border border-border/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-orange)]/40 hover:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.7)]">

            {/* Card header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{c.icon}</div>
                  <h4 className="text-base font-semibold text-foreground">{c.title}</h4>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{c.subtitle}</div>
              </div>
              <span className="surface-3 shrink-0 rounded-md border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.category}
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>

            {/* Tech stack */}
            {c.tech.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tech.map((t) => <TechBadge key={t} label={t} />)}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto pt-5 flex flex-wrap gap-2">
              {c.buttons.map((b, i) => (
                <a key={b.label} href={b.href}
                  target={b.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    i === 0
                      ? "border-[color:var(--accent-orange)]/50 bg-[color:var(--accent-orange)]/10 text-accent-orange hover:bg-[color:var(--accent-orange)]/15"
                      : "surface-3 border-border/60 text-foreground hover:border-border",
                  )}>
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

// ═══════════════════════════════════════════════════════════
// SECTION - Blog
// ═══════════════════════════════════════════════════════════

function Blog() {
  return (
    <div>
      <SectionHeading title="Blog." />
      <div className="surface-2 rounded-2xl border border-border/60 p-10 text-center">
        <Rss className="mx-auto h-8 w-8 text-accent-purple" />
        <h3 className="mt-3 text-lg font-semibold text-foreground">Coming Soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Writing about Cloud, DevOps, Linux, and Cybersecurity. Check back soon!
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION - Contact
// ═══════════════════════════════════════════════════════════

function Contact() {
  const [sending,  setSending]  = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [time,     setTime]     = useState("");

  // Live IST clock
  useEffect(() => {
    const update = () => setTime(
      new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour:     "2-digit",
        minute:   "2-digit",
        second:   "2-digit",
        hour12:   true,
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
      .sendForm("service_fdq7bwf", "template_jpawssn", e.target as HTMLFormElement, "X7cczgqlSFWmadFLE")
      .then(() => {
        setSending(false);
        const next = msgCount + 1;
        setMsgCount(next);
        if (next >= 2) {
          setCooldown(true);
          setTimeout(() => { setCooldown(false); setMsgCount(0); }, 60_000);
          toast.warning("Message sent! Please wait 60 seconds before sending again.");
        } else {
          toast.success("Message sent! I'll get back to you shortly.");
        }
      })
      .catch(() => { setSending(false); toast.error("Something went wrong. Please try again."); });
  }

  return (
    <div>
      <SectionHeading title="Let's Connect." />
      <p className="text-muted-foreground max-w-2xl mb-6 text-justify">
        Whether it's a job opportunity, a project or just a tech conversation - I'd love to hear from you.
      </p>

      {/* Two-column layout: wide form + narrow info panel */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">

        {/* ── Left: contact form (takes all available width) ── */}
        <form onSubmit={onSubmit}
          className="surface-2 flex-1 grid gap-4 rounded-2xl border border-border/60 p-6">
          <Field label="Name">
            <Input required name="name" placeholder="Your name" className="surface-3 h-10 w-full" />
          </Field>
          <Field label="Email">
            <Input required type="email" name="email" placeholder="you@example.com" className="surface-3 h-10 w-full" />
          </Field>
          <Field label="Message">
            <Textarea
              required
              name="message"
              placeholder="What's on your mind?"
              rows={2}
              className="surface-3 w-full resize-none overflow-hidden"
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Get In Touch</p>

            {/* Email row */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href="mailto:work.shelkeaditya@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              work.shelkeaditya@gmail.com
            </a>
            </div>

            {/* Location row */}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex items-center gap-2 text-sm text-muted-foreground">Pune, Maharashtra</span>
            </div>

            {/* Find me on */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50 mb-3">Find me on</p>
              <div className="flex items-center gap-2">
                <a href="https://linkedin.com/in/shelkeaditya" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://x.com/shelke__aditya" target="_blank" rel="noreferrer" aria-label="Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                  <TwitterIcon className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/shelke__aditya" target="_blank" rel="noreferrer" aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://github.com/shelkeaditya" target="_blank" rel="noreferrer" aria-label="GitHub"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                  <Github className="h-4 w-4" />
                </a>
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
            <span aria-hidden
              className="absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border border-border/80 bg-card shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-orange)_18%,transparent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-orange transition-all group-hover:scale-150" />
            </span>
            <div className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-orange)]/25">
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
    about:     <About />,
    resume:    <Resume />,
    portfolio: <PortfolioSection />,
    blog:      <Blog />,
    contact:   <Contact />,
    journey:   <Journey />,
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
  const { theme, toggle }   = useTheme();

  return (
    <div className="ambient-bg relative min-h-screen text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-texture opacity-40" />
      <Toaster />

      {/* ── Decorative corner triangles ── */}
      <div className="poly-bg-left">
        <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 165,0 0,165"         fill="#7C3AED" opacity="0.80" />
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
          <polygon points="420,420 255,420 420,255"          fill="#7C3AED" opacity="0.70" />
          <polygon points="255,420 205,420 420,205 420,255"  fill="#5B21B6" opacity="0.55" />
          <polygon points="205,420 162,420 420,162 420,205"  fill="#7C3AED" opacity="0.28" />
          <polygon points="162,420 124,420 420,124 420,162"  fill="#5B21B6" opacity="0.14" />
          <polygon points="124,420 90,420  420,90  420,124"  fill="#7C3AED" opacity="0.07" />
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

      {/* ── Main layout ── */}
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <ProfileHero onJourney={() => setActive("journey")} />

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
              <button key={key} onClick={() => setActive(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                  isActive ? "bg-violet-500/15 text-violet-400" : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
                )}>
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