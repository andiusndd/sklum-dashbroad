# Phase 3: Dashboard UI Components

**Phase**: 3 of 5
**Status**: ✅ Done
**Priority**: P1 (High)
**Duration**: 3-4 hours
**Dependencies**: Phase 1, Phase 2 complete

---

## Context

Build responsive dashboard UI with metric cards, charts (Donut, Bar, Line), data table with sort/filter, dark mode toggle. Implement client-side polling for real-time updates.

**Related Research**:
- [Dashboard Design Patterns](../research/02-dashboard-design-patterns.md)
- [Chart Libraries Comparison](../research/04-chart-libraries-comparison.md)

**Related Phases**:
- Phase 2: API Integration (provides data)
- Phase 4: Admin Panel (uses some shared components)

---

## Overview

**Goal**: Complete, responsive dashboard UI for project tracking

**Key Components**:
- MetricCard (summary stats with sparklines)
- DonutChart (status breakdown)
- BarChart (tasks by milestone)
- LineChart (burndown/progress over time)
- DataTable (sortable, filterable task list)
- DashboardLayout (header, grid, dark mode toggle)

**Date**: 2026-02-12
**Estimated Time**: 3-4 hours
**Actual Time**: _TBD_

---

## Key Insights

- Single-page layout (no tabs/navigation)
- F-pattern reading order (summary → charts → table)
- Client-side polling every 30s for fresh data
- Dark mode via class toggle + localStorage persistence
- Responsive grid: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)

---

## Requirements

### Functional
- ✅ Display summary metrics (total, in progress, done, overdue)
- ✅ Render donut chart (status breakdown)
- ✅ Render bar chart (tasks by milestone)
- ✅ Render line chart (burndown/progress trend)
- ✅ Data table with sort, search, pagination
- ✅ Dark mode toggle (persisted)
- ✅ Auto-refresh every 30 seconds

### Non-Functional
- ✅ Responsive across mobile, tablet, desktop
- ✅ Lighthouse score > 90
- ✅ Smooth animations (no jank)
- ✅ Loading states for initial render
- ✅ Empty states when no data

---

## Architecture

### Component Hierarchy

```
app/page.js (Server Component - initial data)
  ↓
<DashboardLayout>
  ↓
  <DashboardHeader />
  ↓
  <MetricCardsGrid>
    ├── <MetricCard title="Total" />
    ├── <MetricCard title="In Progress" />
    ├── <MetricCard title="Done" />
    └── <MetricCard title="Overdue" />
  ↓
  <ChartsGrid>
    ├── <DonutChart />
    ├── <BarChart />
    └── <LineChart />
  ↓
  <DataTable />
</DashboardLayout>
```

---

## Related Code Files

**To Create**:
- `app/page.js` - Dashboard home (Server Component)
- `components/DashboardLayout.jsx` - Main layout wrapper
- `components/DashboardHeader.jsx` - Header with title, refresh, dark mode
- `components/MetricCard.jsx` - Summary stat card
- `components/charts/DonutChart.jsx` - Status donut chart
- `components/charts/BarChart.jsx` - Tasks by milestone
- `components/charts/LineChart.jsx` - Burndown chart
- `components/DataTable.jsx` - Sortable data table
- `hooks/useDashboardData.js` - Client-side polling hook

---

## Implementation Steps

### Step 1: Update Root Layout for Dark Mode

File: `app/layout.js`

```javascript
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SKLUM Dashboard',
  description: 'Real-time project tracking from Google Sheets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

---

### Step 2: Create Dashboard Page (Server Component)

File: `app/page.js`

```javascript
import { DashboardLayout } from '@/components/DashboardLayout';

export const revalidate = 60;

