# Research: Next.js + Vercel Deployment Optimization

**Researcher**: Research Agent Gamma
**Date**: 2026-02-12
**Topic**: Next.js 14 App Router, Vercel deployment, performance optimization

---

## Executive Summary

Next.js 14 with App Router + Vercel provides zero-config deployment for serverless applications. For SKLUM Dashboard, recommended stack: App Router with Server Components (default), ISR caching for Sheets data, and Vercel's free tier (sufficient for ~100k requests/month). Critical: Use environment variables for secrets, enable edge caching, and implement proper error boundaries.

**Key Recommendations**:
- ✅ Use App Router (not Pages Router)
- ✅ Server Components for data fetching
- ✅ ISR with 60s revalidation
- ✅ Edge runtime for API routes (faster cold starts)
- ✅ Vercel environment variables for secrets

---

## 1. Next.js 14 App Router Architecture

### File Structure

```
app/
├── layout.js               # Root layout (shared across all pages)
├── page.js                 # Home page (dashboard)
├── admin/
│   └── page.js             # Admin configuration page
├── api/
│   ├── sheets/
│   │   └── route.js        # Fetch Google Sheets data
│   └── config/
│       └── route.js        # Save/load config (admin)
├── components/
│   ├── DashboardLayout.jsx
│   ├── MetricCard.jsx
│   ├── charts/
│   │   ├── DonutChart.jsx
│   │   ├── BarChart.jsx
│   │   └── LineChart.jsx
│   └── DataTable.jsx
├── lib/
│   ├── sheets.js           # Google Sheets API wrapper
│   ├── utils.js            # Utility functions
│   └── constants.js        # Config constants
└── globals.css             # Tailwind + custom styles
```

### Server vs Client Components

**Server Components** (default - use for most):
```javascript
// app/page.js (Server Component)
export const revalidate = 60; // ISR - revalidate every 60s

export default async function DashboardPage() {
  const data = await fetchSheetData(); // Runs on server
  
  return (
    <div>
      <MetricCards data={data.summary} />
      <Charts data={data.charts} />
    </div>
  );
}
```

**Client Components** (use sparingly - only when needed):
```javascript
'use client'; // Directive to mark as Client Component

import { useState, useEffect } from 'react';

export default function InteractiveChart({ initialData }) {
  const [data, setData] = useState(initialData);
  
  useEffect(() => {
    // Client-side polling
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return <Chart data={data} />;
}
```

**When to use Client Components**:
- ✅ Interactive features (click, hover, input)
- ✅ `useState`, `useEffect`, event listeners
- ✅ Browser-only APIs (localStorage, window)

**When to use Server Components** (default):
- ✅ Data fetching
- ✅ Accessing backend resources (DB, API)
- ✅ Keeping secrets server-side
- ✅ Reducing client bundle size

---

## 2. Data Fetching Patterns

### Pattern A: Server Component with ISR (Recommended)

```javascript
// app/page.js
export const revalidate = 60; // Seconds

async function getSheetData() {
  const sheets = await initGoogleSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });
  
  return transformData(response.data.values);
}

export default async function Page() {
  const data = await getSheetData();
  return <Dashboard data={data} />;
}
```

**Benefits**:
- Zero client-side JavaScript for data fetch
- Automatic caching + revalidation
- No loading spinners needed (SSR)

### Pattern B: API Route + Client Polling

```javascript
// app/api/sheets/route.js
export const revalidate = 60;
export const runtime = 'edge'; // Faster cold starts

export async function GET() {
  try {
    const data = await fetchSheetData();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

```javascript
// app/components/Dashboard.jsx
'use client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/sheets');
      const json = await res.json();
      setData(json);
    }
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (!data) return <Loading />;
  return <DashboardContent data={data} />;
}
```

**Use when**: Need client-side updates without page refresh

---

## 3. Environment Variables

### File Structure

```
# .env.local (development - not committed)
GOOGLE_CREDENTIALS={"type":"service_account",...}
SHEET_ID=1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```
# .env.production (Vercel dashboard)
GOOGLE_CREDENTIALS={"type":"service_account",...}
SHEET_ID=1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c
ADMIN_PASSWORD=production-password
NEXT_PUBLIC_SITE_URL=https://sklum-dashboard.vercel.app
```

### Variable Types

**Server-only** (accessed in API routes/Server Components):
```javascript
const credentials = process.env.GOOGLE_CREDENTIALS;
const sheetId = process.env.SHEET_ID;
```

**Public** (exposed to browser - prefix with `NEXT_PUBLIC_`):
```javascript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
```

**Security Rules**:
- ❌ Never prefix secrets with `NEXT_PUBLIC_`
- ✅ Use `.env.local` for development
- ✅ Set production vars in Vercel dashboard
- ✅ Add `.env*` to `.gitignore`

