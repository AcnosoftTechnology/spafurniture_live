# Esthetica Spa Furniture Platform

Enterprise Next.js catalogue and CMS for [spafurniture.in](https://www.spafurniture.in) — enquiry-based products (no ecommerce), blog, SEO, and admin panel.

## Stack

- **Next.js 16** (App Router, RSC, ISR)
- **PostgreSQL** + **Prisma ORM**
- **Auth.js** (credentials, JWT sessions)
- **Tailwind CSS** + shadcn-style UI
- **Framer Motion**, **TipTap**, **Sharp**

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local install, or free cloud DB — **Docker not required**)

> **Windows / XAMPP without Docker?** See [docs/SETUP-WINDOWS-NO-DOCKER.md](docs/SETUP-WINDOWS-NO-DOCKER.md).

### Setup

```bash
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET

npm install
npx prisma generate
npm run db:migrate:deploy
npm run db:seed

npm run dev
```

- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login  
  - Email: `admin@spafurniture.local`  
  - Password: `Admin@123456`

### Docker (optional)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/). If `docker` is not recognized, use PostgreSQL locally or [Neon](https://neon.tech) instead — see [docs/SETUP-WINDOWS-NO-DOCKER.md](docs/SETUP-WINDOWS-NO-DOCKER.md).

```bash
cd docker
docker compose up -d db
# Run migrations inside app container:
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

## Project structure

```
src/app/(site)/          Public marketing site
src/app/(admin-panel)/   Authenticated admin (sidebar)
src/app/(admin-auth)/    Login, forgot/reset password
src/app/api/v1/          REST API (public + admin)
prisma/schema.prisma     Full CMS data model
```

## Features

| Module | Description |
|--------|-------------|
| Products | Enquiry-only catalogue with gallery, features, SEO, related products |
| Categories | Landing pages with tabs, sections, media gallery |
| Blog | Posts, categories, tags, scheduling |
| Blog import | WordPress CSV import with column mapping and dry-run |
| Inquiries | Contact/product forms with rate limiting and admin inbox |
| Media | Upload, WebP conversion, library picker |
| SEO | Metadata, JSON-LD, sitemap, robots, dynamic OG images |
| Auth | RBAC, login activity, password reset |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create migration (local, after schema change) |
| `npm run db:migrate:deploy` | Apply migrations on server (creates tables) |
| `npm run db:push` | Quick local sync only (no migration history) |
| `npm run db:seed` | Seed admin user and sample content |
| `npm run db:studio` | Prisma Studio |

**Moving local DB to production:** see [docs/DATABASE-DEPLOY.md](docs/DATABASE-DEPLOY.md).

## Environment

See [.env.example](.env.example).

## Security notes

- Change `AUTH_SECRET` and default admin password before production.
- Configure SMTP for password reset emails.
- Serve uploads from CDN in production.
- Enable HTTPS and update `NEXT_PUBLIC_SITE_URL`.

## License

Private — Esthetica / Spa Furniture.
