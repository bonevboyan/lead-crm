# Lead CRM - Lead Generation & CRM Web App

A mobile-responsive web application for web development agencies to automate lead generation using Google Places API with a Tinder-style swipe interface and built-in CRM dashboard.

## Features

- **Grid Search Algorithm**: Bypasses Google Places API 60-result limit by overlaying a coordinate grid over city areas
- **30+ Bulgaria Cities**: Pre-configured coordinates for exhaustive local search
- **Tinder-Style Discovery**: Swipe through businesses with one-click approve/reject
- **Weak Website Detection**: Automatic flagging of HTTP, Facebook pages, Google Sites, Wix, etc.
- **CRM Dashboard**: Track sales pipeline with status updates and notes
- **Mobile Optimized**: Fully responsive for mobile sales teams

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Vercel Postgres recommended)
- **ORM**: Prisma
- **Auth**: JWT with single global password
- **Deployment**: Optimized for Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd lead-crm
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Google Places API Key (get from Google Cloud Console)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Database URL (Vercel Postgres or any PostgreSQL)
DATABASE_URL=postgresql://...

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# Global Password for the app
GLOBAL_PASSWORD=your_secure_password
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework preset: Next.js

3. **Environment Variables**
   Add these in Vercel dashboard:
   - `GOOGLE_PLACES_API_KEY`
   - `DATABASE_URL` (create Vercel Postgres first)
   - `JWT_SECRET`
   - `GLOBAL_PASSWORD`

4. **Database**
   - Create Vercel Postgres from the dashboard
   - Copy the connection string to `DATABASE_URL`
   - Run `npx prisma db push` locally or use Vercel CLI

## Usage

### 1. Search Configuration
- Select city from 30+ Bulgaria locations
- Choose business category
- Set sorting (reviews high/low)
- Filter by website presence
- Click Search to fetch leads

### 2. Discovery
- Review businesses one by one
- **Save to CRM**: Adds to your pipeline
- **Reject**: Permanently removes from all searches
- Weak websites are highlighted (HTTP, Facebook, Wix, etc.)
- Open/closed status shows call timing

### 3. CRM Dashboard
- View all approved leads
- Update status: Pending → Called → Interested/Callback/Not Interested
- Add notes per business
- Click phone numbers to call directly
- Filter by status

## File Structure

```
app/
├── api/
│   ├── auth/route.ts          # JWT login
│   ├── places/route.ts        # Grid search + Google Places
│   └── businesses/route.ts    # CRUD for businesses
├── setup/page.tsx             # Search configuration
├── discover/page.tsx          # Tinder-style cards
├── dashboard/page.tsx         # CRM table
├── layout.tsx
└── page.tsx                   # Redirects to /setup
components/
├── AuthLayout.tsx             # Auth wrapper
├── LoginForm.tsx              # Password login
└── Navigation.tsx             # Top nav
lib/
├── prisma.ts                  # Prisma client
├── auth.ts                    # JWT helpers
└── cities.ts                  # 30+ cities + weak website detection
prisma/
└── schema.prisma              # Database schema
```

## Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Places API (New)**
4. Create API credentials (API Key)
5. Restrict the key to HTTP referrers (your domain)
6. Add the key to environment variables

## Database Schema

### Business
- `placeId` (unique) - Google Places ID
- `name`, `category`, `phone`, `website`, `mapsUrl`
- `reviewCount`, `hasSSL`, `isWeakWebsite`
- `isRejected` - permanent flag for rejected businesses

### CRMStatus
- `businessId` (relation)
- `status` - PENDING, CALLED, INTERESTED, CALLBACK, NOT_INTERESTED
- `notes`

## Customization

### Add More Cities
Edit `lib/cities.ts`:

```typescript
export const CITIES = {
  'new-city': {
    name: 'New City',
    lat: 43.0000,
    lng: 27.0000,
    radius: 10000, // meters
  },
  // ... existing cities
};
```

### Add Weak Website Patterns
Edit `checkWeakWebsite()` in `lib/cities.ts`:

```typescript
if (lowerUrl.includes('your-pattern.com')) {
  flags.push('Your Pattern');
}
```

### Add Categories
Edit `CATEGORIES` array in `lib/cities.ts` with Google Places types.

## License

MIT