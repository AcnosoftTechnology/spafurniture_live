<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor agent performance (this repo)

Keep agent turns fast by scoping work narrowly.

### How to ask

- **One feature per message** — e.g. header menu active color only, not blog + header + product in one go.
- **Name target files** when you know them, e.g. `src/components/site/layout/esth-header.tsx` and the menu block in `src/styles/esth-site.css`.
- **Prefer existing styles** — say “match `esth-site.css`” instead of fetching the live reference site unless layout truly depends on it.
- **New chat after large batches** — blog, header, product detail, etc. in separate threads keeps context small.

### Agent vs Plan mode

- **Agent mode** — small UI fixes, bug fixes, and changes you have already approved visually.
- **Plan mode** — multi-file features, refactors, or when you need to review approach before code runs.

### What agents should avoid unless asked

- Full-repo `tsc --noEmit` or wide repo greps for a single CSS/component tweak.
- Re-scraping reference URLs when local CSS/components already define the pattern.

### Site header menu (quick reference)

- Component: `src/components/site/layout/esth-header.tsx`
- Styles: `.slide-menu`, `.menu-inner`, `.esth-nav-item` in `src/styles/esth-site.css`

### Local dev slowness (not agent speed)

If `localhost:3000` is slow or Turbopack shows cache/SST errors, run `npm run dev:stop`, delete `.next` if needed, then `npm run dev` once. If you see “Another next dev server is already running”, use `npm run dev:stop` instead of starting a second server. If Prisma `EPERM` on Windows, close Node processes and run `npx prisma generate`.
