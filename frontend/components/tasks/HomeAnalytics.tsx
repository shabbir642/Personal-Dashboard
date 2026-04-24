"use client";

import useSWR from "swr";

import { Button, Card, Icon, StatusBadge, Tag } from "../sb/primitives";
import {
  PRIORITY_OPTIONS,
  dayLabel,
  fmtDate,
  fmtRelative,
  priorityTone,
  weekDelta,
} from "../../lib/format";
import { fetchCompletionOverTime, fetchTasks } from "../../lib/api";
import { SWR_KEYS } from "../../lib/swrKeys";
import type { Task, TaskPriority } from "../../lib/types";

const TREND_DAYS = 14;

interface TrendBucket {
  date: Date;
  count: number;
}

function buildTrend(tasks: Task[], days: number): TrendBucket[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: TrendBucket[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, count: 0 };
  });
  for (const task of tasks) {
    const d = new Date(task.created_at);
    if (Number.isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const idx = buckets.findIndex((b) => b.date.getTime() === d.getTime());
    if (idx >= 0) buckets[idx].count += 1;
  }
  return buckets;
}

interface PriorityDist {
  id: TaskPriority;
  label: string;
  count: number;
  pct: number;
}

function buildPriorityDist(tasks: Task[]): PriorityDist[] {
  const counts: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0 };
  for (const t of tasks) counts[t.priority] += 1;
  const total = tasks.length || 1;
  return PRIORITY_OPTIONS.map((id) => ({
    id,
    label: id,
    count: counts[id],
    pct: counts[id] / total,
  }));
}

interface WeekSplit {
  thisWeek: number;
  lastWeek: number;
  thisDone: number;
  lastDone: number;
}

function buildWeekSplit(tasks: Task[]): WeekSplit {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 6);
  thisWeekStart.setHours(0, 0, 0, 0);
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 13);
  lastWeekStart.setHours(0, 0, 0, 0);

  let thisWeek = 0,
    lastWeek = 0,
    thisDone = 0,
    lastDone = 0;
  for (const t of tasks) {
    const d = new Date(t.created_at);
    if (Number.isNaN(d.getTime())) continue;
    if (d >= thisWeekStart) {
      thisWeek += 1;
      if (t.status === "done") thisDone += 1;
    } else if (d >= lastWeekStart) {
      lastWeek += 1;
      if (t.status === "done") lastDone += 1;
    }
  }
  return { thisWeek, lastWeek, thisDone, lastDone };
}

