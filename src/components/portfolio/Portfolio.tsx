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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import profileImg from "@/assets/profile.jpeg";

type SectionKey = "about" | "resume" | "portfolio" | "blog" | "contact" | "journey";

const NAV: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "about", label: "About", icon: User },
  { key: "resume", label: "Resume", icon: FileText },
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
  { key: "blog", label: "Blog", icon: BookOpen },
  { key: "contact", label: "Contact", icon: Send },
];

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "dark"
      | "light"
      | null;
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

function SectionHeading({ title }: { title: string }) {
  const hasDot = title.endsWith(".");
  const base = hasDot ? title.slice(0, -1) : title;
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

function ProfileHero({ onJourney }: { onJourney: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <section className="relative">
      <div className="surface-2 relative overflow-hidden rounded-2xl border border-border/60 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">

        <button
          onClick={toggle}
          className="absolute top-3 right-3 z-20 md:hidden surface-3 rounded-xl border border-border/60 p-2"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Very subtle low-intensity ambient orange lighting */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 200px at 10% 0%, color-mix(in oklab, var(--accent-orange) 8%, transparent), transparent 70%)," +
              "radial-gradient(400px 160px at 90% 100%, color-mix(in oklab, var(--accent-orange) 5%, transparent), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-6 p-5 md:flex-row md:items-center md:text-left md:gap-10 md:px-8 md:py-6">
  {/* Profile picture */}
  <div className="shrink-0 flex justify-center">
    <div className="group relative w-fit">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "color-mix(in oklab, var(--accent-orange) 30%, transparent)" }}
      />
      <img
        src={profileImg}
        alt="Aditya Shelke"
        width={160}
        height={160}
        className="relative h-32 w-32 md:h-40 md:w-40 rounded-3xl object-cover shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] ring-2 ring-[color:var(--accent-orange)]/70 transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:ring-[color:var(--accent-orange)]"
      />
    </div>
  </div>

          {/* Identity column */}
          <div className="min-w-0 w-full md:w-[370px] md:border-r md:border-border/60 md:pr-12 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Aditya <span className="text-violet-400">Shelke</span>
            </h1>
            <div className="mt-2 h-6 md:h-7">
              <Typewriter
                words={[
                  "Cloud Computing",
                  "DevOps",
                  "CyberSecurity",
                ]}
              />
            </div>

            {/* Icons only social row */}
            <div className="mt-5 flex flex-wrap justify-center md:justify-start items-center gap-2">
              <IconLink href="https://instagram.com/shelke__aditya" icon={Instagram} label="Instagram" />
              <IconLink href="https://x.com/shelke__aditya" icon={TwitterIcon} label="Twitter" />
              <IconLink href="https://linkedin.com/in/shelkeaditya" icon={Linkedin} label="LinkedIn" />
              <IconLink href="https://github.com/shelkeaditya" icon={Github} label="GitHub" />
              <IconButton onClick={onJourney} icon={Flag} label="Journey" accent="orange" />
            </div>
          </div>

          {/* Metadata grid */}
          <div className="min-w-0 w-full flex-1 text-left">
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="group transition-all duration-300 hover:text-orange-300">
  
              <MetaRow icon={Mail} label="Email"
              >
                <a href="mailto:work.shelkeaditya@gmail.com" className="flex items-center gap-2 hover:text-foreground hover:underline underline-offset-2 transition-colors duration-200">
                  <span className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                   Email
                 </span> 
                </a>
              </MetaRow>
            </div>
            
              <MetaRow icon={Download} label="CV" >
                <a
                  href="/aditya-shelke-resume.pdf"
                  download 
                  className="flex items-center gap-2 hover:text-[color:var(--accent-orange)] transition-colors duration-200"
                >
                  {/* <Download className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-orange-400" /> */}
              
                Download
                </a>
              </MetaRow>
              
              <MetaRow icon={MapPin} label="Location">Pune, India</MetaRow>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Status
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Open to Work
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IconLink({
  href,
  icon: Icon,
  label,
  accent = "orange",
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent?: "orange" | "orange";
}) {
  const hoverColor =
    accent === "orange" ? "var(--accent-orange)" : "var(--accent-orange)";
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group surface-3 relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-orange)]/60 hover:text-foreground"
      style={{ ["--hover" as never]: hoverColor }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: `color-mix(in oklab, ${hoverColor} 25%, transparent)` }}
      />
      <Icon className="relative h-4 w-4" />
    </a>
  );
}

