import { renderToStaticMarkup } from "react-dom/server";
import { MaintenancePage } from "@/components/MaintenancePage";

// Last-resort markup if rendering the React component itself fails.
const PLAIN_FALLBACK = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Maintenance | Aditya Shelke</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#8fc1ea;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px"><main><p style="letter-spacing:.18em;font-size:12px">SCHEDULED MAINTENANCE</p><h1>A little work in the cloud.</h1><p>The systems are taking a short pause while I make some improvements. Stay tuned — I'll be back online soon.</p></main></body></html>`;

/** Full HTML document for the shared page, used outside the React/TanStack render path. */
export function renderMaintenanceHtml(): string {
  try {
    const body = renderToStaticMarkup(<MaintenancePage />);
    return (
      `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<meta name="robots" content="noindex">` +
      `<title>Maintenance | Aditya Shelke</title><link rel="icon" type="image/png" href="/r2/images/Favicon.png">` +
      `<style>html,body{margin:0}</style></head><body>${body}` +
      `</body></html>`
    );
  } catch (error) {
    console.error("Failed to render maintenance page", error);
    return PLAIN_FALLBACK;
  }
}