# Database: local → production server

Your app uses **PostgreSQL** + **Prisma**. Moving to a new server involves two separate steps:

| Step | What it does | Tool |
|------|----------------|------|
| **1. Schema** | Creates empty tables, enums, indexes | `prisma migrate deploy` |
| **2. Data** | Copies rows (products, blog, settings, users, …) | `pg_dump` / `pg_restore` **or** seed + import |

`npm run db:push` only syncs schema on one machine; it does **not** copy data and is not ideal for production. Use **migrations** on the server instead.

---

## One-time: enable migrations on your PC (already has tables)

If you already ran `db:push` locally and tables exist:

```powershell
cd e:\xampp\htdocs\spafur
npx prisma generate
npx prisma migrate resolve --applied 20250604000000_init
```

This marks the initial migration as applied **without** re-creating tables. New schema changes later: `npm run db:migrate` (creates a new migration file), commit it, then on server `npm run db:migrate:deploy`.

---

## Production server (empty database)

### 1. Create PostgreSQL database

On the server (or Neon / Supabase), create an empty database, e.g. `spafurniture`.

### 2. Set `.env` on the server

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/spafurniture?schema=public"
AUTH_SECRET="long-random-secret-32-chars-minimum"
NEXT_PUBLIC_SITE_URL="https://www.spafurniture.in"
```

### 3. Deploy code and install

```bash
npm ci
npx prisma generate
npm run db:migrate:deploy
```

This runs all SQL files in `prisma/migrations/` and creates **all tables** (still empty).

### 4. Copy data from local (recommended)

**On your local PC** (PowerShell, with PostgreSQL `bin` in PATH):

```powershell
cd e:\xampp\htdocs\spafur
.\scripts\db-backup.ps1
```

This creates `backups/spafurniture-YYYYMMDD-HHMMSS.dump`.

Copy that `.dump` file to the server (SFTP, scp, etc.).

**On the server** (after migrations ran):

```bash
# Linux example — adjust paths and DATABASE_URL
pg_restore -d "$DATABASE_URL" --clean --if-exists --no-owner backups/your-backup.dump
```

Or use the Windows script if the server is Windows:

```powershell
.\scripts\db-restore.ps1 -DumpFile ".\backups\spafurniture-....dump"
```

> **Note:** `pg_restore --clean` drops existing objects before restore. Run it only on the **empty** production DB right after `migrate deploy`, or you may get conflicts.

### 5. Build and start the app

```bash
npm run build
npm run start
```

Change the default admin password in production.

---

## Alternative: no dump (schema only + re-import)

If you only need structure on production and can re-import content:

```bash
npm run db:migrate:deploy
npm run db:seed
```

Then in **Admin → Import** (or CLI):

```bash
npm run import:spadata
```

Uploads/images under `public/uploads` must be copied separately (rsync / FTP).

---

## Day-to-day schema changes

1. Edit `prisma/schema.prisma` locally.
2. `npm run db:migrate` — enter a migration name when prompted.
3. Commit `prisma/migrations/` to git.
4. On server after `git pull`:

```bash
npm run db:migrate:deploy
npm run build
# restart app
```

Never use `db:push` on production if you use migrations.

---

## Commands reference

| Command | When |
|---------|------|
| `npm run db:migrate` | Local dev: create new migration after schema change |
| `npm run db:migrate:deploy` | **Production**: apply pending migrations |
| `npm run db:migrate:status` | Check which migrations ran |
| `npm run db:push` | Quick local prototype only (no migration history) |
| `npm run db:seed` | Default admin + sample settings (not full WP data) |
| `.\scripts\db-backup.ps1` | Full DB backup |
| `.\scripts\db-restore.ps1` | Restore backup into `DATABASE_URL` |

---

## Cloud PostgreSQL (Neon / Supabase)

- Use the provider’s connection string in `DATABASE_URL` (often `?sslmode=require`).
- Backup: provider dashboard export, or `pg_dump` with SSL from your PC.
- Restore: `pg_restore` or provider import UI.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Server DB empty after deploy | Run `db:migrate:deploy`, then restore dump or seed + import |
| `migrate deploy` says already applied | DB was created with `db:push`; run `migrate resolve --applied <name>` once or use fresh DB |
| Local `migrate dev` wants to reset | You may need `migrate resolve` baseline (see top) |
| Permission denied on restore | Use `--no-owner` (included in scripts) |
| Prisma client out of date | `npx prisma generate` after pull |
