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

const DEFAULT_STATUS_COLORS = ["#7cc7b6", "#f6d28b", "#9fd8a6"];

function isCountDataEmpty(items: CountByLabel[]) {
  return items.length === 0 || items.every((item) => item.count === 0);
}

export function StatusPieChart({
  data,
  height = 220,
  outerRadius = 70,
  colors = DEFAULT_STATUS_COLORS,
  showLegend = false,
}: {
  data: CountByLabel[];
  height?: number;
  outerRadius?: number;
  colors?: string[];
  showLegend?: boolean;
}) {
  if (isCountDataEmpty(data)) {
    return <EmptyState text="No status data available yet." />;
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
  color = "#83c5be",
}: {
  data: CountByLabel[];
  height?: number;
  color?: string;
}) {
  if (isCountDataEmpty(data)) {
    return <EmptyState text="No priority data available yet." />;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionLineChart({
  data,
  height = 240,
  color = "#6ba3be",
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        {showLegend && <Legend />}
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export { DEFAULT_STATUS_COLORS };
