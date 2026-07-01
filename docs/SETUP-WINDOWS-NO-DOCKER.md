# Setup on Windows (XAMPP) — Without Docker

This project uses **PostgreSQL**, not MySQL. XAMPP’s MySQL cannot be used without changing the stack.

Docker is optional. Use one of the options below.

---

## Option A — Free cloud PostgreSQL (fastest, no install)

1. Create a free database at **[Neon](https://neon.tech)** or **[Supabase](https://supabase.com)**.
2. Copy the **connection string** (starts with `postgresql://`).
3. Edit `e:\xampp\htdocs\spafurniture\.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

4. From the project folder in PowerShell:

```powershell
cd e:\xampp\htdocs\spafurniture
npm install
npx prisma db push
npm run db:seed
npm run dev
```

5. Open http://localhost:3000 and http://localhost:3000/admin/login  
   - Email: `admin@spafurniture.local`  
   - Password: `Admin@123456`

---

## Option B — PostgreSQL on Windows (local)

### 1. Install PostgreSQL

Download and run the installer:

https://www.postgresql.org/download/windows/

- Remember the **postgres user password** you set during install.
- Port: **5432** (default).
- Install **Stack Builder** optional components only if you want them.

Or via winget (may open a GUI — complete the wizard):

```powershell
winget install -e --id PostgreSQL.PostgreSQL.17
```

### 2. Add PostgreSQL to PATH (if `psql` is not found)

Typical path:

```
C:\Program Files\PostgreSQL\17\bin
```

Add that folder to **System Environment Variables → Path**, then open a **new** PowerShell window.

### 3. Create the database

```powershell
psql -U postgres -c "CREATE DATABASE spafurniture;"
```

Enter your postgres password when prompted.

### 4. Configure `.env`

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/spafurniture?schema=public"
```

Replace `YOUR_PASSWORD` with the password from step 1.

### 5. Initialize the app

```powershell
cd e:\xampp\htdocs\spafurniture
npx prisma db push
npm run db:seed
npm run dev
```

### 6. Start PostgreSQL (fix "Connection refused")

If `psql` says **Connection refused**, the server is **not running**. Often the Windows service was never registered.

**Option 1 — One-time start (current session):**

```powershell
cd e:\xampp\htdocs\spafurniture
.\scripts\start-postgresql.ps1
```

**Option 2 — Register as Windows service (recommended, run PowerShell as Administrator):**

```powershell
cd e:\xampp\htdocs\spafurniture
.\scripts\start-postgresql.ps1 -RegisterService
```

After that, PostgreSQL starts automatically on boot. You can also use **Services** (`services.msc`) → **postgresql-x64-17** → Start.

**Manual start:**

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\17\data"
```

### 7. Password is NOT `postgres` by default

Your `.env` uses `postgres:postgres` only as a placeholder. Use the password you chose when installing PostgreSQL 17.

```env
DATABASE_URL="postgresql://postgres:YOUR_REAL_PASSWORD@localhost:5432/spafurniture?schema=public"
```

If you forgot the password, reset it via pgAdmin or reinstall PostgreSQL.

---

## Option C — Install Docker Desktop (use original README)

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Restart the PC if required.
3. Then:

```powershell
cd e:\xampp\htdocs\spafurniture\docker
docker compose up -d db
```

---

## Verify database connection

```powershell
cd e:\xampp\htdocs\spafurniture
npx prisma db push
```

If this succeeds, the database is ready.

---

## Common errors

| Error | Fix |
|-------|-----|
| `'docker' is not recognized` | Docker not installed — use Option A or B |
| `Authentication failed` | Wrong password in `DATABASE_URL` |
| `Can't reach database server` | PostgreSQL service not running, or wrong host/port |
| XAMPP MySQL only | Install PostgreSQL or use Neon (Option A) |

---

## Running with XAMPP Apache (optional)

The Next.js app runs its **own** server (`npm run dev` on port 3000). You do not need Apache for development.

For production behind Apache, use a reverse proxy to `http://127.0.0.1:3000`.
