// contact-api.ts
//
// Server-side half of the contact form. Runs in your Cloudflare Worker.
//
//   1. Verifies the Turnstile token with Cloudflare (secret key stays here).
//   2. Sends the email through EmailJS's REST API using the *private* key,
//      so nothing an attacker could reuse ships in the browser bundle.
//
// Wire it into src/server.ts (before the request falls through to the app):
//
//   import { handleContact } from "./contact-api";
//   ...
//   if (url.pathname === "/api/contact") return handleContact(request, env);
//
// Secrets (never commit these):
//   wrangler secret put TURNSTILE_SECRET_KEY
//   wrangler secret put EMAILJS_PRIVATE_KEY
//
// EmailJS dashboard: Account → Security → enable
// "Allow EmailJS API for non-browser applications", then copy the
// private key from Account → General.

export interface ContactEnv {
  TURNSTILE_SECRET_KEY: string;
  EMAILJS_PRIVATE_KEY: string;
  EMAILJS_PUBLIC_KEY: string;
}

// Service/template ids are not secret. Keys come from the Worker environment.
const EMAILJS_SERVICE_ID = "service_fdq7bwf";
const EMAILJS_TEMPLATE_ID = "template_jpawssn";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

type Payload = { name?: unknown; email?: unknown; message?: unknown; token?: unknown };

const isText = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Only accept posts from this site's own pages.
  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) return json({ error: "Forbidden" }, 403);

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { name, email, message, token } = body;
  if (
    !isText(name, 100) ||
    !isText(email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isText(message, 5000) ||
    !isText(token, 2048)
  ) {
    return json({ error: "Invalid input" }, 400);
  }

  // 1) Turnstile verification
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get("CF-Connecting-IP") ?? "",
    }),
  });
  const verdict = (await verify.json()) as { success?: boolean };
  if (!verdict.success) return json({ error: "Verification failed" }, 403);

  // 2) Send the email server-side
  const send = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: { name, email, message },
    }),
  });
  if (!send.ok) return json({ error: "Email provider error" }, 502);

  return json({ ok: true });
}
