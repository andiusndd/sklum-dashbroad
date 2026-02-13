# Research: Chart Libraries Comparison for React

**Researcher**: Research Agent Delta
**Date**: 2026-02-12
**Topic**: Recharts vs Chart.js vs Nivo - best fit for project dashboard

---

## Executive Summary

For SKLUM Dashboard (React + Next.js), **Recharts** emerges as optimal choice. Declarative React-first API, responsive by default, and lightweight (45KB gzipped). Chart.js requires imperative wrapper, while Nivo is feature-rich but overkill for basic project tracking. Recharts handles donut, bar, line, and area charts needed for this use case with minimal configuration.

**Recommendation**: **Recharts** ✅

**Runner-up**: Nivo (if need advanced interactivity)

---

## 1. Comparison Matrix

| Feature | Recharts | Chart.js | Nivo |
|---------|----------|----------|------|
| **Bundle Size** | 45KB gzipped | 60KB + wrapper | 120KB+ |
| **React Integration** | Native | Wrapper needed | Native |
| **API Style** | Declarative JSX | Imperative config | Declarative JSX |
| **TypeScript Support** | ✅ Good | ✅ Excellent | ✅ Excellent |
| **Responsive** | ✅ Built-in | ⚠️ Manual | ✅ Built-in |
| **Customization** | ✅ High | ✅ Very High | ✅ Very High |
| **Animation** | ✅ Smooth | ✅ Smooth | ✅ Advanced |
| **Accessibility** | ⚠️ Basic | ⚠️ Basic | ✅ Good |
| **Documentation** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Learning Curve** | Low | Medium | Medium |
| **Community** | 23k stars | 65k stars | 13k stars |
| **Last Updated** | Active | Active | Active |

---

## 2. Recharts (Recommended)

### Pros

✅ **Declarative React API**:
```jsx
<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="tasks" stroke="#8884d8" />
</LineChart>
```

✅ **Composable Components**: Mix and match chart elements
✅ **Responsive by default**: Uses ResponsiveContainer
✅ **Smaller bundle**: 45KB vs 60KB+ for Chart.js
✅ **SSR Compatible**: Works with Next.js Server Components
✅ **TypeScript support**: Built-in type definitions

### Cons

❌ **Limited 3D charts**: No 3D pie/bar (not needed for this project)
❌ **Basic animations**: Less smooth than Nivo
❌ **Accessibility**: Needs custom ARIA labels

### Example: Donut Chart

```jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'To Do', value: 30, color: '#94a3b8' },
  { name: 'In Progress', value: 45, color: '#f59e0b' },
  { name: 'Done', value: 120, color: '#10b981' },
];

export function StatusDonutChart() {
  return (
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
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Example: Bar Chart

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { milestone: 'Planning', tasks: 45 },
  { milestone: 'Design', tasks: 32 },
  { milestone: 'Development', tasks: 78 },
  { milestone: 'Testing', tasks: 23 },
];

export function TasksByMilestoneChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="milestone" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="tasks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Example: Line Chart (Burndown)

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { week: 'Week 1', remaining: 145 },
  { week: 'Week 2', remaining: 120 },
  { week: 'Week 3', remaining: 98 },
  { week: 'Week 4', remaining: 67 },
  { week: 'Week 5', remaining: 45 },
];

export function BurndownChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="remaining" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## 3. Chart.js + react-chartjs-2

### Pros

✅ **Most popular**: 65k GitHub stars, huge community
✅ **Extensive plugins**: Zoom, annotation, datalabels, etc.
✅ **Battle-tested**: Used by millions of sites
✅ **Highly customizable**: Fine-grained control

### Cons

❌ **Imperative API**: Not idiomatic for React
❌ **Manual responsiveness**: Need resize listener
❌ **Wrapper overhead**: Extra abstraction layer
❌ **Larger bundle**: 60KB base + plugins

### Example: Bar Chart

```jsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function TasksChart() {
  const data = {
    labels: ['Planning', 'Design', 'Development', 'Testing'],
    datasets: [{
      label: 'Tasks',
      data: [45, 32, 78, 23],
      backgroundColor: '#3b82f6',
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Tasks by Milestone' },
    },
  };

  return <Bar data={data} options={options} />;
}
```

**Why not recommended for this project**:
- More boilerplate (register scales, elements)
- Imperative config object vs declarative JSX
- Manual responsive setup needed

---

## 4. Nivo

### Pros

✅ **Beautiful defaults**: Publication-quality charts out of box
✅ **Rich interactions**: Hover, click, drag built-in
✅ **Motion**: Smooth spring animations
✅ **Accessibility**: Better ARIA support than others
✅ **Server-side rendering**: HTML + canvas options

### Cons

❌ **Heavy bundle**: 120KB+ for basic setup
❌ **Overkill for simple charts**: Best for data storytelling
❌ **Slower updates**: Smaller maintainer team
❌ **Learning curve**: More concepts to learn

### Example: Donut Chart

```jsx
import { ResponsivePie } from '@nivo/pie';

const data = [
  { id: 'To Do', value: 30, color: '#94a3b8' },
  { id: 'In Progress', value: 45, color: '#f59e0b' },
  { id: 'Done', value: 120, color: '#10b981' },
];

export function StatusPieChart() {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={2}
      cornerRadius={4}
      colors={{ datum: 'data.color' }}
      enableArcLinkLabels={false}
      arcLabelsSkipAngle={10}
    />
  );
}
```

**Why not recommended for this project**:
- Bundle size too large for simple dashboard
- Advanced features (motion, patterns) not needed
- Can use later if requirements grow

---

## 5. Decision Matrix for SKLUM Dashboard

### Required Chart Types

| Chart Type | Recharts | Chart.js | Nivo |
|------------|----------|----------|------|
| **Donut Chart** (Status breakdown) | ✅ PieChart | ✅ Doughnut | ✅ ResponsivePie |
| **Bar Chart** (Tasks per milestone) | ✅ BarChart | ✅ Bar | ✅ ResponsiveBar |
| **Line Chart** (Burndown) | ✅ LineChart | ✅ Line | ✅ ResponsiveLine |
| **Area Chart** (Optional) | ✅ AreaChart | ✅ Line (filled) | ✅ ResponsiveArea |
| **Sparklines** (Mini trends) | ✅ LineChart | ❌ Need plugin | ✅ ResponsiveLine |

### Evaluation Criteria

| Criteria | Weight | Recharts | Chart.js | Nivo |
|----------|--------|----------|----------|------|
| **React-friendly** | High | ✅ 10/10 | ⚠️ 6/10 | ✅ 10/10 |
| **Bundle size** | High | ✅ 9/10 | ⚠️ 7/10 | ❌ 5/10 |
| **Ease of use** | High | ✅ 9/10 | ⚠️ 7/10 | ⚠️ 7/10 |
| **Responsive** | Medium | ✅ 10/10 | ⚠️ 7/10 | ✅ 10/10 |
| **Customization** | Medium | ✅ 8/10 | ✅ 10/10 | ✅ 10/10 |
| **Documentation** | Medium | ✅ 9/10 | ✅ 10/10 | ⚠️ 7/10 |
| **TypeScript** | Low | ✅ 8/10 | ✅ 10/10 | ✅ 10/10 |
| **Total** | - | **63/70** | **57/70** | **59/70** |

**Winner**: Recharts (90% score)

---

## 6. Implementation Plan

### Install Recharts

```bash
npm install recharts
```

### Create Chart Components

```
components/
├── charts/
│   ├── DonutChart.jsx       # Status breakdown
│   ├── BarChart.jsx          # Tasks per milestone
│   ├── LineChart.jsx         # Burndown chart
│   └── SparklineCard.jsx     # Mini trend in metric cards
```

### Shared Chart Theme

```javascript
// lib/chartTheme.js
export const chartColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#94a3b8',
};

