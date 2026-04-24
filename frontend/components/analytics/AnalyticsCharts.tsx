"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyState from "../EmptyState";
import { CompletionOverTimePoint, CountByLabel } from "../../lib/types";

// Muted sb-themed palette (doesn't swap per theme but reads fine against any bg).
const DEFAULT_STATUS_COLORS = ["#1e3a66", "#6b7a8c", "#3a3e44"];

function isCountDataEmpty(items: CountByLabel[]) {
  return items.length === 0 || items.every((item) => item.count === 0);
}

export function StatusPieChart({
  data,
  height = 220,
  outerRadius = 70,
  colors = DEFAULT_STATUS_COLORS,
  showLegend = true,
}: {
  data: CountByLabel[];
  height?: number;
  outerRadius?: number;
  colors?: string[];
  showLegend?: boolean;
}) {
  if (isCountDataEmpty(data)) {
    return <EmptyState text="No status data yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" outerRadius={outerRadius}>
          {data.map((item, index) => (
            <Cell key={item.label} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PriorityBarChart({
  data,
  height = 220,
  color = "#1e3a66",
}: {
  data: CountByLabel[];
  height?: number;
  color?: string;
}) {
  if (isCountDataEmpty(data)) {
    return <EmptyState text="No priority data yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--rule-faint)" />
        <XAxis dataKey="label" stroke="var(--ink-muted)" />
        <YAxis allowDecimals={false} stroke="var(--ink-muted)" />
        <Tooltip />
        <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionLineChart({
  data,
  height = 240,
  color = "#1e3a66",
  showLegend = true,
}: {
  data: CompletionOverTimePoint[];
  height?: number;
  color?: string;
  showLegend?: boolean;
}) {
  if (data.length === 0) {
    return <EmptyState text="No completed tasks yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--rule-faint)" />
        <XAxis dataKey="date" stroke="var(--ink-muted)" />
        <YAxis allowDecimals={false} stroke="var(--ink-muted)" />
        <Tooltip />
        {showLegend && <Legend />}
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export { DEFAULT_STATUS_COLORS };
