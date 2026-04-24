"use client";

import useSWR from "swr";

import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";
import {
  CompletionLineChart,
  PriorityBarChart,
  StatusPieChart,
} from "../analytics/AnalyticsCharts";
import {
  fetchCompletionOverTime,
  fetchCountByPriority,
  fetchCountByStatus,
} from "../../lib/api";
import { SWR_KEYS } from "../../lib/swrKeys";

export default function HomeAnalytics({ onCreateTask }: { onCreateTask: () => void }) {
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
  const empty =
    !loading &&
    (statusData.length === 0 || statusData.every((i) => i.count === 0)) &&
    (priorityData.length === 0 || priorityData.every((i) => i.count === 0)) &&
    completionData.length === 0;

  return (
    <section className="card peaceful-hero">
      <h2>Home Analytics</h2>
      <p className="muted">A calm overview of your task progress.</p>

      {loading ? (
        <LoadingState text="Loading home analytics..." />
      ) : empty ? (
        <div className="center-cta-wrap">
          <EmptyState text="No analytics yet. Create your first task to get started." />
          <button type="button" onClick={onCreateTask}>
            Create Task
          </button>
        </div>
      ) : (
        <div className="home-analytics-grid">
          <article className="analytics-mini-card">
            <h3>By Status</h3>
            <div className="mini-chart">
              <StatusPieChart data={statusData} />
            </div>
          </article>

          <article className="analytics-mini-card">
            <h3>By Priority</h3>
            <div className="mini-chart">
              <PriorityBarChart data={priorityData} />
            </div>
          </article>

          <article className="analytics-mini-card analytics-wide-card">
            <h3>Completion Trend</h3>
            <div className="mini-chart wide-chart">
              <CompletionLineChart data={completionData} />
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
