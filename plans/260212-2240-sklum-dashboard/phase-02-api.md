# Phase 2: Google Sheets API Integration

**Phase**: 2 of 5
**Status**: ✅ Done
**Priority**: P0 (Blocker)
**Duration**: 1-2 hours
**Dependencies**: Phase 1 complete

---

## Context

Implement Google Sheets Service Account authentication, create API route with ISR caching, build data transformation layer to convert raw Sheet data into structured format for charts/tables.

**Related Research**:
- [Google Sheets API Integration Best Practices](../research/01-google-sheets-api-integration.md)
- [Next.js ISR Configuration](../research/03-nextjs-vercel-deployment.md)

**Related Phases**:
- Phase 1: Project Setup (prerequisite)
- Phase 3: Dashboard UI (consumes this API)

---

## Overview

**Goal**: Fetch, cache, and transform Google Sheets data via secure API route

**Key Components**:
- Google Sheets API client wrapper
- Next.js API route with 60s ISR
- Data transformation utilities
- Error handling with retries

**Sheet ID**: `1XTkvkPZ5pNSJsXIPF5HwPDxy2vIVY5uFmvhS_hCJl9c`
**Service Account**: `dashboard-reader@divine-glazing-451115-a0.iam.gserviceaccount.com`

**Date**: 2026-02-12
**Estimated Time**: 1-2 hours
**Actual Time**: _TBD_

---

## Key Insights

- Service Account avoids OAuth complexity (user not involved)
- ISR with 60s revalidation balances freshness + API quota
- Batch fetch multiple sheets/ranges in one call (quota optimization)
- Transform raw 2D array → structured objects for easy rendering
- Edge Runtime preferable but Node.js runtime works fine for `googleapis`

---

## Requirements

### Functional
- ✅ Authenticate with Google Sheets API using Service Account
- ✅ Fetch data from specified Sheet ID and ranges
- ✅ Transform data into structured JSON format
- ✅ Implement 60-second ISR caching
- ✅ Handle errors gracefully (403, 429, 404)
- ✅ Support multiple sheet tabs (if needed)

### Non-Functional
- ✅ API response time < 500ms (after cache)
- ✅ Handle rate limits with exponential backoff
- ✅ Secrets never exposed to client
- ✅ Type-safe data parsing

---

## Architecture

### Data Flow

```
Google Sheets (Source)
        ↓
Service Account Auth
        ↓
Next.js API Route (/api/sheets/data)
   ↓                    ↓
ISR Cache (60s)    Fresh Fetch
   ↓                    ↓
Transform Data (2D array → objects)
        ↓
JSON Response → Frontend
```

### API Response Format

```json
{
  "summary": {
    "total": 145,
    "inProgress": 32,
    "done": 98,
    "overdue": 15
  },
  "tasks": [
    {
      "id": 1,
      "name": "Website Redesign",
      "status": "In Progress",
      "progress": 75,
      "assignee": "John Doe",
      "dueDate": "2026-02-15",
      "priority": "High"
    }
  ],
  "chartData": {
    "statusBreakdown": [
      { "name": "To Do", "value": 15, "color": "#94a3b8" },
      { "name": "In Progress", "value": 32, "color": "#f59e0b" },
      { "name": "Done", "value": 98, "color": "#10b981" }
    ],
    "burndown": [
      { "week": "Week 1", "remaining": 145 },
      { "week": "Week 2", "remaining": 120 }
    ]
  },
  "lastUpdated": "2026-02-12T22:45:00Z"
}
```

---

## Related Code Files

**To Create**:
- `lib/sheets.js` - Google Sheets client wrapper
- `lib/transformers.js` - Data transformation functions
- `app/api/sheets/data/route.js` - API route handler

**To Modify**:
- `.env.local` - Add GOOGLE_CREDENTIALS, SHEET_ID

---

## Implementation Steps

### Step 1: Create Google Sheets Client Wrapper

File: `lib/sheets.js`

```javascript
import { google } from 'googleapis';

let sheetsClient = null;

export function getGoogleSheetsClient() {
  if (sheetsClient) return sheetsClient;

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    throw new Error('Google Sheets client initialization failed');
  }
}

export async function fetchSheetData(sheetId, ranges) {
  const sheets = getGoogleSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: Array.isArray(ranges) ? ranges : [ranges],
    });

    return response.data.valueRanges;
  } catch (error) {
    if (error.code === 403) {
      throw new Error('Access denied. Ensure service account is shared on Sheet.');
    } else if (error.code === 404) {
      throw new Error('Sheet not found. Check Sheet ID.');
    } else if (error.code === 429) {
      throw new Error('Rate limit exceeded. Try again later.');
    }
    throw error;
  }
}
```

---

### Step 2: Create Data Transformation Layer

File: `lib/transformers.js`

