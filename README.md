# Gov Scheme Teller

A full-stack web application that helps Indian citizens discover government schemes they are eligible for, based on their personal profile (age, gender, income, state, category, etc.).

---

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)        |
| Language   | JavaScript (React 19)                     |
| Styling    | Tailwind CSS 4                            |
| Auth       | NextAuth v5 (JWT + Credentials provider)  |
| Database   | PostgreSQL (via Prisma Accelerate)        |
| ORM        | Prisma 7.4                                |
| Icons      | lucide-react                              |

---

## Default Users (Pre-seeded)

The database is **already seeded** — you do not need to run any seed commands unless you reset the database.

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | admin@govscheme.in  | `admin123` |
| User  | user@govscheme.in   | `user123`  |

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open **http://localhost:3000** and log in with the credentials above.

> **Note:** The `.env` file is already configured with the production database (Prisma Accelerate) and auth secret. No extra setup is needed.

---

## Environment Variables

All env vars live in `.env` (see `.env.example` for reference).

| Variable                | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`          | Direct PostgreSQL connection string (used by Prisma migrations)   |
| `POSTGRES_URL`          | Alternative PostgreSQL URL                                        |
| `PRISMA_DATABASE_URL`   | Prisma Accelerate URL — used at runtime for connection pooling    |
| `AUTH_SECRET`            | Secret key for encrypting JWT tokens (NextAuth)                  |
| `AUTH_URL` / `NEXTAUTH_URL` | Application URL for auth callbacks (http://localhost:3000)    |
| `NODE_ENV`              | Environment mode (`development` / `production`)                   |
| `NEXT_PUBLIC_APP_NAME`  | Display name shown in the UI                                      |

**How it works:** At runtime the app connects to PostgreSQL through **Prisma Accelerate** (the `PRISMA_DATABASE_URL`). Prisma Accelerate provides connection pooling and caching. Direct `DATABASE_URL` is only used when running migrations via `prisma migrate`.

---

## NPM Scripts

| Command              | What it does                                                      |
| -------------------- | ----------------------------------------------------------------- |
| `npm run dev`        | Start the Next.js dev server (Turbopack)                          |
| `npm run build`      | Generate Prisma client + production build                         |
| `npm start`          | Start the production server (run `build` first)                   |
| `npm run setup`      | Full first-time setup: migrate DB → seed users → seed schemes     |
| `npm run seed:users` | Seed the two default users (admin + test user)                    |
| `npm run seed:schemes` | Seed 27+ government schemes (skips duplicates)                  |
| `npm run db:migrate` | Run Prisma migrations                                             |
| `npm run db:generate`| Re-generate the Prisma client                                     |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser)                            |
| `npm run db:reset`   | Reset the database (wipes all data + re-migrates)                 |
| `npm run db:push`    | Push schema changes without creating a migration                  |
| `npm run admin:list` | List all admin users                                              |
| `npm run admin:add`  | Promote a user to admin                                           |
| `npm run admin:delete` | Remove admin role from a user                                   |
| `npm run admin:update` | Update an admin user                                            |

> **Seeds are already applied.** You only need to re-run them if you reset the database with `npm run db:reset`.

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma         # Database schema (User, Scheme, Bookmark models)
│   ├── seed-users.ts         # Seeds default admin + test user
│   ├── seed-schemes.ts       # Seeds 27+ government schemes
│   └── migrations/           # SQL migration files
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles + theme variables
│   │   ├── layout.js         # Root layout
│   │   ├── page.js           # Landing page
│   │   ├── (auth)/           # Sign-in & Sign-up pages
│   │   ├── (protected)/      # Authenticated user pages
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── schemes/      # Browse & view schemes
│   │   │   ├── bookmarks/    # Saved schemes
│   │   │   ├── profile/      # Edit profile & eligibility
│   │   │   └── onboarding/   # First-time user setup wizard
│   │   ├── admin/            # Admin panel
│   │   │   ├── page.js       # Admin dashboard (stats)
│   │   │   ├── schemes/      # Manage schemes (CRUD, approve, archive)
│   │   │   └── users/        # Manage users (roles, delete)
│   │   └── api/              # REST API routes
│   ├── components/           # Shared UI components
│   ├── generated/            # Auto-generated Prisma client
│   └── lib/                  # Auth config, Prisma client, eligibility logic
├── scripts/
│   └── admin.ts              # CLI tool for admin management
├── .env                      # Environment variables (already configured)
└── package.json
```

### Database Models

- **User** — email, password, profile fields (age, gender, income, state, category, occupation, etc.), role (USER / ADMIN)
- **Scheme** — name, description, ministry, level (CENTRAL / STATE), status (DRAFT / APPROVED / ARCHIVED), eligibility rules (JSON), applicable states
- **Bookmark** — links a User to a Scheme (many-to-many)
