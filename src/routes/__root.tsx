import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SITE_URL } from "@/lib/site";
import { MaintenancePage } from "@/components/MaintenancePage";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  // Logged only; nothing about the error is shown to visitors.
  console.error(error);
  return <MaintenancePage />;
}


// HTML that crawlers read, rather than injected after hydration.
// Runs before first paint so the saved/system theme is applied to <html>
// immediately - no light flash before hydration. Keep the logic in sync with
// getInitialTheme() in components/portfolio/Portfolio.tsx.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||t==="light"?t==="dark":!window.matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){document.documentElement.classList.add("dark")}})()`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap";

  // schema.org Person data. Emitted from head() so it's in the server-rendered
const PERSON_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Aditya Shelke",
  jobTitle: "Cloud & DevOps Engineer",
  url: SITE_URL,
  image: `${SITE_URL}/r2/images/profile.jpeg`,
  email: "mailto:shelkeaditya@proton.me",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pune",
    addressCountry: "IN",
  },
  sameAs: [
    "https://linkedin.com/in/shelkeaditya",
    "https://github.com/shelkeaditya",
    "https://x.com/shelke__aditya",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Ajeenkya DY Patil University",
  },
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aditya Shelke | Cloud and DevOps Engineer" },
      {
        name: "description",
        content:
          "Aditya Shelke - AWS Certified Cloud Practitioner. Cloud, DevOps, Linux and Cybersecurity portfolio.",
      },
      { name: "author", content: "Aditya Shelke" },
      { name: "google-site-verification", content: "DsYjGqptbiT3Cjm33ngQBFdqQKl86nwyuzUqnPGrl2o" },
      { property: "og:title", content: "Aditya Shelke | Cloud and DevOps Engineer" },
      { property: "og:description", content: "Cloud, DevOps, Linux and Cybersecurity portfolio." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}/r2/images/profile.jpeg` },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@shelkeaditya" },
    ],
    scripts: [
      { children: THEME_INIT_SCRIPT },
      { type: "application/ld+json", children: PERSON_JSON_LD },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTS_HREF },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/r2/images/Favicon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
