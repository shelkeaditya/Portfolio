import React, { useMemo, useState } from "react";

type ThemeMode = "dark" | "light";
type NodeKind = "client" | "dev" | "source" | "deploy" | "runtime" | "storage" | "contact" | "observability";

type ArchitectureNodeModel = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: NodeKind;
  items: string[];
  accent: string;
  border: string;
};

type ArchitectureEdgeModel = {
  from: string;
  to: string;
  label: string;
  color?: string;
  dashed?: boolean;
};

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 970;

const nodes: ArchitectureNodeModel[] = [
  {
    id: "browser",
    title: "Browser",
    subtitle: "Client runtime",
    section: "Production request flow",
    x: 60,
    y: 360,
    width: 250,
    height: 150,
    kind: "client",
    accent: "#57c7ff",
    border: "rgba(87, 199, 255, 0.5)",
    items: ["SSR HTML", "React hydration", "Client-side routing", "Dark / light theme"],
  },
  {
    id: "git",
    title: "Git + GitHub",
    subtitle: "Source control",
    section: "Development / source-control flow",
    x: 95,
    y: 80,
    width: 285,
    height: 150,
    kind: "source",
    accent: "#7c9cff",
    border: "rgba(124, 156, 255, 0.45)",
    items: ["Git repository", "main branch", "GitHub repo", "Source of truth"],
  },
  {
    id: "dev",
    title: "Local development",
    subtitle: "Bun + Vite + app stack",
    section: "Development / source-control flow",
    x: 440,
    y: 80,
    width: 355,
    height: 195,
    kind: "dev",
    accent: "#4dd5a1",
    border: "rgba(77, 213, 161, 0.45)",
    items: [
      "Bun",
      "Vite",
      "React",
      "TypeScript",
      "TanStack Start",
      "TanStack Router",
      "Tailwind CSS",
      "shadcn/ui + Radix UI",
    ],
  },
  {
    id: "deploy",
    title: "Production deployment",
    subtitle: "Cloudflare Workers Builds",
    section: "Deployment flow",
    x: 890,
    y: 80,
    width: 480,
    height: 185,
    kind: "deploy",
    accent: "#ffb454",
    border: "rgba(255, 180, 84, 0.42)",
    items: [
      "GitHub → main push",
      "bun run build",
      "wrangler deploy -c dist/server/wrangler.json",
      "Cloudflare Worker runtime",
    ],
  },
  {
    id: "runtime",
    title: "TanStack Start SSR",
    subtitle: "Cloudflare Workers runtime",
    section: "Production request flow",
    x: 390,
    y: 360,
    width: 360,
    height: 200,
    kind: "runtime",
    accent: "#8a7dff",
    border: "rgba(138, 125, 255, 0.45)",
    items: [
      "Server entry: src/server.ts",
      "Request routing",
      "SSR rendering",
      "Custom error middleware / branded 500",
    ],
  },
  {
    id: "r2",
    title: "Cloudflare R2 bucket",
    subtitle: "Binding: Assets → portfolio-assets",
    section: "R2 asset flow",
    x: 840,
    y: 360,
    width: 290,
    height: 190,
    kind: "storage",
    accent: "#4dd6ff",
    border: "rgba(77, 214, 255, 0.45)",
    items: [
      "Profile images",
      "Project images",
      "Certificates",
      "CV PDF",
      "Research papers",
    ],
  },
  {
    id: "contact",
    title: "Contact system",
    subtitle: "Turnstile + Worker-side verification",
    section: "Contact / email flow",
    x: 350,
    y: 650,
    width: 400,
    height: 220,
    kind: "contact",
    accent: "#ff7a8a",
    border: "rgba(255, 122, 138, 0.5)",
    items: [
      "Browser Turnstile widget",
      "POST /api/contact",
      "Cloudflare Turnstile verify",
      "EmailJS REST delivery",
    ],
  },
  {
    id: "emailjs",
    title: "EmailJS",
    subtitle: "Email delivery",
    section: "Contact / email flow",
    x: 840,
    y: 680,
    width: 260,
    height: 145,
    kind: "contact",
    accent: "#ffc55c",
    border: "rgba(255, 197, 92, 0.45)",
    items: ["service_fdq7bwf", "template_jpawssn", "Private key via Worker"],
  },
  {
    id: "obs",
    title: "Cloudflare Observability",
    subtitle: "Invocation logs + traces",
    section: "Observability flow",
    x: 1170,
    y: 360,
    width: 270,
    height: 180,
    kind: "observability",
    accent: "#8fe3ad",
    border: "rgba(143, 227, 173, 0.45)",
    items: ["Invocation logs enabled", "Trace enabled", "Runtime events", "Error capture"],
  },
];

