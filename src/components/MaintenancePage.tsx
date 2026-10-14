// Shared maintenance / error page.
//
// Used by:
//   - src/server.ts          (maintenance mode + server-level fallback, via renderMaintenanceHtml)
//   - src/routes/__root.tsx  (route-level errorComponent)
//
// Deliberately has NO hooks, router, query-client or Tailwind dependency, so it
// cannot throw while rendering an error (no error loops) and looks identical when
// rendered outside the React app. All styling is scoped under `.mp-*`.

export const MAINTENANCE_IMAGE_URL = "/r2/images/maintainance.png";

const CSS = `
.mp-root{
  --mp-fallback:#8fc1ea;
  --mp-bg-position:62% 50%;
  box-sizing:border-box;position:relative;display:flex;align-items:center;
  min-height:100vh;min-height:100dvh;padding:clamp(24px,6vw,96px);
  color:#fff;background-color:var(--mp-fallback);
  background-image:url("${MAINTENANCE_IMAGE_URL}");
  background-size:cover;background-position:var(--mp-bg-position);background-repeat:no-repeat;
  font-family:inherit,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
}
.mp-root::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(90deg,rgba(7,26,54,.62) 0%,rgba(7,26,54,.35) 40%,rgba(7,26,54,0) 70%);
}
.mp-content{position:relative;max-width:34rem;text-shadow:0 1px 18px rgba(7,26,54,.35)}
.mp-status{margin:0 0 1.25rem;font-size:.75rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;opacity:.92}
.mp-heading{margin:0;font-size:clamp(2.25rem,6vw,4rem);line-height:1.05;font-weight:600;letter-spacing:-.02em}
.mp-desc{margin:1.25rem 0 0;font-size:clamp(1rem,2vw,1.125rem);line-height:1.6;opacity:.95}
.mp-btn{
  margin-top:2rem;padding:.8rem 1.75rem;cursor:pointer;
  font:inherit;font-size:.8125rem;font-weight:600;letter-spacing:.16em;color:#fff;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.85);border-radius:999px;
  -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
  transition:background-color .2s,color .2s;
}
.mp-btn:hover{background:#fff;color:#0b2a52;text-shadow:none}
.mp-btn:focus-visible,.mp-link:focus-visible{outline:2px solid #fff;outline-offset:3px}
.mp-links{margin-top:2rem;display:flex;gap:1.25rem;font-size:.8125rem}
.mp-link{color:#fff;opacity:.85;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.5)}
.mp-link:hover{opacity:1}
@media (max-width:640px){
  .mp-root{align-items:flex-end;--mp-bg-position:68% 30%}
  .mp-root::before{background:linear-gradient(0deg,rgba(7,26,54,.78) 0%,rgba(7,26,54,.45) 45%,rgba(7,26,54,0) 75%)}
}
@media (prefers-reduced-motion:reduce){.mp-btn{transition:none}}
`;

export function MaintenancePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="mp-root">
        <div className="mp-content">
          <p className="mp-status">SYSTEM PAUSE · TEMPORARILY UNAVAILABLE</p>
          <h1 className="mp-heading">Taking a short break.</h1>
          <p className="mp-desc">
            I'm making a few improvements to my portfolio. Please check back soon.
          </p>
          <button
            type="button"
            className="mp-btn"
            data-mp-retry=""
            onClick={() => window.location.reload()}
          >
            TRY AGAIN
          </button>
          <nav className="mp-links" aria-label="Social links">
            <a className="mp-link" href="https://github.com/shelkeaditya" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a className="mp-link" href="https://linkedin.com/in/shelkeaditya" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </nav>
        </div>
      </main>
    </>
  );
}
