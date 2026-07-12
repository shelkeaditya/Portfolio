import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { User, FileText, Briefcase, Workflow, Send, Sun, Moon, ChevronDown, Mail, Download, Linkedin, Github, Instagram, TwitterIcon, Flag, MapPin, Code2, Cloud, Globe, Activity, Monitor, ExternalLink, GraduationCap, Container, Terminal, ShieldCheck, Award, Lock, Bot, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Toaster as Toaster$1, toast } from "sonner";
import emailjs from "@emailjs/browser";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const profileImg = "/assets/profile-DYU8eqih.jpeg";
const NAV = [
  { key: "about", label: "About", icon: User },
  { key: "resume", label: "Resume", icon: FileText },
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
  { key: "infra", label: "Build", icon: Workflow },
  { key: "contact", label: "Contact", icon: Send }
];
const INFRA_GROUPS = [
  { id: "build", title: "Build", category: "build", x: 55, y: 65, w: 220, h: 290 },
  { id: "observability", title: "Observability", category: "observability", x: 672, y: 65, w: 225, h: 425 }
];
const INFRA_NODES = [
  {
    id: "development",
    title: "Development",
    subtitle: "Local Environment",
    meta: "VS Code · React · TS",
    items: ["VS Code", "React", "TanStack Start", "TypeScript", "Tailwind CSS", "Git"],
    category: "build",
    icon: Code2,
    group: "build",
    x: 165,
    y: 150,
    detail: {
      purpose: "Local development environment where the portfolio is written and iterated on before every commit.",
      technologies: ["VS Code", "React", "TanStack Start", "TypeScript", "Tailwind CSS", "Git"],
      responsibilities: [
        "Component development",
        "Styling & layout",
        "Type safety",
        "Local testing before commit"
      ],
      relationships: ["Pushes commits to GitHub"],
      configuration: "Vite dev server with hot module reload",
      futureImprovements: "Add Storybook for isolated component development"
    }
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
        "Fires a webhook to Cloudflare on every push to main"
      ],
      relationships: ["Receives pushes from Development", "Triggers Cloudflare Workers via webhook"],
      configuration: "main is the only deploy branch — every push ships automatically",
      futureImprovements: "Add branch preview deployments for pull requests"
    }
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
      purpose: "The center of the deployment — receives GitHub's webhook, builds the app, and runs it on Cloudflare's edge network.",
      technologies: ["Cloudflare Workers", "TanStack Start SSR"],
      responsibilities: [
        "Builds the project on every webhook trigger",
        "Runs the TanStack Start SSR runtime at the edge",
        "Serves every request close to the visitor"
      ],
      relationships: [
        "Triggered by GitHub's webhook",
        "Resolved through Cloudflare DNS",
        "Reports to Workers Logs & Traces",
        "Serves the Portfolio application"
      ],
      buildProcess: "Webhook → npm install → vite build → deployed to the edge",
      runtimeDetails: "Sits outside every group — it's the single runtime the whole pipeline depends on"
    }
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
      relationships: ["Two-way link with Cloudflare Workers", "Hands resolved requests through to the Portfolio"]
    }
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
      relationships: ["Fed directly by Cloudflare Workers"]
    }
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
      relationships: ["Fed directly by Cloudflare Workers"]
    }
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
      technologies: ["React", "TanStack Start", "Tailwind CSS"],
      responsibilities: ["Renders Home, About, Projects, Media & Resume", "Handles the Contact Form submission"],
      relationships: [
        "Served by Cloudflare DNS / Workers",
        "Sends Contact Form submissions to Communication",
        "Loaded by the User Browser"
      ],
      futureImprovements: "Add a blog / MDX-powered writing section"
    }
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
      relationships: ["Receives the final response from the Portfolio"]
    }
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
      purpose: "Delivers Contact Form submissions straight to my inbox — a branch off the Portfolio only, with no ties to GitHub or Cloudflare at all.",
      technologies: ["EmailJS", "Gmail"],
      responsibilities: [
        "Receives form data client-side",
        "Relays the message via the EmailJS API",
        "Delivers the email to Gmail"
      ],
      relationships: ["Only the Portfolio connects to it"],
      configuration: "Client-side only call from the Portfolio — no backend, no queue",
      futureImprovements: "Add a serverless fallback queue for guaranteed delivery"
    }
  }
];
const INFRA_EDGES = [
  { from: "development", to: "github", label: "git push", style: "dashed", category: "build" },
  { from: "github", to: "workers", label: "webhook", style: "dashed", category: "build" },
  { from: "workers", to: "dns", label: "", style: "solid", category: "runtime", bidirectional: true },
  { from: "workers", to: "logs", label: "", style: "dotted", category: "runtime" },
  { from: "workers", to: "traces", label: "", style: "dotted", category: "runtime" },
  { from: "dns", to: "portfolio", label: "serves request", style: "solid", category: "observability" },
  { from: "portfolio", to: "userBrowser", label: "https", style: "solid", category: "application" },
  { from: "portfolio", to: "communication", label: "contact form", style: "vertical", category: "communication" }
];
const INFRA_CATEGORY_STYLE = {
  build: {
    text: "text-orange-400",
    ring: "border-orange-400/40",
    dot: "bg-orange-400",
    stroke: "#fb923c"
  },
  runtime: {
    text: "text-emerald-400",
    ring: "border-emerald-400/40",
    dot: "bg-emerald-400",
    stroke: "#34d399"
  },
  observability: {
    text: "text-violet-400",
    ring: "border-violet-400/40",
    dot: "bg-violet-400",
    stroke: "#a78bfa"
  },
  application: {
    text: "text-blue-400",
    ring: "border-blue-400/40",
    dot: "bg-blue-400",
    stroke: "#60a5fa"
  },
  communication: {
    text: "text-fuchsia-400",
    ring: "border-fuchsia-400/40",
    dot: "bg-fuchsia-400",
    stroke: "#e879f9"
  },
  client: {
    text: "text-slate-300",
    ring: "border-slate-300/40",
    dot: "bg-slate-300",
    stroke: "#cbd5e1"
  }
};
const JOURNEY = [
  {
    year: "Aug 2022",
    title: "Started B.Tech Journey",
    desc: "Began B.Tech in Cloud Technology & Information Security at Ajeenkya DY Patil University."
  },
  {
    year: "Aug 2023",
    title: "Programming Foundations",
    desc: "Built programming fundamentals with C and Java while strengthening problem-solving skills."
  },
  {
    year: "Jan 2024",
    title: "Cloud & Security",
    desc: "Started learning Cloud Computing, Linux, Networking, Python, and Information Security, building a strong technical foundation."
  },
  {
    year: "Aug 2024",
    title: "AWS & Cloud Architecture",
    desc: "Explored AWS fundamentals, cloud architecture, virtualization, networking, and security through coursework and hands-on labs."
  },
  {
    year: "Apr 2025",
    title: "Infrastructure Automation",
    desc: "Began automating deployments and managing cloud infrastructure using Docker, Linux, and DevOps tools."
  },
  {
    year: "Jun 2025",
    title: "Real-World Projects",
    desc: "Built the Telemedicine Platform as a final-year group project while developing an internship-level cloud and DevOps project independently and learning Kubernetes."
  },
  {
    year: "Jan 2026",
    title: "Internship & CI/CD",
    desc: "Worked on Jenkins, Power BI, CI/CD pipelines, and enhanced cloud and DevOps projects during my internship."
  },
  {
    year: "Apr 2026",
    title: "AWS Certified",
    desc: "Earned the AWS Certified Cloud Practitioner (CLF-C02), validating foundational knowledge of AWS Cloud services, architecture, security, and best practices."
  },
  {
    year: "Present",
    title: "Growing as a Cloud Engineer",
    desc: "Continuing to build expertise in AWS, Kubernetes, DevOps, Linux, Networking, and Security through hands-on projects and continuous learning."
  }
];
const CARDS = [
  // ── Certifications ──────────────────────────────────────
  {
    category: ["Certifications", "Badges"],
    icon: /* @__PURE__ */ jsx(Award, { className: "h-5 w-5 text-yellow-400" }),
    title: "AWS Certified Cloud Practitioner",
    subtitle: "Amazon Web Services · CLF-C02",
    description: "Foundational AWS certification validating cloud concepts, architecture, pricing, security, and core AWS services.",
    tech: ["AWS", "Cloud Concepts", "IAM", "EC2", "S3", "Pricing & Support"],
    buttons: [
      {
        label: "Credly Badge",
        href: "https://www.credly.com/badges/30a486c6-e52b-4250-a616-bc685ccf9f9c"
      }
    ]
  },
  {
    category: ["Certifications"],
    icon: /* @__PURE__ */ jsx(Award, { className: "h-5 w-5 text-rose-400" }),
    title: "AutoCAD 3D Professional Certification",
    subtitle: "3D Modelling & Design",
    description: "Certification validating proficiency in 3D modelling, design workflows, and AutoCAD tools.",
    tech: ["AutoCAD", "3D Modelling"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing"
      }
    ]
  },
  {
    category: ["Certifications"],
    icon: /* @__PURE__ */ jsx(Cloud, { className: "h-5 w-5 text-blue-300" }),
    title: "AWS Certificate: Udemy",
    subtitle: "AWS Fundamentals",
    description: "Hands-on coursework covering core AWS services, deployment patterns, and cloud architecture fundamentals.",
    tech: ["AWS", "Cloud Computing"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing"
      }
    ]
  },
  {
    category: ["Certifications", "Badges"],
    icon: /* @__PURE__ */ jsx(Terminal, { className: "h-5 w-5 text-blue-400" }),
    title: "The Linux Foundation: LFD-103",
    subtitle: "A Beginner's Guide to Linux Kernel Development",
    description: "Foundational course covering Linux kernel architecture, development workflow, and contribution basics.",
    tech: ["Linux", "Kernel", "Open Source"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing"
      },
      {
        label: "Credly Badge",
        href: "https://www.credly.com/badges/5f324690-36b9-4b1b-9b6f-4d1e1a97dc5c/public_url"
      }
    ]
  },
  {
    category: ["Certifications"],
    icon: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-blue-400" }),
    title: "Saylor Academy: Information Security",
    subtitle: "Information Security Fundamentals",
    description: "Coursework covering core information security principles, threat models, and security best practices.",
    tech: ["Information Security", "Risk Management"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing"
      }
    ]
  },
  {
    category: ["Certifications"],
    icon: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-cyan-400" }),
    title: "Saylor Academy: Computer Networks",
    subtitle: "Networking Fundamentals",
    description: "Coursework covering networking concepts including protocols, topologies, and network architecture.",
    tech: ["Networking", "TCP/IP"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing"
      }
    ]
  },
  {
    category: ["Certifications"],
    icon: /* @__PURE__ */ jsx(Code2, { className: "h-5 w-5 text-purple-400" }),
    title: "Saylor Academy: Computer Architecture",
    subtitle: "Computer Architecture Fundamentals",
    description: "Coursework covering core computer architecture concepts including processor design and system organization.",
    tech: ["Computer Architecture", "Systems"],
    buttons: [
      {
        label: "Certificate",
        href: "https://drive.google.com/drive/folders/1j7UBUMgmKiIIVevSTeGcag9fqXZlOhZJ?usp=sharing"
      }
    ]
  },
  // ── Projects ────────────────────────────────────────────
  {
    category: ["Projects"],
    icon: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-green-400" }),
    title: "DevSecOps Flask Platform",
    subtitle: "Secure CI/CD Application",
    description: "Flask application with integrated DevSecOps practices - containerised with Docker, scanned with Trivy & SonarQube, and deployed via GitHub Actions.",
    tech: ["Python", "Flask", "Docker", "GitHub Actions", "Trivy", "SonarQube"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/devsecops-flask" }]
  },
  {
    category: ["Projects"],
    icon: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5 text-blue-400" }),
    title: "Resilient Server Monitoring Platform",
    subtitle: "Infrastructure Monitoring",
    description: "Monitoring platform that tracks server health, CPU/memory metrics, and system availability with alerting for reliable infra management.",
    tech: ["Linux", "Python", "Bash", "Networking", "Nginx"],
    buttons: [
      {
        label: "GitHub",
        href: "https://github.com/shelkeaditya/Resilient-Server-Monitoring-Platform"
      }
    ]
  },
  {
    category: ["Projects"],
    icon: /* @__PURE__ */ jsx(Workflow, { className: "h-5 w-5 text-blue-400" }),
    title: "CI/CD Platform",
    subtitle: "Automation Pipeline",
    description: "End-to-end automated build, test, and deployment pipeline that streamlines software delivery and infrastructure provisioning.",
    tech: ["GitHub Actions", "Docker", "Jenkins", "Linux", "Shell Scripting"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/CICD-Platform" }]
  },
  {
    category: ["Projects"],
    icon: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-cyan-400" }),
    title: "AI-Based Backup Management",
    subtitle: "Intelligent Backup Automation",
    description: "Backup management solution using Python automation for scheduling, recovery planning, and efficient data protection workflows.",
    tech: ["Python", "Linux", "Bash", "Cron", "Automation"],
    buttons: [
      { label: "GitHub", href: "https://github.com/shelkeaditya/Ai-based-backup-management" }
    ]
  },
  {
    category: ["Projects"],
    icon: /* @__PURE__ */ jsx(Cloud, { className: "h-5 w-5 text-sky-400" }),
    title: "Nextcloud on Linux",
    subtitle: "Self-Hosted Private Cloud",
    description: "Deployed and configured Nextcloud on a Linux server for secure self-hosted file sharing, storage, and team collaboration.",
    tech: ["Linux", "Nextcloud", "Docker", "Nginx", "Networking"],
    buttons: [{ label: "GitHub", href: "https://github.com/shelkeaditya/Nextcloud-on-Linux" }]
  },
  // ── Publications ─────────────────────────────────────────
  {
    category: ["Publications"],
    icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-indigo-400" }),
    title: "Connect2Cure: A Telemedine Platform",
    subtitle: "Published on IRJET",
    description: "Co-authored and published a peer-reviewed research paper in IRJET, an established engineering and technology journal.",
    tech: ["Research", "Academic Writing"],
    buttons: [
      {
        label: "Read Paper",
        href: "https://drive.google.com/drive/u/0/folders/1m2cEsQOWPS5yQ7gLjM2Bu_xERdB0nE7A"
      }
    ]
  }
];
function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
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
function SectionHeading({ title }) {
  const hasDot = title.endsWith(".");
  const base = hasDot ? title.slice(0, -1) : title;
  return /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-2xl md:text-4xl font-semibold tracking-tight text-foreground", children: [
      base,
      hasDot && /* @__PURE__ */ jsx("span", { className: "text-accent-violet", children: "." })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "heading-bar mt-3", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {})
    ] })
  ] });
}
function IconLink({
  href,
  icon: Icon,
  label
}) {
  return /* @__PURE__ */ jsx(
    "a",
    {
      href,
      target: href.startsWith("http") ? "_blank" : void 0,
      rel: "noreferrer",
      "aria-label": label,
      title: label,
      className: "group inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-foreground/5",
      children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-[#4F8CFF]" })
    }
  );
}
function IconButton({
  onClick,
  icon: Icon,
  label
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      "aria-label": label,
      title: label,
      className: "group inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-foreground/5",
      children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-[#4F8CFF]" })
    }
  );
}
function TechBadge({ label }) {
  return /* @__PURE__ */ jsx("span", { className: "surface-3 rounded-md border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground", children: label });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground", children: label }),
    children
  ] });
}
function VerticalSlide({ words }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(id);
  }, [words.length]);
  return /* @__PURE__ */ jsx("div", { className: "relative h-6 md:h-7 overflow-hidden", children: words.map((word, i) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute inset-0 flex items-center whitespace-nowrap transition-all duration-700 ease-in-out text-sm md:text-lg font-medium text-muted-foreground",
      style: {
        transform: i === index ? "translateY(0)" : i < index ? "translateY(-100%)" : "translateY(100%)",
        opacity: i === index ? 1 : 0
      },
      children: word
    },
    word
  )) });
}
function ProfileHero({ onJourney }) {
  const { theme, toggle } = useTheme();
  const [expanded, setExpanded] = useState(false);
  return /* @__PURE__ */ jsx("section", { className: "relative", children: /* @__PURE__ */ jsxs("div", { className: "surface-2 relative overflow-hidden rounded-2xl border border-border/60 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: toggle,
        className: "absolute top-3 right-3 z-20 md:hidden surface-3 rounded-xl border border-border/60 p-2",
        children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col px-6 py-5 md:flex-row md:items-stretch md:gap-0 md:px-8 md:py-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center md:flex-1 md:pr-8 md:border-r md:border-border/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "group relative shrink-0", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-0 rounded-xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100",
                style: {
                  background: "color-mix(in oklab, var(--accent-orange) 40%, transparent)"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: profileImg,
                alt: "Aditya Shelke",
                className: "relative h-20 w-20 md:h-24 md:w-24 rounded-xl object-cover ring-2 ring-[color:var(--accent-orange)]/70 transition-all duration-300 group-hover:ring-[color:var(--accent-orange)]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight", children: [
              "Aditya ",
              /* @__PURE__ */ jsx("span", { className: "font-light text-muted-foreground", children: "Shelke" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-0.5 h-6 md:h-5", children: /* @__PURE__ */ jsx(VerticalSlide, { words: ["DevOps Engineer", "Cloud Architect"] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setExpanded((e) => !e),
            "aria-label": expanded ? "Collapse details" : "Expand details",
            "aria-expanded": expanded,
            className: "md:hidden mt-4 flex w-full items-center gap-3",
            children: [
              /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "h-px flex-1 bg-border/60" }),
              /* @__PURE__ */ jsx("span", { className: "absolute right-0 flex h-7 w-12 items-center justify-center rounded-lg bg-[var(--surface-2,inherit)] text-muted-foreground", children: /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  className: cn(
                    "h-4 w-4 transition-transform duration-10",
                    expanded && "rotate-180"
                  )
                }
              ) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "overflow-hidden transition-all duration-10 ease-in-out md:contents",
            expanded ? "max-h-[400px] opacity-100 mt-3 md:mt-0" : "max-h-0 opacity-0 md:opacity-100"
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "md:w-[32%] md:px-19 md:pt-7 md:border-r md:border-border/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "md:hidden space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[13px]", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/60" }),
                    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-emerald-400 font-medium", children: [
                      /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-1.5 w-1.5", children: [
                        /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" }),
                        /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" })
                      ] }),
                      "Open to Work"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/60", children: "Location :" }),
                    /* @__PURE__ */ jsx("span", { className: "text-foreground/70", children: "Pune, India" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "block h-px bg-border/60" }),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: "mailto:work.shelkeaditya@gmail.com",
                    className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground/60" }),
                      "work.shelkeaditya@gmail.com"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden transition-all hover:-translate-y-0.5", children: [
                    /* @__PURE__ */ jsxs(
                      "a",
                      {
                        href: "https://drive.google.com/drive/folders/1c0qffoq846ABrArQxjx9GtoB2ROcjkhy",
                        target: "_blank",
                        rel: "noreferrer",
                        className: "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors",
                        children: [
                          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
                          "CV"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "w-px bg-[color:var(--accent-blue)]/30" }),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "/Aditya Shelke CV.pdf",
                        download: true,
                        "aria-label": "Download CV",
                        className: "flex items-center pl-3 pr-3 py-2 text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors",
                        children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
                      }
                    )
                  ] }) }),
                  /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.3", children: [
                    /* @__PURE__ */ jsx(
                      IconLink,
                      {
                        href: "https://linkedin.com/in/shelkeaditya",
                        icon: Linkedin,
                        label: "LinkedIn"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      IconLink,
                      {
                        href: "https://github.com/shelkeaditya",
                        icon: Github,
                        label: "GitHub"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      IconLink,
                      {
                        href: "https://instagram.com/shelke__aditya",
                        icon: Instagram,
                        label: "Instagram"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      IconLink,
                      {
                        href: "https://x.com/shelke__aditya",
                        icon: TwitterIcon,
                        label: "Twitter"
                      }
                    ),
                    /* @__PURE__ */ jsx(IconButton, { onClick: onJourney, icon: Flag, label: "Journey" })
                  ] }) })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs("div", { className: "gap-1 font-mono text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-[72px] shrink-0 text-[11px] text-muted-foreground/50", children: "Job Status :" }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-emerald-400 font-medium text-[13px]", children: [
                    /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-1.5 w-1.5", children: [
                      /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" }),
                      /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" })
                    ] }),
                    "Available"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-[72px] shrink-0 text-[11px] text-muted-foreground/50", children: "Time Zone :" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[13px] text-foreground/70", children: "GMT+5:30" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-[72px] shrink-0 text-[11px] text-muted-foreground/50", children: "Location :" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[13px] text-foreground/70", children: "Pune, India" })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-col gap-3 pt-0 md:flex-1 md:pl-8 md:items-end", children: [
              /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "h-px w-full bg-border/60 md:hidden" }),
              /* @__PURE__ */ jsxs("div", { className: "inline-flex w-fit items-stretch rounded-full border border-[color:var(--accent-blue)]/50 bg-transparent overflow-hidden transition-all hover:-translate-y-0.5", children: [
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: "https://drive.google.com/drive/folders/1c0qffoq846ABrArQxjx9GtoB2ROcjkhy",
                    target: "_blank",
                    rel: "noreferrer",
                    className: "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors",
                    children: [
                      /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
                      "View CV"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-px bg-[color:var(--accent-blue)]/30" }),
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "/Aditya Shelke CV.pdf",
                    download: true,
                    "aria-label": "Download CV",
                    className: "flex items-center pl-3 pr-3 py-2 text-accent-blue hover:bg-[color:var(--accent-blue)] hover:!text-foreground transition-colors",
                    children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "mailto:work.shelkeaditya@gmail.com",
                  className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground/60" }),
                    "work.shelkeaditya@gmail.com"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.3", children: [
                /* @__PURE__ */ jsx(
                  IconLink,
                  {
                    href: "https://linkedin.com/in/shelkeaditya",
                    icon: Linkedin,
                    label: "LinkedIn"
                  }
                ),
                /* @__PURE__ */ jsx(IconLink, { href: "https://github.com/shelkeaditya", icon: Github, label: "GitHub" }),
                /* @__PURE__ */ jsx(
                  IconLink,
                  {
                    href: "https://instagram.com/shelke__aditya",
                    icon: Instagram,
                    label: "Instagram"
                  }
                ),
                /* @__PURE__ */ jsx(IconLink, { href: "https://x.com/shelke__aditya", icon: TwitterIcon, label: "Twitter" }),
                /* @__PURE__ */ jsx(IconButton, { onClick: onJourney, icon: Flag, label: "Journey" })
              ] })
            ] })
          ]
        }
      )
    ] })
  ] }) });
}
function NavPanel({
  active,
  setActive,
  theme,
  toggleTheme
}) {
  return /* @__PURE__ */ jsxs("aside", { className: "surface-1 sticky top-7 h-fit rounded-3xl border border-border/60 p-5 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]", children: [
    /* @__PURE__ */ jsx("nav", { className: "flex flex-col gap-1.5", children: NAV.map(({ key, label, icon: Icon }) => {
      const isActive = active === key;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActive(key),
          className: cn(
            "group relative flex items-center gap-2 rounded-2xl px-4 py-3.5 transition-all duration-300 ease-out",
            isActive ? "bg-violet-500/10 text-violet-500 border-l-2 border-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.25)]" : "text-muted-foreground hover:bg-foreground/8 hover:translate-x-1"
          ),
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  isActive ? "bg-violet-500/15 text-violet-300" : "bg-transparent text-muted-foreground group-hover:bg-foreground/5"
                ),
                children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: label }),
            isActive && /* @__PURE__ */ jsx("span", { className: "h-5 w-1 rounded-full bg-violet-500", "aria-hidden": true })
          ]
        },
        key
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "my-3 h-px bg-border/60" }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: toggleTheme,
        "aria-label": "Toggle theme",
        className: "surface-3 group flex w-full items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-foreground",
        children: [
          /* @__PURE__ */ jsxs("span", { className: "relative flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5", children: [
            /* @__PURE__ */ jsx(
              Sun,
              {
                className: cn(
                  "h-4 w-4 absolute transition-all duration-500",
                  theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Moon,
              {
                className: cn(
                  "h-4 w-4 absolute transition-all duration-500",
                  theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: theme === "dark" ? "Dark Mode" : "Light Mode" })
        ]
      }
    )
  ] });
}
function About() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionHeading, { title: "About Me." }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl space-y-5 text-[15px] leading-relaxed text-muted-foreground", children: [
      /* @__PURE__ */ jsx("p", { children: "I'm currently working as a Cloud & DevOps Engineering Intern while building cloud-native applications and infrastructure-focused projects in my free time. I enjoy applying what I learn to real-world projects and continuously expanding my knowledge of modern cloud technologies." }),
      /* @__PURE__ */ jsx("p", { children: "My work revolves around designing cloud infrastructure, automating deployment pipelines, and building scalable systems. I enjoy working with Kubernetes, Docker, CI/CD, Infrastructure as Code, and cloud platforms to create reliable and secure solutions." }),
      /* @__PURE__ */ jsx("p", { children: "What excites me most is building the systems behind modern applications. Whether it's provisioning infrastructure, automating deployments, or orchestrating containers, I enjoy solving the engineering challenges that make software reliable, scalable, and secure." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
      { icon: Cloud, label: "Cloud", value: "AWS • GCP • Azure" },
      { icon: Container, label: "DevOps", value: "Docker • Kubernetes • CI/CD" },
      { icon: Lock, label: "Security", value: "Linux • Networking • VAPT" }
    ].map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-blue)]/25",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-accent-blue" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: label })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: value })
        ]
      },
      label
    )) })
  ] });
}
function ResumeBlock({
  title,
  icon,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: title })
    ] }),
    children
  ] });
}
function ResumeItem({
  heading,
  college,
  year,
  location,
  description,
  points
}) {
  return /* @__PURE__ */ jsx("div", { className: "surface-2 rounded-xl border border-border/60 p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-lg font-semibold text-foreground sm:text-xl", children: heading }),
    college && /* @__PURE__ */ jsx("div", { className: "text-base font-medium text-blue-400", children: college }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground", children: [
      location && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: location }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/50", children: "·" })
      ] }),
      /* @__PURE__ */ jsx("span", { children: year })
    ] }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted-foreground", children: description }),
    points && points.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1.5", children: points.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-blue" }),
      p
    ] }, p)) })
  ] }) });
}
function SkillCard({
  icon: Icon,
  title,
  items
}) {
  return /* @__PURE__ */ jsxs("div", { className: "surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-blue)]/25", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-accent-blue" }),
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground", children: title })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: items.map((i) => /* @__PURE__ */ jsx(
      "span",
      {
        className: "surface-3 rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground",
        children: i
      },
      i
    )) })
  ] });
}
function Resume() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionHeading, { title: "Resume." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
      /* @__PURE__ */ jsxs(
        ResumeBlock,
        {
          title: "Experience",
          accent: "blue",
          icon: /* @__PURE__ */ jsx(Briefcase, { className: "h-5 w-5 text-blue-400" }),
          children: [
            /* @__PURE__ */ jsx(
              ResumeItem,
              {
                heading: "Cloud & DevSecOps Intern",
                college: "E-Sutra Technologies",
                year: "Jun 2026 – Present",
                location: "Remote",
                description: "Working on real-world DevOps and cloud tasks including CI/CD pipeline management, infrastructure automation, and security practices in an Agile team environment.",
                points: [
                  "Participating in sprint rituals - planning, stand-ups, retrospectives",
                  "Managing Git branching workflows and PR reviews",
                  "Working with Jira for task tracking and project management",
                  "Applying DevSecOps practices with SonarQube and security scanning"
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
              ResumeItem,
              {
                heading: "Cloud Labs & Projects",
                year: "Mar 2023 – Aug 2025",
                location: "",
                description: "Built and managed personal cloud and DevOps projects involving AWS services, Linux administration, containerisation, CI/CD workflows, and infrastructure automation.",
                points: [
                  "Deployed AWS EC2, S3, IAM, VPC, ELB, EKS, ECR, CloudWatch configurations",
                  "Built CI/CD pipelines using GitHub Actions and Jenkins",
                  "Practised Terraform for infrastructure-as-code",
                  "Managed Linux servers - Debian, Ubuntu, Kali",
                  "Containerised applications with Docker and orchestrated with Kubernetes"
                ]
              }
            ) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        ResumeBlock,
        {
          title: "Education",
          accent: "blue",
          icon: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5 text-violet-400" }),
          children: /* @__PURE__ */ jsx(
            ResumeItem,
            {
              heading: "B.Tech - Cloud Technology & Information Security",
              college: "Ajeenkya DY Patil University",
              year: "Aug 2022 – May 2026",
              location: "Pune, India"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        ResumeBlock,
        {
          title: "Skills",
          accent: "purple",
          icon: /* @__PURE__ */ jsx(Award, { className: "h-5 w-5 text-purple-400" }),
          children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsx(SkillCard, { icon: Cloud, title: "Cloud", items: ["AWS", "GCP", "Azure"] }),
            /* @__PURE__ */ jsx(
              SkillCard,
              {
                icon: Container,
                title: "DevOps",
                items: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "CI/CD"]
              }
            ),
            /* @__PURE__ */ jsx(
              SkillCard,
              {
                icon: Terminal,
                title: "Linux",
                items: ["Bash", "Linux CLI", "SSH", "Ubuntu", "Debian", "Kali"]
              }
            ),
            /* @__PURE__ */ jsx(
              SkillCard,
              {
                icon: ShieldCheck,
                title: "Security",
                items: ["Trivy", "SonarQube", "Vault", "Networking", "VAPT"]
              }
            ),
            /* @__PURE__ */ jsx(
              SkillCard,
              {
                icon: Code2,
                title: "Tools",
                items: ["Git", "VS Code", "Postman", "Nginx", "Apache", "Cloudflare"]
              }
            ),
            /* @__PURE__ */ jsx(
              SkillCard,
              {
                icon: Code2,
                title: "Languages",
                items: ["Python", "Bash / Shell", "Java", "JavaScript"]
              }
            )
          ] })
        }
      )
    ] })
  ] });
}
function PortfolioSection() {
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(
    () => filter === "All" ? CARDS : CARDS.filter((c) => c.category.includes(filter)),
    [filter]
  );
  const filters = [
    "All",
    "Projects",
    "Certifications",
    "Badges",
    "Publications"
  ];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionHeading, { title: "Portfolio." }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 flex flex-wrap gap-2", children: filters.map((f) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setFilter(f),
        className: cn(
          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
          filter === f ? "border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 text-accent-violet" : "surface-2 border-border/60 text-muted-foreground hover:text-foreground"
        ),
        children: f
      },
      f
    )) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: filtered.map((c) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "surface-2 group flex flex-col rounded-xl border border-border/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent-blue)]/40 hover:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.7)]",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "text-3xl shrink-0", children: c.icon }),
              /* @__PURE__ */ jsx("h4", { className: "text-base font-semibold text-foreground", children: c.title })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "surface-3 max-w-[110px] shrink-0 rounded-md border border-border/60 px-2 py-0.5 text-right text-[10px] uppercase leading-tight tracking-wider text-muted-foreground", children: c.category.join(" / ") })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: c.subtitle }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: c.description }),
          c.tech.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: c.tech.map((t) => /* @__PURE__ */ jsx(TechBadge, { label: t }, t)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-auto pt-5 flex flex-wrap gap-2", children: c.buttons.map((b, i) => /* @__PURE__ */ jsxs(
            "a",
            {
              href: b.href,
              target: b.href.startsWith("http") ? "_blank" : void 0,
              rel: "noreferrer",
              className: cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                i === 0 ? "border-[color:var(--accent-blue)]/50 bg-[color:var(--accent-blue)]/10 text-accent-blue hover:bg-[color:var(--accent-blue)]/15" : "surface-3 border-border/60 text-foreground hover:border-border"
              ),
              children: [
                b.label,
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
              ]
            },
            b.label
          )) })
        ]
      },
      c.title
    )) })
  ] });
}
const INFRA_CANVAS_W = 1515;
const INFRA_CANVAS_H = 589;
function infraNodeHalfDims(node) {
  return node.size === "lg" ? { hw: 105, hh: 34 } : { hw: 75, hh: 34 };
}
function infraTrimToBox(cx, cy, hw, hh, dx, dy, gap) {
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (adx < 1e-4 && ady < 1e-4) return { x: cx, y: cy };
  const scale = Math.min(adx > 0 ? hw / adx : Infinity, ady > 0 ? hh / ady : Infinity);
  const bx = cx + dx * scale;
  const by = cy + dy * scale;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x: bx + ux * gap, y: by + uy * gap };
}
const INFRA_EDGE_GAP = 12;
const INFRA_SUMMARY_CARDS = [
  { title: "Edge Stack", category: "runtime", items: ["Cloudflare Workers", "Cloudflare DNS", "Edge Runtime", "HTTPS/TLS", "Custom Domain"] },
  { title: "Monitoring", category: "observability", items: ["Workers Logs", "Workers Traces", "Runtime Monitoring"] },
  { title: "Build Pipeline", category: "build", items: ["Development", "GitHub", "Git Push", "Webhook", "Automatic Deployment"] },
  { title: "Communication", category: "communication", items: ["EmailJS", "Gmail Delivery"] }
];
function InfraBuild() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, startScrollLeft: 0 });
  const nodeMap = useMemo(
    () => Object.fromEntries(INFRA_NODES.map((n) => [n.id, n])),
    []
  );
  const activeIds = useMemo(() => {
    if (!hovered) return null;
    const ids = /* @__PURE__ */ new Set([hovered]);
    INFRA_EDGES.forEach((e) => {
      if (e.from === hovered) ids.add(e.to);
      if (e.to === hovered) ids.add(e.from);
    });
    return ids;
  }, [hovered]);
  const selectedNode = selected ? nodeMap[selected] : null;
  const handleNodeHover = (id) => {
    setHovered(id);
    setSelected(id);
  };
  const handleCanvasMouseDown = (e) => {
    if (!scrollRef.current) return;
    dragState.current.isDown = true;
    dragState.current.startX = e.pageX;
    dragState.current.startScrollLeft = scrollRef.current.scrollLeft;
    setIsDragging(true);
    e.preventDefault();
  };
  useEffect(() => {
    const onMove = (e) => {
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
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsx(SectionHeading, { title: "Infrastructure." }),
    /* @__PURE__ */ jsxs("div", { className: "-mt-4 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2 shrink-0", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" }),
        /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-400" })
      ] }),
      /* @__PURE__ */ jsx("span", { children: "Develop. Debug. Deploy." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "surface-2 min-w-0 flex-1 rounded-2xl border border-border/60 p-3 md:p-4 lg:w-[72%] lg:flex-none", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: scrollRef,
            className: cn(
              "infra-scroll select-none overflow-x-auto overflow-y-hidden rounded-xl",
              isDragging && "infra-dragging"
            ),
            style: { WebkitOverflowScrolling: "touch" },
            onMouseDown: handleCanvasMouseDown,
            onDragStart: (e) => e.preventDefault(),
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative select-none",
                style: {
                  width: INFRA_CANVAS_W,
                  height: INFRA_CANVAS_H,
                  backgroundImage: "linear-gradient(to right, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)",
                  backgroundSize: "28px 28px"
                },
                onMouseLeave: () => setHovered(null),
                children: [
                  INFRA_GROUPS.map((g) => {
                    const style = INFRA_CATEGORY_STYLE[g.category];
                    return /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: cn("absolute rounded-2xl border-2 border-dashed", style.ring),
                        style: { left: g.x, top: g.y, width: g.w, height: g.h, zIndex: 1 },
                        children: /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cn(
                              "surface-2 absolute -top-3 left-4 rounded px-2 text-[10px] font-semibold uppercase tracking-[0.14em]",
                              style.text
                            ),
                            children: g.title
                          }
                        )
                      },
                      g.id
                    );
                  }),
                  /* @__PURE__ */ jsxs(
                    "svg",
                    {
                      viewBox: `0 0 ${INFRA_CANVAS_W} ${INFRA_CANVAS_H}`,
                      className: "absolute inset-0 h-full w-full overflow-visible",
                      style: { zIndex: 2 },
                      children: [
                        /* @__PURE__ */ jsx("defs", { children: Object.keys(INFRA_CATEGORY_STYLE).map((cat) => /* @__PURE__ */ jsx(
                          "marker",
                          {
                            id: `infra-arrow-${cat}`,
                            viewBox: "0 0 10 10",
                            refX: "8",
                            refY: "5",
                            markerWidth: "7",
                            markerHeight: "7",
                            orient: "auto-start-reverse",
                            children: /* @__PURE__ */ jsx("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: INFRA_CATEGORY_STYLE[cat].stroke })
                          },
                          cat
                        )) }),
                        INFRA_EDGES.map((edge, i) => {
                          const from = nodeMap[edge.from];
                          const to = nodeMap[edge.to];
                          const isActive = !hovered || activeIds?.has(edge.from) && activeIds?.has(edge.to);
                          const dash = edge.style === "dashed" ? "7 6" : edge.style === "dotted" ? "2 7" : edge.style === "vertical" ? "10 4 2 4" : void 0;
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
                            edge.bidirectional ? INFRA_EDGE_GAP : 0
                          );
                          const end = infraTrimToBox(
                            to.x,
                            to.y,
                            toDims.hw,
                            toDims.hh,
                            -dx,
                            -dy,
                            INFRA_EDGE_GAP
                          );
                          return /* @__PURE__ */ jsx(
                            "path",
                            {
                              d: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
                              fill: "none",
                              stroke: color,
                              strokeWidth: edge.style === "vertical" ? 1.6 : 1.8,
                              strokeDasharray: dash,
                              strokeLinecap: "round",
                              markerEnd: `url(#infra-arrow-${edge.category})`,
                              markerStart: edge.bidirectional ? `url(#infra-arrow-${edge.category})` : void 0,
                              className: cn("transition-opacity duration-200", isLive && "infra-edge-live"),
                              style: { opacity: isActive ? 0.9 : 0.12 }
                            },
                            i
                          );
                        })
                      ]
                    }
                  ),
                  INFRA_EDGES.map((edge, i) => {
                    if (!edge.label) return null;
                    const from = nodeMap[edge.from];
                    const to = nodeMap[edge.to];
                    const isActive = !hovered || activeIds?.has(edge.from) && activeIds?.has(edge.to);
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
                      edge.bidirectional ? INFRA_EDGE_GAP : 0
                    );
                    const end = infraTrimToBox(to.x, to.y, toDims.hw, toDims.hh, -dx, -dy, INFRA_EDGE_GAP);
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    return /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "surface-1 absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-border/50 px-1.5 py-0.5 text-[9px] text-muted-foreground transition-opacity duration-200 md:text-[10px]",
                        style: { left: midX, top: midY, opacity: isActive ? 1 : 0.15, zIndex: 3 },
                        children: edge.label
                      },
                      i
                    );
                  }),
                  INFRA_NODES.map((node) => {
                    const Icon = node.icon;
                    const style = INFRA_CATEGORY_STYLE[node.category];
                    const isActive = !hovered || activeIds?.has(node.id);
                    const isHovered = hovered === node.id;
                    const isSelected = selected === node.id;
                    const isLg = node.size === "lg";
                    return /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200",
                        style: {
                          left: node.x,
                          top: node.y,
                          opacity: isActive ? 1 : 0.25,
                          zIndex: isHovered || isSelected ? 30 : 10
                        },
                        onMouseEnter: () => handleNodeHover(node.id),
                        onMouseDown: (e) => e.stopPropagation(),
                        children: /* @__PURE__ */ jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => setSelected(node.id),
                            className: cn(
                              "surface-1 flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)] transition-all hover:-translate-y-0.5",
                              isLg ? "w-[190px] sm:w-[210px]" : "w-[132px] sm:w-[150px]",
                              style.ring
                            ),
                            style: {
                              boxShadow: isSelected ? `0 0 0 2px ${style.stroke}, 0 0 22px 2px ${style.stroke}55` : isHovered ? `0 0 0 3px ${style.stroke}30` : `0 0 12px -4px ${style.stroke}40`
                            },
                            children: [
                              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                                /* @__PURE__ */ jsx(Icon, { className: cn("h-3.5 w-3.5 shrink-0", style.text) }),
                                /* @__PURE__ */ jsx("span", { className: "truncate text-xs font-semibold text-foreground", children: node.title })
                              ] }),
                              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: node.subtitle }),
                              /* @__PURE__ */ jsx("span", { className: "truncate text-[9px] text-muted-foreground/60", children: node.meta })
                            ]
                          }
                        )
                      },
                      node.id
                    );
                  })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Category" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-orange-400" }),
                " Build"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-emerald-400" }),
                " Runtime"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-violet-400" }),
                " Observability"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-blue-400" }),
                " Application"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-fuchsia-400" }),
                " Communication"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-slate-300" }),
                " Client"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Edge Style" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-[2px] w-5 shrink-0 bg-emerald-400" }),
                " Solid — Runtime Request"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "h-0 w-5 shrink-0 border-t-2",
                    style: { borderColor: "#fb923c", borderStyle: "dashed" }
                  }
                ),
                "Dashed — Deployment"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "h-0 w-5 shrink-0 border-t-2",
                    style: { borderColor: "#34d399", borderStyle: "dotted" }
                  }
                ),
                "Dotted — Configuration"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-4 w-[2px] shrink-0 bg-fuchsia-400" }),
                " Vertical — External Service"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "infra-edge-live h-[2px] w-5 shrink-0 bg-emerald-400" }),
                " Animated — Live Request"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Dataflow Direction" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx("p", { children: "Left → Right — main pipeline" }),
              /* @__PURE__ */ jsx("p", { children: "Vertical — external service branch" }),
              /* @__PURE__ */ jsx("p", { children: "Hover — highlight connected nodes" }),
              /* @__PURE__ */ jsx("p", { children: "Hover — open inspector" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "surface-2 flex flex-col rounded-2xl border border-border/60 p-5 lg:w-[28%]", children: /* @__PURE__ */ jsx("div", { className: "infra-inspector-anim flex flex-1 flex-col", children: !selectedNode ? /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center", children: [
        /* @__PURE__ */ jsx(Workflow, { className: "h-6 w-6 text-muted-foreground/40" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Hover any node to inspect its purpose, responsibilities, technologies and configuration." })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            selectedNode.icon,
            {
              className: cn("h-4 w-4 shrink-0", INFRA_CATEGORY_STYLE[selectedNode.category].text)
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: selectedNode.title }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground/60", children: selectedNode.subtitle })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-muted-foreground", children: selectedNode.detail.purpose }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Technologies" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedNode.detail.technologies.map((t) => /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                INFRA_CATEGORY_STYLE[selectedNode.category].ring,
                INFRA_CATEGORY_STYLE[selectedNode.category].text
              ),
              children: t
            },
            t
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Responsibilities" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-xs text-muted-foreground", children: selectedNode.detail.responsibilities.map((r) => /* @__PURE__ */ jsxs("li", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/40", children: "•" }),
            " ",
            r
          ] }, r)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Relationships" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-xs text-muted-foreground", children: selectedNode.detail.relationships.map((r) => /* @__PURE__ */ jsxs("li", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/40", children: "•" }),
            " ",
            r
          ] }, r)) })
        ] }),
        (selectedNode.detail.buildProcess || selectedNode.detail.runtimeDetails) && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Workflow" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs text-muted-foreground", children: [
            selectedNode.detail.buildProcess && /* @__PURE__ */ jsx("p", { children: selectedNode.detail.buildProcess }),
            selectedNode.detail.runtimeDetails && /* @__PURE__ */ jsx("p", { children: selectedNode.detail.runtimeDetails })
          ] })
        ] }),
        selectedNode.detail.configuration && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Configuration" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: selectedNode.detail.configuration })
        ] }),
        selectedNode.detail.futureImprovements && /* @__PURE__ */ jsxs("div", { className: "border-t border-border/60 pt-3", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50", children: "Future Improvements" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: selectedNode.detail.futureImprovements })
        ] })
      ] }) }, selectedNode ? selectedNode.id : "empty") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4", children: INFRA_SUMMARY_CARDS.map((card) => {
      const style = INFRA_CATEGORY_STYLE[card.category];
      return /* @__PURE__ */ jsxs("div", { className: "surface-2 rounded-xl border border-border/60 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: cn("h-2 w-2 shrink-0 rounded-full", style.dot) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: card.title })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-[11px] text-muted-foreground", children: card.items.map((it) => /* @__PURE__ */ jsxs("li", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: cn("h-1 w-1 shrink-0 translate-y-1 rounded-full", style.dot) }),
          it
        ] }, it)) })
      ] }, card.title);
    }) })
  ] });
}
const AUTOFILL_FIX = "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_var(--surface-3)_inset] [&:-webkit-autofill:hover]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill:hover]:shadow-[0_0_0px_1000px_var(--surface-3)_inset] [&:-webkit-autofill:focus]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill:focus]:shadow-[0_0_0px_1000px_var(--surface-3)_inset] [&:-webkit-autofill:active]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill:active]:shadow-[0_0_0px_1000px_var(--surface-3)_inset]";
function Contact() {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(
      (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      })
    );
    update();
    const id = setInterval(update, 1e3);
    return () => clearInterval(id);
  }, []);
  function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    emailjs.sendForm(
      "service_fdq7bwf",
      "template_jpawssn",
      e.target,
      "X7cczgqlSFWmadFLE"
    ).then(() => {
      setSending(false);
      const next = msgCount + 1;
      setMsgCount(next);
      if (next >= 2) {
        setCooldown(true);
        setTimeout(() => {
          setCooldown(false);
          setMsgCount(0);
        }, 6e4);
        toast.warning("Message sent! Please wait 60 seconds before sending again.");
      } else {
        toast.success("Message sent! I'll get back to you shortly.");
      }
    }).catch(() => {
      setSending(false);
      toast.error("Something went wrong. Please try again.");
    });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionHeading, { title: "Let's Connect." }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mb-6 text-justify", children: "Whether it's a job opportunity, a project or just a tech conversation - I'd love to hear from you." }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-start", children: [
      /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit,
          className: "surface-2 flex-1 grid gap-4 rounded-2xl border border-border/60 p-6",
          children: [
            /* @__PURE__ */ jsx(Field, { label: "Name", children: /* @__PURE__ */ jsx(
              Input,
              {
                required: true,
                name: "name",
                placeholder: "Your name",
                className: cn("surface-3 h-10 w-full", AUTOFILL_FIX)
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Email", children: /* @__PURE__ */ jsx(
              Input,
              {
                required: true,
                type: "email",
                name: "email",
                placeholder: "you@example.com",
                className: cn("surface-3 h-10 w-full", AUTOFILL_FIX)
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Message", children: /* @__PURE__ */ jsx(
              Textarea,
              {
                required: true,
                name: "message",
                placeholder: "What's on your mind?",
                rows: 2,
                className: cn("surface-3 w-full resize-none overflow-hidden", AUTOFILL_FIX),
                onInput: (e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }
              }
            ) }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: sending || cooldown, className: "gap-2", children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              sending ? "Sending…" : cooldown ? "Please wait…" : "Send Message"
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-full md:w-72 shrink-0 space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "surface-2 rounded-xl border border-border/60 p-5 space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60", children: "Get In Touch" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "mailto:work.shelkeaditya@gmail.com",
              className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors",
              children: "work.shelkeaditya@gmail.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: "Pune, Maharashtra" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50 mb-3", children: "Find me on" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.3", children: [
            /* @__PURE__ */ jsx(
              IconLink,
              {
                href: "https://linkedin.com/in/shelkeaditya",
                icon: Linkedin,
                label: "LinkedIn"
              }
            ),
            /* @__PURE__ */ jsx(IconLink, { href: "https://x.com/shelke__aditya", icon: TwitterIcon, label: "Twitter" }),
            /* @__PURE__ */ jsx(
              IconLink,
              {
                href: "https://instagram.com/shelke__aditya",
                icon: Instagram,
                label: "Instagram"
              }
            ),
            /* @__PURE__ */ jsx(IconLink, { href: "https://github.com/shelkeaditya", icon: Github, label: "GitHub" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 text-xs text-muted-foreground/60 pt-4 border-t border-border/60 ", children: [
          /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: "Usually responds within 24 hours" })
        ] })
      ] }) })
    ] })
  ] });
}
function Journey() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionHeading, { title: "Journey." }),
    /* @__PURE__ */ jsx("ol", { className: "relative ml-3 border-l border-border/70 pl-6", children: JOURNEY.map((j, i) => /* @__PURE__ */ jsxs("li", { className: "group relative pb-7 last:pb-0", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: "absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border border-border/80 bg-card shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-blue)_18%,transparent)]",
          children: /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-accent-blue transition-all group-hover:scale-150" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "surface-2 rounded-xl border border-border/60 p-4 transition-colors hover:border-[color:var(--accent-blue)]/25", children: [
        /* @__PURE__ */ jsx("span", { className: "rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground", children: j.year }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-base font-medium text-foreground", children: j.title }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: j.desc })
      ] })
    ] }, i)) })
  ] });
}
function SectionRenderer({ active }) {
  const map = {
    about: /* @__PURE__ */ jsx(About, {}),
    resume: /* @__PURE__ */ jsx(Resume, {}),
    portfolio: /* @__PURE__ */ jsx(PortfolioSection, {}),
    infra: /* @__PURE__ */ jsx(InfraBuild, {}),
    contact: /* @__PURE__ */ jsx(Contact, {}),
    journey: /* @__PURE__ */ jsx(Journey, {})
  };
  return /* @__PURE__ */ jsx("div", { className: "animate-in fade-in-50 slide-in-from-bottom-2 duration-500", children: map[active] }, active);
}
function Portfolio() {
  const [active, setActive] = useState("about");
  const { theme, toggle } = useTheme();
  return /* @__PURE__ */ jsxs("div", { className: "ambient-bg relative min-h-screen text-foreground", children: [
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 grid-texture opacity-40" }),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx("div", { className: "poly-bg-left", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 420 420", xmlns: "http://www.w3.org/2000/svg", children: [
      /* @__PURE__ */ jsx("polygon", { points: "0,0 165,0 0,165", fill: "#7C3AED", opacity: "0.80" }),
      /* @__PURE__ */ jsx("polygon", { points: "165,0 215,0 0,215 0,165", fill: "#BE123C", opacity: "0.65" }),
      /* @__PURE__ */ jsx("polygon", { points: "215,0 260,0 0,260 0,215", fill: "#7C3AED", opacity: "0.32" }),
      /* @__PURE__ */ jsx("polygon", { points: "260,0 300,0 0,300 0,260", fill: "#BE123C", opacity: "0.16" }),
      /* @__PURE__ */ jsx("polygon", { points: "300,0 335,0 0,335 0,300", fill: "#7C3AED", opacity: "0.08" }),
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsxs("linearGradient", { id: "fxL", x1: "0", y1: "0", x2: "1", y2: "0", children: [
          /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "var(--background)", stopOpacity: "0" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--background)", stopOpacity: "1" })
        ] }),
        /* @__PURE__ */ jsxs("linearGradient", { id: "fyL", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "var(--background)", stopOpacity: "0" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--background)", stopOpacity: "1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("rect", { width: "420", height: "420", fill: "url(#fxL)" }),
      /* @__PURE__ */ jsx("rect", { width: "420", height: "420", fill: "url(#fyL)" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "poly-bg-right", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 420 420", xmlns: "http://www.w3.org/2000/svg", children: [
      /* @__PURE__ */ jsx("polygon", { points: "420,420 255,420 420,255", fill: "#7C3AED", opacity: "0.70" }),
      /* @__PURE__ */ jsx("polygon", { points: "255,420 205,420 420,205 420,255", fill: "#5B21B6", opacity: "0.55" }),
      /* @__PURE__ */ jsx("polygon", { points: "205,420 162,420 420,162 420,205", fill: "#7C3AED", opacity: "0.28" }),
      /* @__PURE__ */ jsx("polygon", { points: "162,420 124,420 420,124 420,162", fill: "#5B21B6", opacity: "0.14" }),
      /* @__PURE__ */ jsx("polygon", { points: "124,420 90,420  420,90  420,124", fill: "#7C3AED", opacity: "0.07" }),
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsxs("linearGradient", { id: "fxR", x1: "1", y1: "0", x2: "0", y2: "0", children: [
          /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "var(--background)", stopOpacity: "0" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--background)", stopOpacity: "1" })
        ] }),
        /* @__PURE__ */ jsxs("linearGradient", { id: "fyR", x1: "0", y1: "1", x2: "0", y2: "0", children: [
          /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "var(--background)", stopOpacity: "0" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--background)", stopOpacity: "1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("rect", { width: "420", height: "420", fill: "url(#fxR)" }),
      /* @__PURE__ */ jsx("rect", { width: "420", height: "420", fill: "url(#fyR)" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12", children: [
      /* @__PURE__ */ jsx(ProfileHero, { onJourney: () => setActive("journey") }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_200px]", children: [
        /* @__PURE__ */ jsx("main", { className: "surface-1 min-h-[420px] rounded-2xl border border-border/60 p-6 md:p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.7)] mb-24 md:mb-0", children: /* @__PURE__ */ jsx(SectionRenderer, { active }) }),
        /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(NavPanel, { active, setActive, theme, toggleTheme: toggle }) })
      ] }),
      /* @__PURE__ */ jsx("footer", { className: "mt-12 pt-4 pb-2 text-center text-xs text-muted-foreground hidden md:block", children: "© 2026 Aditya Rajendra Shelke" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-1/2 -translate-x-1/2 z-50 md:hidden", children: /* @__PURE__ */ jsx("div", { className: "surface-1 flex items-center gap-0 rounded-2xl border border-border/60 px-2 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]", children: NAV.map(({ key, label, icon: Icon }) => {
      const isActive = active === key;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActive(key),
          className: cn(
            "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
            isActive ? "bg-violet-500/15 text-violet-400" : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
          ),
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium uppercase tracking-wider", children: label })
          ]
        },
        key
      );
    }) }) })
  ] });
}
const SplitComponent = Portfolio;
export {
  SplitComponent as component
};