const edges: ArchitectureEdgeModel[] = [
  { from: "git", to: "dev", label: "Source code", color: "#8ea8ff" },
  { from: "dev", to: "deploy", label: "Build artifacts", color: "#f7b567" },
  { from: "deploy", to: "runtime", label: "Deploys Worker", color: "#ffb454" },
  { from: "browser", to: "runtime", label: "HTTP request", color: "#57c7ff" },
  { from: "runtime", to: "browser", label: "SSR HTML", color: "#8a7dff" },
  { from: "runtime", to: "r2", label: "/r2/* asset fetch", color: "#4dd6ff" },
  { from: "runtime", to: "obs", label: "Logs & traces", color: "#8fe3ad" },
  { from: "browser", to: "contact", label: "Contact form", color: "#ff7a8a" },
  { from: "contact", to: "runtime", label: "Verify token", color: "#ff7a8a" },
  { from: "contact", to: "emailjs", label: "Send email", color: "#ffc55c" },
  { from: "runtime", to: "contact", label: "/api/contact route", color: "#ff7a8a" },
  { from: "r2", to: "obs", label: "Asset access events", color: "#8fe3ad", dashed: true },
];

function getNodeById(id: string) {
  return nodes.find((node) => node.id === id)!;
}

function ArchitectureLegend() {
  const entries = [
    { name: "Development", color: "#7c9cff" },
    { name: "Deploy", color: "#ffb454" },
    { name: "Runtime", color: "#8a7dff" },
    { name: "Storage", color: "#4dd6ff" },
    { name: "Contact", color: "#ff7a8a" },
    { name: "Observability", color: "#8fe3ad" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
      }}
    >
      {entries.map((entry) => (
        <div
          key={entry.name}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background: "rgba(15, 23, 42, 0.35)",
            color: "#e2e8f0",
            fontSize: 12,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: entry.color,
              boxShadow: `0 0 16px ${entry.color}`,
              display: "inline-block",
            }}
          />
          {entry.name}
        </div>
      ))}
    </div>
  );
}

function ArchitectureControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  theme,
  onToggleTheme,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "flex-end",
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        onClick={onToggleTheme}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid rgba(148, 163, 184, 0.3)",
          background: "rgba(15, 23, 42, 0.38)",
          color: "#f8fafc",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {theme === "dark" ? "Light theme" : "Dark theme"}
      </button>
      <button type="button" onClick={onZoomOut} aria-label="Zoom out" style={controlButtonStyle}>
        −
      </button>
      <div
        style={{
          minWidth: 72,
          textAlign: "center",
          padding: "8px 10px",
          borderRadius: 12,
          border: "1px solid rgba(148, 163, 184, 0.3)",
          background: "rgba(15, 23, 42, 0.38)",
          color: "#f8fafc",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
      <button type="button" onClick={onZoomIn} aria-label="Zoom in" style={controlButtonStyle}>
        +
      </button>
      <button type="button" onClick={onReset} style={controlButtonStyle}>
        Reset
      </button>
    </div>
  );
}

const controlButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(15, 23, 42, 0.38)",
  color: "#f8fafc",
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 700,
};

function ArchitectureEdge({ edge }: { edge: ArchitectureEdgeModel }) {
  const from = getNodeById(edge.from);
  const to = getNodeById(edge.to);
  const x1 = from.x + from.width / 2;
  const y1 = from.y + from.height;
  const x2 = to.x + to.width / 2;
  const y2 = to.y;
  const cx1 = x1;
  const cy1 = y1 + 42;
  const cx2 = x2;
  const cy2 = y2 - 42;
  const path = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={edge.color ?? "#8ea8ff"}
        strokeWidth={edge.dashed ? 1.6 : 2}
        strokeDasharray={edge.dashed ? "8 10" : undefined}
        opacity={0.92}
      />
      <path
        d={`M ${x2 - 10} ${y2 - 10} L ${x2} ${y2} L ${x2 + 10} ${y2 - 10}`}
        fill="none"
        stroke={edge.color ?? "#8ea8ff"}
        strokeWidth={2}
      />
      <text
        x={(x1 + x2) / 2}
        y={Math.min(y1, y2) + 28}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize="12"
        fontWeight={600}
        letterSpacing="0.02em"
      >
        {edge.label}
      </text>
    </g>
  );
}

function ArchitectureNode({ node }: { node: ArchitectureNodeModel }) {
  return (
    <div
      key={node.id}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        borderRadius: 20,
        border: `1px solid ${node.border}`,
        background: "rgba(15, 23, 42, 0.64)",
        boxShadow: `0 18px 40px rgba(15, 23, 42, 0.35), inset 0 0 0 1px rgba(255,255,255,0.02)`,
        padding: "18px 18px 16px",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${node.accent}22, transparent 52%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: node.accent, fontWeight: 700 }}>
            {node.section}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#f8fafc", marginTop: 10 }}>{node.title}</div>
        </div>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: node.accent,
            boxShadow: `0 0 0 6px ${node.accent}22`,
            flexShrink: 0,
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 18,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {node.items.map((item) => (
          <span
            key={item}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.52)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#e2e8f0",
              fontSize: 11,
              lineHeight: 1.3,
              letterSpacing: "0.01em",
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {node.subtitle ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: 18,
            color: "#cbd5e1",
            fontSize: 12,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {node.subtitle}
        </div>
      ) : null}
    </div>
  );
}

