import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import Portfolio, { sectionFromSlug } from "../components/portfolio/Portfolio";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE: Record<string, string> = {
  resume: "Resume",
  portfolio: "Portfolio",
  build: "Build",
  contact: "Contact",
  journey: "Journey",
};

const PAGE_DESC: Record<string, string> = {
  resume:
    "Resume of Aditya Shelke, Cloud & DevOps Engineer: CI/CD, Docker, Linux, AWS and server security. B.Tech in Cloud Technology & Information Security.",
  portfolio:
    "Projects, certifications and publications by Aditya Shelke: DevSecOps, CI/CD, server monitoring and self-hosted cloud. AWS Certified Cloud Practitioner.",
  build:
    "How this portfolio is built and deployed: TanStack Start on Cloudflare Workers with R2 storage, GitHub deployments and observability.",
  contact:
    "Get in touch with Aditya Shelke, a Cloud & DevOps Engineer based in Pune, India, about jobs, projects or tech conversations.",
  journey:
    "Aditya Shelke's journey from learning web basics to working as a Cloud & DevOps Engineer.",
};

export const Route = createFileRoute("/{-$section}")({
  beforeLoad: ({ params }) => {
    const slug = params.section;
    if (!slug) return;
    if (slug === "about") throw redirect({ to: "/", replace: true });
    if (!sectionFromSlug(slug)) throw notFound();
  },
  head: ({ params }) => {
    const slug = params.section;
    if (!slug) {
      return {
        meta: [{ property: "og:url", content: SITE_URL }],
        links: [{ rel: "canonical", href: SITE_URL }],
      };
    }
    const title = `${PAGE_TITLE[slug] ?? "Portfolio"} | Aditya Shelke - Cloud and DevOps Engineer`;
    const url = `${SITE_URL}/${slug}`;
    return {
      meta: [
        { title },
        ...(PAGE_DESC[slug]
          ? [
              { name: "description", content: PAGE_DESC[slug] },
              { property: "og:description", content: PAGE_DESC[slug] },
            ]
          : []),
        { property: "og:title", content: title },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  return <Portfolio section={(section && sectionFromSlug(section)) || "about"} />;
}
