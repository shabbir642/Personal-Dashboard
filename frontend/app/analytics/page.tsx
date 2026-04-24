"use client";

import useSWR from "swr";

import { Card } from "../../components/sb/primitives";
import {
  CompletionLineChart,
  PriorityBarChart,
  StatusPieChart,
} from "../../components/analytics/AnalyticsCharts";
import {
  fetchCompletionOverTime,
  fetchCountByPriority,
  fetchCountByStatus,
} from "../../lib/api";
import { SWR_KEYS } from "../../lib/swrKeys";

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
    <div>
      <div className="sb-pagehead">
        <div>
          <div className="sb-eyebrow">analytics</div>
          <h1 className="sb-pagehead__title">charts.</h1>
          <p className="sb-pagehead__sub">distribution and completion trends.</p>
        </div>
      </div>

      {loading ? (
        <div className="sb-loading">loading charts…</div>
      ) : (
        <>
          <div className="sb-charts-grid">
            <Card className="sb-panel">
              <header className="sb-panel__head">
                <div>
                  <h3 className="sb-panel__title">by status</h3>
                  <div className="sb-panel__sub">share of tasks</div>
                </div>
              </header>
              <div className="sb-chart-wrap">
                <StatusPieChart data={statusData} height={260} outerRadius={90} />
              </div>
            </Card>

            <Card className="sb-panel">
              <header className="sb-panel__head">
                <div>
                  <h3 className="sb-panel__title">by priority</h3>
                  <div className="sb-panel__sub">count by bucket</div>
                </div>
              </header>
              <div className="sb-chart-wrap">
                <PriorityBarChart data={priorityData} height={260} />
              </div>
            </Card>
          </div>

          <Card className="sb-panel">
            <header className="sb-panel__head">
              <div>
                <h3 className="sb-panel__title">completion over time</h3>
                <div className="sb-panel__sub">tasks marked done · daily</div>
              </div>
            </header>
            <div className="sb-chart-wrap" style={{ height: 320 }}>
              <CompletionLineChart data={completionData} height={320} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