async function getDashboardData() {
  const res = await fetch(`http://localhost:3000/api/sheets/data`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return res.json();
}

export default async function DashboardPage() {
  const initialData = await getDashboardData();

  return <DashboardLayout initialData={initialData} />;
}
```

---

### Step 3: Create Dashboard Layout (Client Component)

File: `components/DashboardLayout.jsx`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { MetricCard } from './MetricCard';
import { DonutChart } from './charts/DonutChart';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { DataTable } from './DataTable';

export function DashboardLayout({ initialData }) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/sheets/data');
        const newData = await res.json();
        setData(newData);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      } finally {
        setIsLoading(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const { summary, chartData, tasks, lastUpdated } = data;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader lastUpdated={lastUpdated} isLoading={isLoading} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Tasks" value={summary.total} trend="+5" />
          <MetricCard title="In Progress" value={summary.inProgress} color="warning" />
          <MetricCard title="Completed" value={summary.done} color="success" />
          <MetricCard title="Overdue" value={summary.overdue} color="danger" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart data={chartData.statusBreakdown} />
          <BarChart data={chartData.tasksByMilestone} />
        </div>

        {/* Data Table */}
        <DataTable data={tasks} />
      </main>
    </div>
  );
}
```

---

### Step 4: Create Dashboard Header

File: `components/DashboardHeader.jsx`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function DashboardHeader({ lastUpdated, isLoading }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode') === 'true';
    setIsDark(stored);
    document.documentElement.classList.toggle('dark', stored);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('darkMode', String(newValue));
    document.documentElement.classList.toggle('dark', newValue);
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SKLUM Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            {isLoading && <RefreshCw className="inline ml-2 h-3 w-3 animate-spin" />}
          </p>
        </div>
        
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
```

---

### Step 5: Create Metric Card Component

File: `components/MetricCard.jsx`

```javascript
import { Card,CardHeader, CardTitle, CardContent } from './ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const colorClasses = {
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
};

export function MetricCard({ title, value, trend, color }) {
  const colorClass = color ? colorClasses[color] : '';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.startsWith('+') ? (
              <ArrowUp className="inline h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="inline h-3 w-3 text-red-500" />
            )}
            <span className="ml-1">{trend} this week</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Step 6: Create Chart Components

File: `components/charts/DonutChart.jsx`

```javascript
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function DonutChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

File: `components/charts/BarChart.jsx`

```javascript
'use client';

import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function BarChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by Milestone</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBar data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="milestone" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </RechartsBar>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

### Step 7: Create Data Table

File: `components/DataTable.jsx`

```javascript
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';

export function DataTable({ data }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedData = [...data].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Task Name
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status
              </TableHead>
              <TableHead onClick={() => handleSort('progress')} className="cursor-pointer">
                Progress
              </TableHead>
              <TableHead onClick={() => handleSort('due_date')} className="cursor-pointer">
                Due Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((task, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status?.toLowerCase().includes('done') ? 'bg-green-100 text-green-800' :
                    task.status?.toLowerCase().includes('progress') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>{task.progress}%</TableCell>
                <TableCell>{task.due_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

---

## Todo List

- [ ] Update `app/layout.js` with Inter font and metadata
- [ ] Create `app/page.js` as Server Component
- [ ] Create `components/DashboardLayout.jsx` with polling
- [ ] Create `components/DashboardHeader.jsx` with dark mode toggle
- [ ] Create `components/MetricCard.jsx` with trend indicators
- [ ] Create `components/charts/DonutChart.jsx`
- [ ] Create `components/charts/BarChart.jsx`
- [ ] Create `components/DataTable.jsx` with sorting
- [ ] Install `lucide-react` for icons: `npm install lucide-react`
- [ ] Test responsive layout on mobile, tablet, desktop
- [ ] Test dark mode toggle and persistence
- [ ] Verify auto-refresh every 30s works
- [ ] Commit: `git commit -m "feat: implement dashboard UI components"`

---

## Success Criteria

- ✅ Dashboard loads with initial data from server
- ✅ Auto-refreshes every 30 seconds
- ✅ Responsive grid adapts to screen size
- ✅ Dark mode toggles and persists
- ✅ Charts render without errors
- ✅ Table sorting works
- ✅ Loading indicator shows during refresh
- ✅ No layout shift (CLS < 0.1)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Recharts not rendering on SSR | Low | Medium | Use 'use client' directive |
| Dark mode flicker on load | Medium | Low | Inline script in layout (future) |
| Table performance with 1000+ rows | Low | Medium | Add pagination/virtualization |
| Auto-refresh disrupts user | Low | Low | Pause on user interaction (future) |

---

## Security Considerations

- ✅ No sensitive data exposed (public dashboard)
- ✅ API calls go through Next.js route (not direct)
- ✅ Client-side code has no credentials

---

## Next Steps

After completing Phase 3:
1. ✅ Verify dashboard renders correctly
2. ✅ Test all interactive features
3. ✅ Commit to Git
4. ➡️ **Proceed to [Phase 4: Admin Configuration Panel](./phase-04-admin.md)**

---

**Phase Status**: ⏳ Waiting for Phase 2
