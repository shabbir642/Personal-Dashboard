"use client";

import useSWR from "swr";

import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import {
  CompletionLineChart,
  DEFAULT_STATUS_COLORS,
  PriorityBarChart,
  StatusPieChart,
} from "../../components/analytics/AnalyticsCharts";
import {
  fetchCompletionOverTime,
  fetchCountByPriority,
  fetchCountByStatus,
} from "../../lib/api";
import { SWR_KEYS } from "../../lib/swrKeys";

const PRIORITY_BAR_COLOR = "#0f766e";

export default function AnalyticsPage() {
  const { data: statusData = [], isLoading: statusLoading } = useSWR(
    SWR_KEYS.analyticsStatus,
    fetchCountByStatus,
  );
  const { data: priorityData = [], isLoading: priorityLoading } = useSWR(
    SWR_KEYS.analyticsPriority,
    fetchCountByPriority,
  );
  const { data: completionData = [], isLoading: completionLoading } = useSWR(
    SWR_KEYS.analyticsCompletion,
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
                  <StatusPieChart
                    data={statusData}
                    height={300}
                    outerRadius={100}
                    showLegend
                  />
                  <div className="legend-row">
                    {statusData.map((item, index) => (
                      <span key={item.label} className="legend-chip">
                        <span
                          className="legend-dot"
                          style={{
                            background:
                              DEFAULT_STATUS_COLORS[index % DEFAULT_STATUS_COLORS.length],
                          }}
                        />
                        {item.label}: {item.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="card chart-card">
              <h3>Tasks By Priority</h3>
              <div className="chart-wrap">
                <PriorityBarChart data={priorityData} height={300} color={PRIORITY_BAR_COLOR} />
              </div>
            </article>
          </section>

          <section className="card chart-card">
            <h3>Task Completion Over Time</h3>
            <div className="chart-wrap">
              <CompletionLineChart data={completionData} height={320} color="#0ea5e9" />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
