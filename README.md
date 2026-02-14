# Gov Scheme Teller

India Government Scheme Eligibility Platform. Users complete an onboarding profile and get matched against Central and State government schemes based on their eligibility.

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Database** — PostgreSQL (Prisma ORM)
- **Auth** — Auth.js (NextAuth) with Credentials Provider and JWT sessions
- **Styling** — Tailwind CSS 4 with CSS variable design system
- **Icons** — Lucide React

## Prerequisites

- Node.js 18+
- A PostgreSQL database (local or hosted — connection string goes in `.env`)

## First-Time Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` or create a `.env` file at the project root with:

```env
DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
AUTH_SECRET="your-random-secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Gov Scheme Teller"
```

- `DATABASE_URL` is the direct PostgreSQL connection string (used by migrations).
- `PRISMA_DATABASE_URL` is the Prisma Accelerate URL (used by the app and scripts at runtime).
- `AUTH_SECRET` must be a random string. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

### 3. Generate the Prisma client

```bash
npm run db:generate
```

### 4. Run database migrations

This creates all tables, enums, and indexes in your PostgreSQL database:

```bash
npm run db:migrate
```

### 5. Seed the database

Populates the database with a default admin, a test user, and 6 government schemes (3 Central, 3 State):

```bash
npm run db:seed
```

**Seed credentials:**

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@govscheme.in | admin123 |
| User  | user@govscheme.in  | user123  |

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Next.js in development mode |
| Build | `npm run build` | Production build |
| Start | `npm run start` | Start production server |
| Migrate | `npm run db:migrate` | Run Prisma migrations |
| Generate | `npm run db:generate` | Regenerate Prisma client |
| Seed | `npm run db:seed` | Seed database with initial data |
| Studio | `npm run db:studio` | Open Prisma Studio (DB browser) |
| Reset DB | `npm run db:reset` | Reset database and reapply migrations |

## Admin CLI

Manage admin users from the command line:

```bash
npm run admin:list
npm run admin:add -- --email admin@example.com --name "Jane Doe" --password secret123
npm run admin:update -- --email admin@example.com --name "Updated Name"
npm run admin:delete -- --email admin@example.com
```

## Project Structure

```
src/
  app/
    (auth)/              Sign-in and sign-up pages
    (protected)/         Dashboard, onboarding (requires auth)
    admin/               Admin dashboard (requires ADMIN role)
    api/auth/            Auth routes (NextAuth + sign-up)
    api/onboarding/      Onboarding submission endpoint
  lib/
    auth.js              Auth.js configuration
    prisma.js            Prisma client singleton
    eligibility.js       Eligibility matching engine
  middleware.js          Route protection and onboarding enforcement
prisma/
  schema.prisma          Database schema
  seed.mjs               Seed script
scripts/
  admin.mjs              Admin CLI tool
```

## User Flow

1. **Sign up** at `/sign-up`
2. **Complete onboarding** — personal details, location, economic info, and flags (BPL, disability, minority)
3. **View dashboard** — see matched schemes based on eligibility profile
4. **Bookmark** schemes for later reference

## Admin Flow

1. **Sign in** with an admin account
2. Access `/admin` — view platform analytics (user count, scheme count, bookmarks)
3. Manage schemes — create, edit, approve, and archive

## License

Private project — not licensed for redistribution.