function IconButton({
  onClick,
  icon: Icon,
  label,
  accent = "orange",
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent?: "orange" | "orange";
}) {
  const hoverColor =
    accent === "orange" ? "var(--accent-orange)" : "var(--accent-orange)";
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="group surface-3 relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-orange)]/60 hover:text-foreground"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: `color-mix(in oklab, ${hoverColor} 25%, transparent)` }}
      />
      <Icon className="relative h-4 w-4" />
    </button>
  );
}

function Typewriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    const atFull = !deleting && text === current;
    const atEmpty = deleting && text === "";
    const delay = atFull ? 1600 : atEmpty ? 400 : deleting ? 35 : 70;

    const t = setTimeout(() => {
      if (atFull) {
        setDeleting(true);
        return;
      }
      if (atEmpty) {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
        return;
      }
      setText((prev) =>
        deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1),
      );
    }, delay);

    return () => clearTimeout(t);
  }, [text, deleting, index, words]);

  return (
    <p className="text-base md:text-lg font-medium text-muted-foreground">
      <span>{text}</span>
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] bg-foreground/70 animate-pulse"
      />
    </p>
  );
}

function Meta({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-3 flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{children}</span>
      </div>
    </div>
  );
}

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
                 : "text-muted-foreground hover:bg-foreground/8 hover:translate-x-1"
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
              {isActive && (
                <span className="h-5 w-1 rounded-full bg-violet-500" aria-hidden />
              )}
            </button>
          );
        })}
      </nav>
      <div className="my-3 h-px bg-border/60" />
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="surface-3 group flex w-full items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-foreground"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5">
          <Sun
            className={cn(
              "h-4 w-4 absolute transition-all duration-500",
              theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "h-4 w-4 absolute transition-all duration-500",
              theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
            )}
          />
        </span>
        <span className="flex-1 text-left">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
      </button>
    </aside>
  );
}

function About() {
  return (
    <div>
      <SectionHeading title="About Me." />
      <p className="max-w-5xl text-[15px] leading-relaxed text-muted-foreground">
       I’m Aditya Shelke, a graduate in Cloud Technology and Information Security with a strong interest in Cloud Computing, DevOps, Linux, Networking, and Cybersecurity. I enjoy working with AWS services, automation tools, Linux environments, and container technologies while continuously exploring scalable and secure systems. Over time, I’ve worked on academic and self-learning projects involving cloud deployments, virtualization, CI/CD workflows, and infrastructure fundamentals. I’m currently focused on building my expertise in Cloud Engineering, DevOps practices, and Security while improving my practical skills through continuous learning and hands-on projects.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Cloud, label: "Cloud", value: "AWS • GCP • Azure" },
          { icon: Container, label: "DevOps", value: "Docker • Kubernetes • CI/CD" },
          { icon: Lock, label: "Security", value: "Linux • Networking • VAPT" },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-orange)]/25"
          >
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

