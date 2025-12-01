# Team Availability Scheduler

A Next.js application for tracking team availability with a shared calendar.

## Features

- Netflix-style profile picker
- Calendar view for each team member
- Click to select dates or date ranges
- Toggle availability on/off for selected dates
- Color-coded dates based on team unavailability

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

This automatically sets up the SQLite database and seeds users.

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel with Turso

### 1. Install Turso CLI

```bash
brew install tursodatabase/tap/turso
```

### 2. Create a Turso account & database

```bash
# Login
turso auth login

# Create database
turso db create schedule

# Get the database URL
turso db show schedule --url

# Create auth token
turso db tokens create schedule
```

### 3. Push schema to Turso

```bash
DATABASE_URL="libsql://your-db.turso.io" TURSO_AUTH_TOKEN="your-token" npx prisma db push
```

### 4. Seed the database (optional)

```bash
DATABASE_URL="libsql://your-db.turso.io" TURSO_AUTH_TOKEN="your-token" npm run db:seed
```

### 5. Add environment variables in Vercel

In your Vercel project settings, add:

- `DATABASE_URL` = `libsql://schedule-yourusername.turso.io`
- `TURSO_AUTH_TOKEN` = `your-token-here`

### 6. Deploy

```bash
vercel
```

## Customizing Users

Edit the names in `prisma/seed.ts` and run:

```bash
npm run db:seed
```

## Available Scripts

- `npm run dev` - Start development server (auto-seeds database)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with users
- `npm run db:setup` - Push schema and seed
