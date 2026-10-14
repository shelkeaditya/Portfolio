import { renderToStaticMarkup } from "react-dom/server";
import { MaintenancePage } from "@/components/MaintenancePage";

// Last-resort markup if rendering the React component itself fails.
const PLAIN_FALLBACK = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Maintenance | Aditya Shelke</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#8fc1ea;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px"><main><p style="letter-spacing:.18em;font-size:12px">SYSTEM PAUSE · TEMPORARILY UNAVAILABLE</p><h1>Taking a short break.</h1><p>I'm making a few improvements to my portfolio. Please check back soon.</p><button onclick="location.reload()" style="padding:12px 28px;border-radius:999px;border:1px solid #fff;background:transparent;color:#fff;letter-spacing:.16em;cursor:pointer">TRY AGAIN</button></main></body></html>`;

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
      // Static markup has no React handlers; wire the button up directly.
      `<script>document.querySelector("[data-mp-retry]").addEventListener("click",function(){location.reload()})</script>` +
      `</body></html>`
    );
  } catch (error) {
    console.error("Failed to render maintenance page", error);
    return PLAIN_FALLBACK;
  }
}