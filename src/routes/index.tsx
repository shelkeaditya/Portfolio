import { createFileRoute, redirect } from "@tanstack/react-router";

// "/" has no content of its own — send visitors to the About section.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$section", params: { section: "about" }, replace: true });
  },
});