# ProdScreen — Project Rules

This is a real product going to production deployment for a real client. It is not a demo, prototype, or portfolio piece. Treat every shortcut as something that will be caught and will cost trust.

## Absolute rules — no exceptions
1. NEVER use mock data, hardcoded sample arrays, fake API responses, or placeholder data — not even "temporarily to preview the UI." If something isn't wired to the real database or real API yet, leave the UI showing a real, honest empty state instead.
2. NEVER fabricate a successful result. If a feature doesn't work, say so directly. Do not describe incomplete work as complete.
3. NEVER use setTimeout/fake delays to simulate a real network call.
4. NEVER leave silent TODOs or stub functions in anything presented as "done."
5. Every read and write goes through real MongoDB. No in-memory arrays standing in for persistence.
6. The Groq API key lives ONLY in the server's environment variables (GROQ_API_KEY). It is NEVER sent to, stored in, or accessible from the frontend in any form — no env var prefixed VITE_, no inline script, nothing in the browser's network tab should ever reveal it. The frontend calls OUR backend; our backend calls Groq.
7. After implementing anything, demonstrate it actually works against real data before calling it finished — show real terminal output, real database query results, or a real working UI flow. "I implemented X" is not sufficient; show X working.
8. If a requirement is ambiguous, ask before guessing.
9. At the end of every phase, stop and produce the exact verification evidence requested in that phase's GATE section. Do not proceed to additional features until told to.

## Stack (fixed — do not substitute)
- Backend: Node.js, Express, MongoDB via Mongoose
- Frontend: React (Vite), React Router, recharts, axios
- Auth: JWT (httpOnly cookie, not localStorage — set this up correctly from the start)
- AI provider: Groq API (NOT OpenAI, NOT Claude/Anthropic, NOT Gemini) — use the Groq Node SDK or a plain fetch to Groq's OpenAI-compatible endpoint
- Validation: express-validator
- Security middleware: helmet, cors, rate limiting
- Logging: pino

## Visual design (non-negotiable — this must look like serious enterprise software a Fortune 500 manufacturer would buy, NOT an AI-generated dashboard template)
Before writing any frontend code in ANY phase, re-read this section. After finishing any frontend code in ANY phase, re-check your own output against this list before saying the phase is done — this is not optional and not just a Phase-0 concern.

- NO gradients (no `linear-gradient`/`radial-gradient` anywhere, including "subtle" ones), NO glassmorphism/backdrop-blur, NO glow/neon/shadow-as-accent effects, NO fully rounded "pill" buttons (max 6px radius), NO heavy drop shadows on cards (a 1px border only, or at most a barely-visible 1-2px shadow), NO emoji as icons, NO illustration-style/mascot empty states, NO large centered hero sections, NO decorative animation, NO "glassy" translucent panels
- Dark navy (#1B2A4A) sidebar, off-white (#F4F5F7) canvas, white (#FFFFFF) surfaces, muted teal accent (#2C6E8C) — these are the ONLY brand colors. Don't introduce purple/violet gradients or bright blue-to-pink accents, which is the single most common tell of an AI-template look.
- Status colors are desaturated/muted, not bright SaaS colors: red #A23B3B, amber #C77D26, green #3B7A57. Never use pure/saturated red, green, or orange anywhere.
- UI font: Inter, weights 400/500/600 only, sentence case everywhere (no Title Case headers, no ALL CAPS except small 11px uppercase labels). ALL numeric/tabular data (targets, actuals, gaps, timestamps, IDs): IBM Plex Mono, not Inter.
- Border radius 4-6px max, everywhere, no exceptions, including buttons, inputs, cards, badges, modals.
- Zero-value/on-target states get NO color treatment (stay neutral gray text) — only real deviations get colored. If everything is colored, nothing stands out to someone scanning a table for 8 hours — this is a functional requirement, not just aesthetic.
- The AI-generated insights panel must NOT look different/special/"AI-flavored" — no sparkle icons, no gradient borders, no chat-bubble styling, no robot/AI mascot iconography. It's a data panel like any other, with a small neutral "AI-generated" text tag in the header, same visual weight as any other metadata tag, nothing more.
- Reference point: imagine this software was built by SAP, Honeywell, or Siemens for a manufacturing client, not a startup's marketing landing page. Dense, quiet, information-forward. The personality of this product is "trustworthy instrument," not "exciting app."
- /docs/*.html (the 3 mockup files provided) are the literal visual target — match their spacing, colors, type, and density. If you're about to write CSS that doesn't resemble those files, stop and re-read them first.
