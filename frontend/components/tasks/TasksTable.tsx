"use client";

import { useMemo, useState } from "react";

import {
  Button,
  Icon,
  StatusBadge,
  Tag,
} from "../sb/primitives";
import {
  STATUS_OPTIONS,
  dayLabel,
  fmtTime,
  priorityTone,
} from "../../lib/format";
import type { Task, TaskStatus } from "../../lib/types";

type StatusFilter = "all" | TaskStatus;

interface FilterOpt {
  value: StatusFilter;
  label: string;
  count: number;
}

interface Group {
  key: string;
  date: Date;
  label: string;
  items: Task[];
}

function groupByDay(tasks: Task[]): Group[] {
  const map = new Map<string, Group>();
  for (const task of tasks) {
    const d = new Date(task.created_at);
    if (Number.isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    if (!map.has(key)) {
      map.set(key, { key, date: d, items: [], label: dayLabel(d) });
    }
    map.get(key)!.items.push(task);
  }
  return [...map.values()].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

export interface TasksTableProps {
  tasks: Task[];
  onRowClick: (taskId: number) => void;
  onNew: () => void;
}

export default function TasksTable({ tasks, onRowClick, onNew }: TasksTableProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => filter === "all" || t.status === filter)
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          t.priority.includes(q) ||
          t.status.includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [tasks, filter, query]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const filterOpts: FilterOpt[] = [
    { value: "all", label: "all", count: tasks.length },
    ...STATUS_OPTIONS.map<FilterOpt>((s) => ({
      value: s,
      label: s,
      count: tasks.filter((t) => t.status === s).length,
    })),
  ];

  return (
    <div className="sb-listing">
      <div className="sb-pagehead">
        <div>
          <div className="sb-eyebrow">log</div>
          <h1 className="sb-pagehead__title">all tasks</h1>
          <p className="sb-pagehead__sub">
            {filtered.length} of {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="sb-pagehead__actions">
          <div className="sb-search">
            <Icon name="search" />
            <input
              className="sb-search__input"
              placeholder="search title, description, status…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="primary" icon={<Icon name="plus" />} onClick={onNew}>
            new task
          </Button>
        </div>
      </div>

      <div className="sb-filterbar">
        <Icon name="filter" />
        <div className="sb-filterbar__chips">
          {filterOpts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`sb-chip${filter === opt.value ? " is-active" : ""}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
              <span className="sb-chip__count">{opt.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="sb-list-empty">
          <p>no tasks match.</p>
          <button
            type="button"
            className="sb-linkbtn"
            onClick={() => {
              setFilter("all");
              setQuery("");
            }}
          >
            clear filters
          </button>
        </div>
      ) : (
        <div className="sb-list">
          {groups.map((g) => (
            <section key={g.key}>
              <header className="sb-list__daterow">
                <span className="sb-list__date">{g.label}</span>
                <span className="sb-list__rule" />
                <span className="sb-list__daymeta">
                  {g.items.length} task{g.items.length === 1 ? "" : "s"}
                </span>
              </header>
              <ul className="sb-list__items">
                {g.items.map((task) => (
                  <ListRow
                    key={task.id}
                    task={task}
                    onClick={() => onRowClick(task.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ListRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <li
      className="sb-row"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <span className="sb-row__time">{fmtTime(task.created_at)}</span>
      <span className="sb-row__body">
        <span className="sb-row__title">{task.title}</span>
        {task.description && (
          <span className="sb-row__notes">{task.description}</span>
        )}
      </span>
      <span className="sb-row__meta">
        <Tag tone={priorityTone(task.priority)}>{task.priority}</Tag>
        {(task.start_date || task.end_date) && (
          <span className="sb-row__dur">
            <Icon name="clock" size={11} />
            {task.start_date || "—"}
            {task.end_date && task.end_date !== task.start_date
              ? ` → ${task.end_date}`
              : ""}
          </span>
        )}
        <StatusBadge status={task.status} />
      </span>
      <span className="sb-row__chev" aria-hidden>
        <Icon name="chevron" />
      </span>
    </li>
  );
}