function ArchitectureCanvas({ theme }: { theme: ThemeMode }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const effectiveTransform = useMemo(
    () => ({ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }),
    [pan.x, pan.y, zoom],
  );

  const onZoomIn = () => setZoom((current) => Math.min(1.4, Number((current + 0.1).toFixed(2))));
  const onZoomOut = () => setZoom((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))));
  const onReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const surface =
    theme === "dark"
      ? {
          background: "radial-gradient(circle at top left, rgba(96, 165, 250, 0.12), transparent 26%), #0b1020",
          text: "#e2e8f0",
          panel: "rgba(11, 16, 32, 0.82)",
          grid: "rgba(148, 163, 184, 0.09)",
        }
      : {
          background: "radial-gradient(circle at top left, rgba(96, 165, 250, 0.12), transparent 26%), #f7fafc",
          text: "#0f172a",
          panel: "rgba(255, 255, 255, 0.72)",
          grid: "rgba(15, 23, 42, 0.08)",
        };

  return (
    <div
      style={{
        background: surface.background,
        borderRadius: 24,
        border: "1px solid rgba(148, 163, 184, 0.22)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        overflow: "hidden",
        padding: 18,
      }}
    >
      <ArchitectureControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <div
        style={{
          position: "relative",
          height: CANVAS_HEIGHT,
          overflow: "auto",
          borderRadius: 18,
          border: "1px solid rgba(148, 163, 184, 0.16)",
          background: surface.panel,
        }}
      >
        <div
          style={{
            position: "relative",
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: effectiveTransform.transform,
            transformOrigin: "center center",
            transition: "transform 200ms ease",
          }}
        >
          <svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
            aria-label="Portfolio architecture diagram"
          >
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke={surface.grid} strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" opacity={0.9} />
            {edges.map((edge) => (
              <ArchitectureEdge key={`${edge.from}-${edge.to}`} edge={edge} />
            ))}
          </svg>

          {nodes.map((node) => (
            <ArchitectureNode key={node.id} node={node} />
          ))}
        </div>
      </div>
      <ArchitectureLegend />
    </div>
  );
}

export default function PortfolioArchitecture() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const effectiveTransform = useMemo(
    () => ({ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }),
    [pan.x, pan.y, zoom],
  );

  const surface =
    theme === "dark"
      ? {
          background: "#0b1020",
          foreground: "#e2e8f0",
          panel: "rgba(15, 23, 42, 0.78)",
          grid: "rgba(148, 163, 184, 0.08)",
          border: "rgba(148, 163, 184, 0.2)",
        }
      : {
          background: "#f8fafc",
          foreground: "#0f172a",
          panel: "rgba(255, 255, 255, 0.78)",
          grid: "rgba(15, 23, 42, 0.08)",
          border: "rgba(148, 163, 184, 0.2)",
        };

  const onZoomIn = () => setZoom((current) => Math.min(1.4, Number((current + 0.1).toFixed(2))));
  const onZoomOut = () => setZoom((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))));
  const onReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: surface.background,
        color: surface.foreground,
        padding: 24,
        fontFamily: "Inter, Segoe UI, sans-serif",
        transition: "background 200ms ease, color 200ms ease",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          borderRadius: 26,
          border: `1px solid ${surface.border}`,
          background: surface.panel,
          boxShadow: "0 32px 80px rgba(15, 23, 42, 0.18)",
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: theme === "dark" ? "#93c5fd" : "#2563eb",
                fontWeight: 800,
              }}
            >
              Portfolio architecture
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>
              Aditya Shelke portfolio platform
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} style={controlButtonStyle}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button type="button" onClick={onZoomOut} aria-label="Zoom out" style={controlButtonStyle}>
              −
            </button>
            <div style={{ ...controlButtonStyle, width: 84, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
              {Math.round(zoom * 100)}%
            </div>
            <button type="button" onClick={onZoomIn} aria-label="Zoom in" style={controlButtonStyle}>
              +
            </button>
            <button type="button" onClick={onReset} style={controlButtonStyle}>
              Reset
            </button>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            height: CANVAS_HEIGHT,
            borderRadius: 22,
            overflow: "auto",
            border: `1px solid ${surface.border}`,
            background: theme === "dark" ? "rgba(11, 16, 32, 0.76)" : "rgba(248, 250, 252, 0.75)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: effectiveTransform.transform,
              transformOrigin: "center center",
              transition: "transform 200ms ease",
            }}
          >
            <svg
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              style={{ position: "absolute", inset: 0, zIndex: 0 }}
              aria-label="Portfolio architecture diagram"
            >
              <defs>
                <pattern id="portfolio-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke={surface.grid} strokeWidth="1" />
                </pattern>
              </defs>
              <rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#portfolio-grid)" opacity={0.92} />
              {edges.map((edge) => (
                <ArchitectureEdge key={`${edge.from}-${edge.to}`} edge={edge} />
              ))}
            </svg>

            {nodes.map((node) => (
              <ArchitectureNode key={node.id} node={node} />
            ))}
          </div>
        </div>

        <ArchitectureLegend />
      </div>
    </div>
  );
}