export const chartConfig = {
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
  gridStyle: { strokeDasharray: '3 3', stroke: '#e5e7eb' },
  axisStyle: { fontSize: 12, fill: '#6b7280' },
};
```

### Example Usage in Dashboard

```jsx
// app/page.js
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';

export default async function DashboardPage() {
  const data = await fetchSheetData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DonutChart data={data.statusBreakdown} />
      <BarChart data={data.tasksByMilestone} />
      <LineChart data={data.burndown} className="md:col-span-2" />
    </div>
  );
}
```

---

## 7. Accessibility Enhancements

### Add ARIA Labels

```jsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart role="img" aria-label="Task status distribution">
    {/* ... */}
  </PieChart>
</ResponsiveContainer>
```

### Provide Text Alternative

```jsx
<div>
  <PieChart {...props} />
  <div className="sr-only">
    Task status: 30 To Do, 45 In Progress, 120 Done
  </div>
</div>
```

### Keyboard Navigation (Future Enhancement)

Consider adding focus states and keyboard controls for interactive charts.

---

## 8. Performance Optimization

### Lazy Load Charts

```jsx
import dynamic from 'next/dynamic';

const DonutChart = dynamic(() => import('@/components/charts/DonutChart'), {
  ssr: false, // Disable SSR for chart (optional)
  loading: () => <ChartSkeleton />,
});
```

**Use when**: Chart data depends on client-side state

### Memoize Chart Data

```jsx
import { useMemo } from 'react';

function ChartWrapper({ rawData }) {
  const chartData = useMemo(() => {
    return transformToChartFormat(rawData);
  }, [rawData]);
  
  return <BarChart data={chartData} />;
}
```

**Use when**: Expensive data transformations

---

## Alternative: Victory (Not Recommended)

**Why not considered**:
- Similar to Recharts but less popular (10k vs 23k stars)
- Heavier bundle (65KB vs 45KB)
- Less active development

---

## Final Recommendation

**Use Recharts** for SKLUM Dashboard:

1. ✅ Best React integration (declarative JSX)
2. ✅ Smallest bundle (45KB)
3. ✅ Covers all chart types needed
4. ✅ Responsive by default
5. ✅ Well-documented
6. ✅ Active community
7. ✅ SSR compatible with Next.js

**When to reconsider**:
- If need advanced interactivity → Switch to Nivo
- If need specific Chart.js plugin → Use Chart.js
- For now: Recharts is optimal ✅

---

## References

- [Recharts Official Docs](https://recharts.org/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Nivo Documentation](https://nivo.rocks/)
- [React Chart Libraries Comparison](https://formidable.com/blog/2023/react-charting-libraries/)