function Resume() {
  return (
    <div>
      <SectionHeading title="Resume." />
      <div className="space-y-10">
        <ResumeBlock 
        title="Experience" 
        accent="orange"
        icon={<Briefcase className="h-5 w-5 text-orange-400" />}
        >
          <ResumeItem
            heading="Hands-on Cloud Labs & Projects"
            year="2023 – Present" 
            location="Self Learning"
            description="Worked on hands-on cloud and DevOps projects involving AWS services, Linux administration, containerization, CI/CD workflows, and virtualization. Built and managed small-scale deployment environments while continuously improving automation, infrastructure, and security fundamentals."
            
            points={[
              "Deployed AWS EC2, S3, IAM, and VPC configurations",
              "Built CI/CD pipelines using GitHub Actions",
              "Practiced Terraform ",
              "Worked with Linux server management",
              "Learned Docker workflows",
            ]}
          />
        </ResumeBlock>

        <ResumeBlock
          title="Education"
          accent="orange"
          icon={<GraduationCap className="h-5 w-5 text-violet-400" />}
        >
          <ResumeItem
            heading="B.Tech in Cloud Technology & Information Security"
            college="Ajeenkya DY Patil University"
            year="2022 – 2026"
            location="Pune, India"
            
          />
        </ResumeBlock>

        <ResumeBlock 
        title="Skills" 
        accent="purple"
        icon={<Award className="h-5 w-5 text-purple-400" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SkillCard icon={Cloud} title="Cloud" items={["AWS", "GCP ", "Azure "]} />
            <SkillCard icon={Container} title="DevOps" items={["Docker", "GitHub Actions", "CI/CD", "Terraform ", "Kubernetes ", "Jenkins "]} />
            <SkillCard icon={Terminal} title="Linux" items={["Bash", "Linux CLI", "SSH", "Ubuntu", "Debian", "Kali"]} />
            <SkillCard icon={ShieldCheck} title="Security" items={["Cybersecurity Fundamentals", "Networking", "TryHackMe", "VAPT"]} />
            <SkillCard icon={Code2} title="Tools" items={["Git", "VS Code", "Postman", "Nginx", "VMware", "VirtualBox"]} />
            <SkillCard icon={Code2} title="Languages" items={["Python", "Bash", "Java", " JavaScript"]} />
          </div>
        </ResumeBlock>
      </div>
    </div>
  );
}

function ResumeBlock({
  title,
  accent,
  children,
  icon,
}: {
  title: string;
  accent: "orange" | "purple";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const color =
    accent === "orange"
      ? "var(--accent-orange)"
      : "var(--accent-purple)";
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
  icon,
}: {
  heading: string;
  college?: string;
  year: string;
  location: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface-2 rounded-xl border border-border/60 p-5"> 
        <div className="flex items-start justify-between gap-6">
  <div className="flex-1">
    <h4 className="text-xl font-semibold text-foreground">
      {heading}
    </h4>

    {college && (
      <div className="text-base font-medium text-rose-400/50">
        {college}
      </div>
    )}

    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
      {description}
    </p>
  </div>

  <div className="text-right">
    <div className="text-sm text-foreground">
      {year}
    </div>

    <div className="mt-1 text-sm text-muted-foreground">
      {location}
    </div>
  </div>
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
    <div className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-orange)]/25">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-accent-orange" />
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

type PortfolioFilter = "All" | "Projects" | "Certifications" | "Badges";

const CARDS: {
  category: Exclude<PortfolioFilter, "All">;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  tech?: string[];
  buttons: { label: string; href: string }[];
}[] = [
  {
  category: "Certifications",
  icon: <Award className="h-5 w-5 text-yellow-400" />,
  title: "AWS Certified Cloud Practitioner",
  subtitle: "Issued by Amazon Web Services",
  description:
    "Foundational AWS certification validating cloud concepts, architecture, pricing, security, and AWS services.",
  buttons: [
    {
      label: "Certificate",
      href: "https://www.credly.com/badges/30a486c6-e52b-4250-a616-bc685ccf9f9c",
    },
  ],
},
  {
  category: "Projects",
  icon: <ShieldCheck className="h-5 w-5 text-green-400" />,
  title: "DevSecOps Flask Platform",
  subtitle: "Secure CI/CD Application",
  description:
    "Flask application integrated with DevSecOps practices including containerization, CI/CD workflows, and security-focused development.",
  tech: ["Flask", "Docker", "GitHub Actions", "CI/CD"],
  buttons: [
    {
      label: "GitHub",
      href: "https://github.com/shelkeaditya/devsecops-flask",
    },
  ],
},

{
  category: "Projects",
  icon: <Activity className="h-5 w-5 text-blue-400" />,
  title: "Resilient Server Monitoring Platform",
  subtitle: "Infrastructure Monitoring",
  description:
    "Monitoring platform designed to track server health, performance metrics, and system availability for reliable infrastructure management.",
  tech: ["Linux", "Monitoring", "Networking", "Python"],
  buttons: [
    {
      label: "GitHub",
      href: "https://github.com/shelkeaditya/Resilient-Server-Monitoring-Platform",
    },
  ],
},

{
  category: "Projects",
  icon: <Workflow className="h-5 w-5 text-orange-400" />,
  title: "CI/CD Platform",
  subtitle: "Automation Pipeline",
  description:
    "Implemented automated build, testing, and deployment workflows to streamline software delivery and infrastructure management.",
  tech: ["GitHub Actions", "Docker", "CI/CD", "Linux"],
  buttons: [
    {
      label: "GitHub",
      href: "https://github.com/shelkeaditya/CICD-Platform",
    },
  ],
},

{
  category: "Projects",
  icon: <Bot className="h-5 w-5 text-cyan-400" />,
  title: "AI-Based Backup Management",
  subtitle: "Backup Automation",
  description:
    "Intelligent backup management solution focused on automation, recovery planning, and efficient data protection workflows.",
  tech: ["Python", "AI", "Automation", "Linux"],
  buttons: [
    {
      label: "GitHub",
      href: "https://github.com/shelkeaditya/Ai-based-backup-management",
    },
  ],
},

{
  category: "Projects",
  icon: <Cloud className="h-5 w-5 text-cyan-400" />,
  title: "Nextcloud on Linux",
  subtitle: "Private Cloud Storage",
  description:
    "Deployed and configured a self-hosted Nextcloud environment on Linux for secure file sharing, storage, and collaboration.",
  tech: ["Linux", "Nextcloud", "Docker", "Networking"],
  buttons: [
    {
      label: "GitHub",
      href: "https://github.com/shelkeaditya/Nextcloud-on-Linux",
    },
  ],
},
  {
    category: "Badges",
    icon: <Award className="h-5 w-5 text-purple-400" />,
    title: "TryHackMe Badge",
    subtitle: "Cybersecurity Learning",
    description:
      "Cybersecurity learning badges focused on Linux, networking, reconnaissance, and penetration testing.",
    buttons: [
      { label: "Profile", href: "#" },
      { label: "Badge", href: "#" },
    ],
  },
];

function Portfolio_Section() {
  const [filter, setFilter] = useState<PortfolioFilter>("All");
  const filtered = useMemo(
    () => (filter === "All" ? CARDS : CARDS.filter((c) => c.category === filter)),
    [filter],
  );
  const filters: PortfolioFilter[] = ["All", "Projects", "Certifications", "Badges"];
  return (
    <div>
      <SectionHeading title="Portfolio." />
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-[color:var(--accent-orange)]/50 bg-[color:var(--accent-orange)]/10 text-accent-violet"
                : "surface-2 border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((c) => (
          <div
            key={c.title}
            className="surface-2 group flex flex-col rounded-xl border border-border/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-orange)]/40 hover:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
              <div className="flex items-center gap-2">
                <div className="text-3xl">
                  {c.icon}
                </div>
                <h4 className="text-base font-semibold text-foreground">{c.title}</h4>
                </div>

  <div className="mt-1 text-xs text-muted-foreground">
    {c.subtitle}
  </div>
</div>
              <span className="surface-3 rounded-md border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {c.category}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
            {c.tech && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tech.map((t) => (
                  <span
                    key={t}
                    className="surface-3 rounded-md border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {c.buttons.map((b, i) => (
                <a
                  key={b.label}
                  href={b.href}
                  target={b.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    i === 0
                      ? "border-[color:var(--accent-orange)]/50 bg-[color:var(--accent-orange)]/10 text-accent-orange hover:bg-[color:var(--accent-orange)]/15"
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

function Blog() {
  return (
    <div>
      <SectionHeading title="Blog." />
      <div className="surface-2 rounded-2xl border border-border/60 p-10 text-center">
        <Rss className="mx-auto h-8 w-8 text-accent-purple" />
        <h3 className="mt-3 text-lg font-semibold text-foreground">Coming Soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          I'm working on writing about Cloud, DevOps, Linux, and Cybersecurity. Check back soon!
        </p>
      </div>
    </div>
  );
}

function Contact() {
  const [sending, setSending] = useState(false);
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent — I'll get back to you shortly.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  }
  return (
   <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

  {/* Left column */}
  <div>

    <SectionHeading title="Let's Connect." />

    <p className="text-muted-foreground max-w-2xl mb-6">
    Have an opportunity, project, or question? Feel free to reach out via email
    or connect with me on LinkedIn. I'm currently open to cloud, DevOps and
    security related opportunities.
  </p>

  <form
    onSubmit={onSubmit}
    className="surface-2 grid max-w-xl gap-4 rounded-2xl border border-border/60 p-6"
  >
    <Field label="Name">
      <Input
        required
        name="name"
        placeholder="Your name"
        className="surface-3 h-10"
      />
    </Field>

    <Field label="Email">
      <Input
        required
        type="email"
        name="email"
        placeholder="you@example.com"
        className="surface-3 h-10"
      />
    </Field>

    <Field label="Message">
      <Textarea
        required
        name="message"
        placeholder="What's on your mind?"
        rows={5}
        className="surface-3"
      />
    </Field>

    <div>
      <Button
        type="submit"
        disabled={sending}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        {sending ? "Sending..." : "Send Message"}
      </Button>
    </div>
  </form>
</div>


  {/* Right column - Quick Info */}
  <div className="surface-2 rounded-2xl border border-border/60 p-6 h-fit mt-48">
  <h3 className="text-lg font-semibold mb-5">Quick Info</h3>

  <div className="space-y-5">

    <div className="flex items-start gap-3">
      <MapPin className="h-5 w-5 text-orange-400 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Location
        </p>
        <p>Pune, India</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <Clock3 className="h-5 w-5 text-blue-400 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Response Time
        </p>
        <p>Usually within 24 hours</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <Briefcase className="h-5 w-5 text-violet-400 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Availability
        </p>
        <p>Open to Cloud & DevOps Roles</p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <CircleCheck className="h-5 w-5 text-green-400 mt-0.5" />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Status
        </p>
        <p className="text-green-400">Open to Work</p>
      </div>
    </div>

    </div>
    </div>
    </div>
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

const JOURNEY = [
  { year: "2022", title: "Start of a new jounrey taking addmission in B.Tech", desc: "Cloud Technology & Information Security" },
  { year: "2022", title: "Linux & Networking", desc: "Learned the fundamentals of operating systems and networks" },
  { year: "2023", title: "AWS & DevOps", desc: "Began deep diving into cloud and automation tooling" },
  { year: "2024", title: "AWS Certified", desc: "AWS Certified Cloud Practitioner" },
  { year: "2025", title: "Containers & Orchestration", desc: "Exploring Docker & Kubernetes" },
  { year: "Now", title: "Cloud Engineer", desc: "Working toward becoming a full-time Cloud Engineer" },
];

function Journey() {
  return (
    <div>
      <SectionHeading title="Journey." />
      <ol className="relative ml-3 border-l border-border/70 pl-6">
        {JOURNEY.map((j, i) => (
          <li key={i} className="group relative pb-7 last:pb-0">
            <span
              className="absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border border-border/80 bg-card shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-orange)_18%,transparent)]"
              aria-hidden
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-orange transition-all group-hover:scale-150" />
            </span>
            <div className="surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-orange)]/25">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                  {j.year}
                </span>
              </div>
              <div className="mt-1 text-base font-medium text-foreground">{j.title}</div>
              <div className="text-sm text-muted-foreground">{j.desc}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionRenderer({ active }: { active: SectionKey }) {
  const map: Record<SectionKey, React.ReactNode> = {
    about: <About />,
    resume: <Resume />,
    portfolio: <Portfolio_Section />,
    blog: <Blog />,
    contact: <Contact />,
    journey: <Journey />,
  };
  return (
    <div key={active} className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      {map[active]}
    </div>
  );
}

export default function Portfolio() {
  const [active, setActive] = useState<SectionKey>("about");
  const { theme, toggle } = useTheme();

  return (
    <div className="ambient-bg relative min-h-screen text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-texture opacity-40" />
      <Toaster />
      
      {/* poly-bg triangles stay the same */}
      <div className="poly-bg-left">
  <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,0 165,0 0,165"            fill="#7C3AED" opacity="0.80"/>
    <polygon points="165,0 215,0 0,215 0,165"    fill="#BE123C" opacity="0.65"/>
    <polygon points="215,0 260,0 0,260 0,215"    fill="#7C3AED" opacity="0.32"/>
    <polygon points="260,0 300,0 0,300 0,260"    fill="#BE123C" opacity="0.16"/>
    <polygon points="300,0 335,0 0,335 0,300"    fill="#7C3AED" opacity="0.08"/>
    <defs>
      <linearGradient id="fxL" x1="0" y1="0" x2="1" y2="0">
        <stop offset="40%" stopColor="var(--background)" stopOpacity="0"/>
        <stop offset="100%" stopColor="var(--background)" stopOpacity="1"/>
      </linearGradient>
      <linearGradient id="fyL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="40%" stopColor="var(--background)" stopOpacity="0"/>
        <stop offset="100%" stopColor="var(--background)" stopOpacity="1"/>
      </linearGradient>
    </defs>
    <rect width="420" height="420" fill="url(#fxL)"/>
    <rect width="420" height="420" fill="url(#fyL)"/>
  </svg>
</div>

<div className="poly-bg-right">
  <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
    <polygon points="420,420 255,420 420,255"         fill="#7C3AED" opacity="0.70"/>
    <polygon points="255,420 205,420 420,205 420,255" fill="#5B21B6" opacity="0.55"/>
    <polygon points="205,420 162,420 420,162 420,205" fill="#7C3AED" opacity="0.28"/>
    <polygon points="162,420 124,420 420,124 420,162" fill="#5B21B6" opacity="0.14"/>
    <polygon points="124,420 90,420  420,90  420,124" fill="#7C3AED" opacity="0.07"/>
    <defs>
      <linearGradient id="fxR" x1="1" y1="0" x2="0" y2="0">
        <stop offset="40%" stopColor="var(--background)" stopOpacity="0"/>
        <stop offset="100%" stopColor="var(--background)" stopOpacity="1"/>
      </linearGradient>
      <linearGradient id="fyR" x1="0" y1="1" x2="0" y2="0">
        <stop offset="40%" stopColor="var(--background)" stopOpacity="0"/>
        <stop offset="100%" stopColor="var(--background)" stopOpacity="1"/>
      </linearGradient>
    </defs>
    <rect width="420" height="420" fill="url(#fxR)"/>
    <rect width="420" height="420" fill="url(#fyR)"/>
  </svg>
</div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <ProfileHero onJourney={() => setActive("journey")} />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
          <main className="surface-1 min-h-[420px] rounded-2xl border border-border/60 p-6 md:p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.7)] mb-24 md:mb-0">
            <SectionRenderer active={active} />
          </main>

          {/* Side nav — desktop only */}
          <div className="hidden md:block">
            <NavPanel active={active} setActive={setActive} theme={theme} toggleTheme={toggle} />
          </div>
        </div>

        <footer className="mt-12 border-t border-border/60 pt-6 pb-2 text-center text-xs text-muted-foreground hidden md:block">
          © 2026 Aditya Rajendra Shelke
        </footer>
      </div>

      {/* Bottom nav — mobile only */}
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
                    : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
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