---

## 4. Vercel Deployment Configuration

### vercel.json (Optional - defaults are good)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "GOOGLE_CREDENTIALS": "@google-credentials",
    "SHEET_ID": "@sheet-id"
  }
}
```

### Deployment Steps

**1. Install Vercel CLI**:
```bash
npm install -g vercel
```

**2. Login**:
```bash
vercel login
```

**3. Deploy**:
```bash
# Development preview
vercel

# Production
vercel --prod
```

**4. Set Environment Variables** (in Vercel dashboard):
- Project Settings → Environment Variables
- Add: `GOOGLE_CREDENTIALS`, `SHEET_ID`, `ADMIN_PASSWORD`
- Select environments: Production, Preview, Development

**5. Auto-deploy on Git Push**:
- Connect GitHub repository in Vercel
- Every push to `main` → auto-deploy to production
- Every PR → auto-deploy preview

---

## 5. Performance Optimization

### Edge Runtime for API Routes

```javascript
// app/api/sheets/route.js
export const runtime = 'edge'; // Use Edge Runtime

export async function GET() {
  // ... fetch logic
}
```

**Benefits**:
- 10-100x faster cold starts vs Node.js runtime
- Global edge network (lower latency)
- Lower cost (billed by CPU time)

**Limitations**:
- Cannot use Node.js-specific APIs
- `googleapis` package works on edge ✅

### Image Optimization

```javascript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // Load immediately (above fold)
/>
```

**Auto-optimization**:
- WebP/AVIF conversion
- Lazy loading (except `priority`)
- Responsive srcset
- Blur placeholder

### Font Optimization

```javascript
// app/layout.js
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Benefits**:
- Self-hosted fonts (no Google Fonts request)
- Zero layout shift
- Preloaded automatically

---

## 6. Caching Strategy

### ISR (Incremental Static Regeneration)

```javascript
// Revalidate every 60 seconds
export const revalidate = 60;
```

**How it works**:
1. First request: Generate page/data
2. Cache for 60 seconds
3. After 60s: Next request triggers background revalidation
4. Serve stale cache while regenerating
5. New cache ready → serve to next request

**Perfect for**:
- Google Sheets data (quasi-static)
- Balance between real-time and performance

### Manual Revalidation

```javascript
// app/api/revalidate/route.js
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const { password } = await request.json();
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  revalidatePath('/'); // Revalidate homepage
  return Response.json({ revalidated: true });
}
```

**Use case**: Admin wants to force refresh after updating Sheet

---

## 7. Error Handling

### Top-Level Error Boundary

```javascript
// app/error.js
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### API Error Responses

```javascript
export async function GET() {
  try {
    const data = await fetchSheetData();
    return Response.json(data);
  } catch (error) {
    console.error('Sheet fetch failed:', error);
    
    return Response.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## 8. Vercel Free Tier Limits

**Generous Free Tier**:
- ✅ 100 GB bandwidth/month
- ✅ 100 serverless function invocations/day (6,000/hour burst)
- ✅ Unlimited deployments
- ✅ Auto SSL
- ✅ Global CDN
- ✅ Auto preview deployments

**For SKLUM Dashboard**:
- Assume 100 users/day × 10 page views = 1,000 views/day
- With ISR (60s cache), ~1 API call/minute = 1,440/day
- Well within free tier ✅

**If exceeds free tier**: Upgrade to Pro ($20/month)

---

## 9. Local Development Setup

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Development Workflow

```bash
# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local

# Start dev server
npm run dev
# Opens at http://localhost:3000

# Build for production (test locally)
npm run build
npm run start
```

---

## 10. Monitoring & Analytics

### Vercel Analytics (Built-in)

Enable in `next.config.js`:
```javascript
module.exports = {
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
};
```

**Metrics tracked**:
- Core Web Vitals (LCP, FID, CLS)
- Real user monitoring
- Performance scores

### Custom Logging

```javascript
// lib/logger.js
export function log(message, level = 'info') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level}] ${message}`);
  } else {
    // Send to external service (Sentry, LogRocket)
  }
}
```

---

## Deployment Checklist

Pre-Deployment:
- ✅ `.env.local` created with all secrets
- ✅ `.gitignore` includes `.env*`
- ✅ `npm run build` succeeds locally
- ✅ No TypeScript errors
- ✅ No ESLint errors

Vercel Setup:
- ✅ Project connected to GitHub
- ✅ Environment variables set in dashboard
- ✅ Production domain configured (optional)
- ✅ Analytics enabled

Post-Deployment:
- ✅ Test production URL
- ✅ Verify Google Sheets connection
- ✅ Check API route responses
- ✅ Test admin panel access
- ✅ Monitor Vercel dashboard for errors

---

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)