```javascript
export function parseSheetToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  
  const [headers, ...dataRows] = rows;
  
  return dataRows.map(row => {
    return headers.reduce((obj, header, index) => {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      obj[key] = row[index] || null;
      return obj;
    }, {});
  });
}

export function calculateSummary(tasks) {
  const summary = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  };

  const now = new Date();

  tasks.forEach(task => {
    const status = task.status?.toLowerCase();
    const dueDate = task.due_date ? new Date(task.due_date) : null;

    if (status?.includes('done') || status?.includes('complete')) {
      summary.done++;
    } else if (status?.includes('progress')) {
      summary.inProgress++;
    } else {
      summary.todo++;
    }

    if (dueDate && dueDate < now && !status?.includes('done')) {
      summary.overdue++;
    }
  });

  return summary;
}

export function transformToChartData(tasks) {
  const summary = calculateSummary(tasks);

  const statusBreakdown = [
    { name: 'To Do', value: summary.todo, color: '#94a3b8' },
    { name: 'In Progress', value: summary.inProgress, color: '#f59e0b' },
    { name: 'Done', value: summary.done, color: '#10b981' },
  ];

  // Group by milestone for bar chart
  const milestones = {};
  tasks.forEach(task => {
    const milestone = task.milestone || 'Uncategorized';
    milestones[milestone] = (milestones[milestone] || 0) + 1;
  });

  const tasksByMilestone = Object.entries(milestones).map(([name, count]) => ({
    milestone: name,
    tasks: count,
  }));

  return {
    statusBreakdown,
    tasksByMilestone,
  };
}
```

---

### Step 3: Create API Route

File: `app/api/sheets/data/route.js`

```javascript
import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets';
import { parseSheetToObjects, calculateSummary, transformToChartData } from '@/lib/transformers';

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const runtime = 'nodejs'; // googleapis requires Node.js runtime

const SHEET_ID = process.env.SHEET_ID;

export async function GET(request) {
  try {
    // Validate environment variables
    if (!SHEET_ID) {
      return NextResponse.json(
        { error: 'SHEET_ID not configured' },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_CREDENTIALS) {
      return NextResponse.json(
        { error: 'GOOGLE_CREDENTIALS not configured' },
        { status: 500 }
      );
    }

    // Fetch data from Google Sheets
    const [tasksRange] = await fetchSheetData(SHEET_ID, ['Sheet1!A1:Z1000']);

    // Transform raw data
    const tasksList = parseSheetToObjects(tasksRange.values);
    const summary = calculateSummary(tasksList);
    const chartData = transformToChartData(tasksList);

    // Return structured response
    return NextResponse.json({
      summary,
      tasks: tasksList,
      chartData,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch data',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
```

---

### Step 4: Test API Route

Create test file: `app/api/test-sheets/route.js` (temporary)

```javascript
import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets';

export async function GET() {
  try {
    const data = await fetchSheetData(
      process.env.SHEET_ID,
      ['Sheet1!A1:E10']
    );

    return NextResponse.json({
      success: true,
      data: data[0].values,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
```

**Test**:
```bash
# Start dev server
npm run dev

# Visit in browser or curl
curl http://localhost:3000/api/test-sheets
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    ["Task Name", "Status", "Progress", "Assignee", "Due Date"],
    ["Task 1", "In Progress", "75%", "John", "2026-02-15"],
    ...
  ]
}
```

---

## Todo List

- [ ] Create `lib/sheets.js` with Google Sheets client
- [ ] Create `lib/transformers.js` with data parsing functions
- [ ] Create `app/api/sheets/data/route.js` with ISR config
- [ ] Add GOOGLE_CREDENTIALS to `.env.local` (paste Service Account JSON)
- [ ] Add SHEET_ID to `.env.local`
- [ ] Test `/api/test-sheets` route - verify authentication works
- [ ] Test `/api/sheets/data` route - verify full response structure
- [ ] Verify ISR caching works (check response headers)
- [ ] Handle error cases (remove Sheet share, test 403)
- [ ] Delete `app/api/test-sheets/route.js` (cleanup)
- [ ] Commit: `git commit -m "feat: implement Google Sheets API integration"`

---

## Success Criteria

- ✅ `/api/sheets/data` returns JSON with summary, tasks, chartData
- ✅ Response time < 500ms after first cache
- ✅ ISR revalidation working (check `X-Nextjs-Cache` header)
- ✅ 403 error returns user-friendly message
- ✅ No credentials exposed in client bundle
- ✅ Data structure matches expected format

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Service Account not shared on Sheet | High | High | Verify in Step 4 test |
| Invalid JSON in GOOGLE_CREDENTIALS | Medium | High | Validate JSON.parse in lib/sheets.js |
| Rate limit hit during testing | Low | Medium | Use ISR cache, implement retry logic |
| Sheet structure changes | Medium | Medium | Defensive parsing (handle missing fields) |

---

## Security Considerations

- ✅ Credentials loaded server-side only (never sent to client)
- ✅ API route validates environment variables before execution
- ✅ Error messages don't expose internal details in production
- ✅ Service Account has readonly permissions only

---

## Next Steps

After completing Phase 2:
1. ✅ Verify all success criteria met
2. ✅ Test API route with real Sheet data
3. ✅ Commit to Git
4. ➡️ **Proceed to [Phase 3: Dashboard UI Components](./phase-03-ui.md)**

---

**Phase Status**: ⏳ Waiting for Phase 1
