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
