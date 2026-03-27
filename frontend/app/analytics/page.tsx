"use client";

import useSWR from "swr";
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

import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import { fetchCompletionOverTime, fetchCountByPriority, fetchCountByStatus } from "../../lib/api";

const STATUS_COLORS = ["#0ea5e9", "#f59e0b", "#22c55e"];
const PRIORITY_BAR_COLOR = "#0f766e";

export default function AnalyticsPage() {
  const { data: statusData = [], isLoading: statusLoading } = useSWR("analytics-status", fetchCountByStatus);
  const { data: priorityData = [], isLoading: priorityLoading } = useSWR("analytics-priority", fetchCountByPriority);
  const { data: completionData = [], isLoading: completionLoading } = useSWR(
    "analytics-completion",
    fetchCompletionOverTime,
  );

  const loading = statusLoading || priorityLoading || completionLoading;

  return (
    <main className="container">
      <section className="card">
        <h2>Analytics</h2>
        <p className="muted">Overview of task distribution and completion trends.</p>
      </section>

      {loading ? (
        <section className="card">
          <LoadingState text="Loading analytics..." />
        </section>
      ) : (
        <>
          <section className="chart-grid">
            <article className="card chart-card">
              <h3>Tasks By Status</h3>
              {statusData.length === 0 || statusData.every((item) => item.count === 0) ? (
                <EmptyState text="No status data available yet." />
              ) : (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusData} dataKey="count" nameKey="label" outerRadius={100}>
                        {statusData.map((item, index) => (
                          <Cell key={item.label} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="legend-row">
                    {statusData.map((item, index) => (
                      <span key={item.label} className="legend-chip">
                        <span className="legend-dot" style={{ background: STATUS_COLORS[index % STATUS_COLORS.length] }} />
                        {item.label}: {item.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="card chart-card">
              <h3>Tasks By Priority</h3>
              {priorityData.length === 0 || priorityData.every((item) => item.count === 0) ? (
                <EmptyState text="No priority data available yet." />
              ) : (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={PRIORITY_BAR_COLOR} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>
          </section>

          <section className="card chart-card">
            <h3>Task Completion Over Time</h3>
            {completionData.length === 0 ? (
              <EmptyState text="No completed tasks yet." />
            ) : (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