export default function HomeAnalytics({
  onOpenTask,
  onOpenList,
  onNew,
}: {
  onOpenTask: (taskId: number) => void;
  onOpenList: () => void;
  onNew: () => void;
}) {
  const { data: page, isLoading } = useSWR(SWR_KEYS.tasks, () =>
    fetchTasks(0, 500),
  );
  // Prefetch completion-over-time to warm the cache; not strictly required here.
  useSWR(SWR_KEYS.analyticsCompletion, fetchCompletionOverTime);

  if (isLoading) {
    return <div className="sb-loading">loading analytics…</div>;
  }

  const tasks: Task[] = page?.items ?? [];
  if (tasks.length === 0) return <EmptyHome onNew={onNew} />;

  const trend = buildTrend(tasks, TREND_DAYS);
  const dist = buildPriorityDist(tasks);
  const wk = buildWeekSplit(tasks);

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const recent = [...tasks]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="sb-home">
      <div className="sb-pagehead">
        <div>
          <div className="sb-eyebrow">overview · last {TREND_DAYS} days</div>
          <h1 className="sb-pagehead__title">good to see you.</h1>
          <p className="sb-pagehead__sub">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} tracked ·{" "}
            {doneCount} done · {inProgressCount} in progress.
          </p>
        </div>
        <div className="sb-pagehead__actions">
          <Button variant="ghost" onClick={onOpenList}>
            view log <Icon name="chevron" />
          </Button>
          <Button variant="primary" icon={<Icon name="plus" />} onClick={onNew}>
            new task
          </Button>
        </div>
      </div>

      <div className="sb-grid sb-grid--4">
        <StatTile label="tasks" value={tasks.length} sub={`${TREND_DAYS} days`} />
        <StatTile label="done" value={doneCount} sub="completed" />
        <StatTile
          label="this week"
          value={wk.thisWeek}
          sub={weekDelta(wk.thisWeek, wk.lastWeek)}
          trend={wk.thisWeek - wk.lastWeek}
        />
        <StatTile
          label="avg / day"
          value={(tasks.length / TREND_DAYS).toFixed(1)}
          sub="tasks"
        />
      </div>

      <div className="sb-grid sb-grid--2">
        <Card className="sb-panel">
          <PanelHead
            title="activity trend"
            sub={`tasks created per day · ${TREND_DAYS}d`}
          />
          <TrendChart buckets={trend} />
          <TrendAxis buckets={trend} />
        </Card>
        <Card className="sb-panel">
          <PanelHead
            title="by priority"
            sub={`across ${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
          />
          <PriorityBars dist={dist} />
        </Card>
      </div>

      <div className="sb-grid sb-grid--2">
        <Card className="sb-panel">
          <PanelHead title="this week vs last" sub="side-by-side" />
          <WeekCompare wk={wk} />
        </Card>
        <Card className="sb-panel">
          <PanelHead
            title="recent"
            sub="latest tasks"
            action={
              <button type="button" className="sb-linkbtn" onClick={onOpenList}>
                all →
              </button>
            }
          />
          <ul className="sb-recent">
            {recent.map((t) => (
              <li
                key={t.id}
                className="sb-recent__row"
                onClick={() => onOpenTask(t.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpenTask(t.id);
                }}
              >
                <span className="sb-recent__time">
                  {fmtRelative(t.created_at)}
                </span>
                <span className="sb-recent__title">{t.title}</span>
                <Tag tone={priorityTone(t.priority)}>{t.priority}</Tag>
                <span className="sb-recent__dur">
                  <StatusBadge status={t.status} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string | number;
  sub: string;
  trend?: number;
}) {
  const arrow =
    trend == null ? null : trend > 0 ? "arrow-up" : trend < 0 ? "arrow-down" : null;
  return (
    <Card className="sb-stat">
      <div className="sb-stat__label">{label}</div>
      <div className="sb-stat__value">{value}</div>
      <div className="sb-stat__sub">
        {arrow && <Icon name={arrow} size={11} />}
        <span>{sub}</span>
      </div>
    </Card>
  );
}

function PanelHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sb-panel__head">
      <div>
        <h3 className="sb-panel__title">{title}</h3>
        {sub && <div className="sb-panel__sub">{sub}</div>}
      </div>
      {action}
    </header>
  );
}

function TrendChart({ buckets }: { buckets: TrendBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const H = 120;
  const W = 100;
  return (
    <div className="sb-trend">
      <svg
        className="sb-trend__svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          x2={W}
          y1={H - 0.5}
          y2={H - 0.5}
          stroke="var(--rule)"
          strokeWidth="0.5"
        />
        {[0.25, 0.5, 0.75].map((g, i) => (
          <line
            key={i}
            x1="0"
            x2={W}
            y1={H - H * g}
            y2={H - H * g}
            stroke="var(--rule-faint)"
            strokeWidth="0.4"
            strokeDasharray="0.8 1.2"
          />
        ))}
        {buckets.map((b, i) => {
          const bw = W / buckets.length;
          const h = (b.count / max) * (H - 8);
          const x = i * bw + bw * 0.25;
          const w = bw * 0.5;
          const y = H - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="var(--accent)" rx="0.3" />
              {b.count > 0 && (
                <text
                  x={x + w / 2}
                  y={y - 2}
                  textAnchor="middle"
                  className="sb-trend__num"
                >
                  {b.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TrendAxis({ buckets }: { buckets: TrendBucket[] }) {
  return (
    <div className="sb-trend__axis">
      {buckets.map((b, i) => {
        const show =
          i === 0 ||
          i === buckets.length - 1 ||
          i === Math.floor(buckets.length / 2);
        return (
          <span key={i} className="sb-trend__tick">
            {show ? fmtDate(b.date) : ""}
          </span>
        );
      })}
    </div>
  );
}

function PriorityBars({ dist }: { dist: PriorityDist[] }) {
  const max = Math.max(...dist.map((d) => d.count), 1);
  return (
    <ul className="sb-cats">
      {dist.map((d) => (
        <li key={d.id} className="sb-cats__row">
          <span>
            <Tag tone={priorityTone(d.id)}>{d.label}</Tag>
          </span>
          <span className="sb-cats__track">
            <span
              className="sb-cats__fill"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </span>
          <span className="sb-cats__count">{d.count}</span>
          <span className="sb-cats__pct">{Math.round(d.pct * 100)}%</span>
        </li>
      ))}
    </ul>
  );
}

function WeekCompare({ wk }: { wk: WeekSplit }) {
  const maxCount = Math.max(wk.thisWeek, wk.lastWeek, 1);
  const maxDone = Math.max(wk.thisDone, wk.lastDone, 1);
  return (
    <div className="sb-wk">
      <div className="sb-wk__row">
        <span className="sb-wk__label">this week</span>
        <span className="sb-wk__track">
          <span
            className="sb-wk__fill sb-wk__fill--now"
            style={{ width: `${(wk.thisWeek / maxCount) * 100}%` }}
          />
        </span>
        <span className="sb-wk__val">{wk.thisWeek} tasks</span>
      </div>
      <div className="sb-wk__row">
        <span className="sb-wk__label">last week</span>
        <span className="sb-wk__track">
          <span
            className="sb-wk__fill sb-wk__fill--prev"
            style={{ width: `${(wk.lastWeek / maxCount) * 100}%` }}
          />
        </span>
        <span className="sb-wk__val">{wk.lastWeek} tasks</span>
      </div>
      <div className="sb-wk__row">
        <span className="sb-wk__label">this week</span>
        <span className="sb-wk__track">
          <span
            className="sb-wk__fill sb-wk__fill--now"
            style={{ width: `${(wk.thisDone / maxDone) * 100}%` }}
          />
        </span>
        <span className="sb-wk__val">{wk.thisDone} done</span>
      </div>
      <div className="sb-wk__row">
        <span className="sb-wk__label">last week</span>
        <span className="sb-wk__track">
          <span
            className="sb-wk__fill sb-wk__fill--prev"
            style={{ width: `${(wk.lastDone / maxDone) * 100}%` }}
          />
        </span>
        <span className="sb-wk__val">{wk.lastDone} done</span>
      </div>
    </div>
  );
}

function EmptyHome({ onNew }: { onNew: () => void }) {
  return (
    <div className="sb-empty">
      <div aria-hidden>
        <svg viewBox="0 0 200 120" className="sb-empty__art">
          <defs>
            <pattern
              id="paper-stripes"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="4"
                stroke="var(--rule-faint)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            x="0.5"
            y="0.5"
            width="199"
            height="119"
            fill="url(#paper-stripes)"
            stroke="var(--rule)"
          />
          <line
            x1="20"
            y1="90"
            x2="180"
            y2="90"
            stroke="var(--rule)"
            strokeWidth="0.8"
          />
          <line
            x1="20"
            y1="30"
            x2="20"
            y2="90"
            stroke="var(--rule)"
            strokeWidth="0.8"
          />
          <text x="100" y="60" textAnchor="middle" className="sb-empty__arttxt">
            no data yet
          </text>
        </svg>
      </div>
      <div>
        <div className="sb-eyebrow">empty log</div>
        <h2 className="sb-empty__title">nothing to show, yet.</h2>
        <p className="sb-empty__sub">
          analytics appear once you&apos;ve logged a few tasks. start with one —
          something you&apos;re shipping, something you&apos;re learning, something
          you&apos;re chasing down.
        </p>
        <div className="sb-empty__actions">
          <Button variant="primary" icon={<Icon name="plus" />} onClick={onNew}>
            log first task
          </Button>
          <span className="sb-empty__hint">
            or press <kbd className="sb-kbd">N</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

export { dayLabel };
