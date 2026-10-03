import { createFileRoute, notFound } from "@tanstack/react-router";
import Portfolio, { sectionFromSlug } from "../components/portfolio/Portfolio";
import { SITE_URL } from "@/lib/site";

const PAGE_TITLE: Record<string, string> = {
  about: "About",
  resume: "Resume",
  portfolio: "Portfolio",
  build: "Build",
  contact: "Contact",
  journey: "Journey",
};

// One route serves /about, /resume, /portfolio, /build, /contact and
// /journey. Because they share this route, moving between sections
// doesn't remount the page (theme, scroll and animations stay intact).
export const Route = createFileRoute("/$section")({
  // Anything that isn't a known section (/foo, /favicon.ico …) is a 404.
  beforeLoad: ({ params }) => {
    if (!sectionFromSlug(params.section)) throw notFound();
  },
  head: ({ params }) => {
    const title = `${PAGE_TITLE[params.section] ?? "Portfolio"} | Aditya Shelke - Cloud and DevOps Engineer`;
    const url = `${SITE_URL}/${params.section}`;
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
  return <Portfolio section={sectionFromSlug(section) ?? "about"} />;
}