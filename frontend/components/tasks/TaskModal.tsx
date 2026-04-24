"use client";

import { FormEvent, useEffect, useState } from "react";

import TaskForm from "./TaskForm";
import {
  Button,
  Field,
  Icon,
  Modal,
  ModalHeader,
  StatusBadge,
  Tag,
} from "../sb/primitives";
import { fmtRelative, priorityTone } from "../../lib/format";
import {
  createTaskLog,
  fetchTaskById,
  fetchTaskLogs,
  generateTaskAIInsight,
  updateTask,
} from "../../lib/api";
import type {
  CreateTaskPayload,
  Task,
  TaskAIInsight,
  TaskLog,
  TaskLogPayload,
} from "../../lib/types";

const INSIGHT_CATEGORIES = [
  "general",
  "product",
  "engineering",
  "design",
  "marketing",
  "operations",
  "custom",
] as const;

type Mode = "view" | "edit";

const defaultLogForm: TaskLogPayload = { issue: "", resolution: null };

function parseSuggestionSections(suggestions: string) {
  const text = suggestions || "";
  const marker = "Extras (30%)";
  const idx = text.indexOf(marker);
  if (idx === -1) return { primary: text.trim(), extras: "" };
  return { primary: text.slice(0, idx).trim(), extras: text.slice(idx).trim() };
}

export interface TaskModalProps {
  taskId: number;
  minDescriptionLength: number;
  maxDescriptionLength: number;
  onClose: () => void;
  onTaskChanged: () => void;
  onError: (message: string | null) => void;
}

export default function TaskModal({
  taskId,
  minDescriptionLength,
  maxDescriptionLength,
  onClose,
  onTaskChanged,
  onError,
}: TaskModalProps) {
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [insight, setInsight] = useState<TaskAIInsight | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [mode, setMode] = useState<Mode>("view");

  const [basicForm, setBasicForm] = useState<CreateTaskPayload | null>(null);
  const [logForm, setLogForm] = useState<TaskLogPayload>(defaultLogForm);

  const [savingBasic, setSavingBasic] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [addingLog, setAddingLog] = useState(false);
  const [insightCategory, setInsightCategory] = useState("general");
  const [customInsightCategory, setCustomInsightCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      onError(null);
      try {
        const [loadedTask, loadedLogs] = await Promise.all([
          fetchTaskById(taskId),
          fetchTaskLogs(taskId),
        ]);
        if (cancelled) return;
        setTask(loadedTask);
        setInsight(loadedTask.ai_insight);
        setLogs(loadedLogs);
        setBasicForm({
          title: loadedTask.title,
          description: loadedTask.description || "",
          status: loadedTask.status,
          priority: loadedTask.priority,
          start_date: loadedTask.start_date,
          end_date: loadedTask.end_date,
        });
        setLogForm(defaultLogForm);
      } catch (err) {
        if (cancelled) return;
        onError(err instanceof Error ? err.message : "Could not load task details.");
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [taskId, onClose, onError]);

  async function onSaveBasicInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task || !basicForm) return;
    setSavingBasic(true);
    onError(null);
    try {
      const updated = await updateTask(task.id, {
        title: (basicForm.title || "").trim(),
        description: basicForm.description || "",
        status: basicForm.status,
        priority: basicForm.priority,
        start_date: basicForm.start_date,
        end_date: basicForm.end_date,
      });
      setTask(updated);
      setMode("view");
      onTaskChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save task.");
    } finally {
      setSavingBasic(false);
    }
  }

  async function onGetDeepInsight() {
    if (!task) return;
    const description = (task.description || "").trim();
    if (description.length < minDescriptionLength) {
      onError(
        `Please add at least ${minDescriptionLength} characters in description before generating deep insight.`,
      );
      return;
    }
    const selectedCategory =
      insightCategory === "custom" ? customInsightCategory.trim() : insightCategory;
    if (!selectedCategory) {
      onError("Please enter a custom category for deep insight.");
      return;
    }
    setLoadingInsight(true);
    onError(null);
    try {
      const next = await generateTaskAIInsight(task.id, selectedCategory);
      setInsight(next);
      setTask((prev) => (prev ? { ...prev, ai_insight: next } : prev));
      onTaskChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not generate deep insight.");
    } finally {
      setLoadingInsight(false);
    }
  }

  async function onAddLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) return;
    if (!logForm.issue.trim()) {
      onError("Issue is required for task logs.");
      return;
    }
    setAddingLog(true);
    onError(null);
    try {
      const newLog = await createTaskLog(task.id, {
        issue: logForm.issue.trim(),
        resolution: logForm.resolution,
      });
      setLogs((prev) => [newLog, ...prev]);
      setLogForm(defaultLogForm);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not add task log.");
    } finally {
      setAddingLog(false);
    }
  }

  const parsed = insight ? parseSuggestionSections(insight.suggestions) : null;

  return (
    <Modal open={true} onClose={onClose} label="task details" width={720}>
      {loading || !task || !basicForm ? (
        <>
          <ModalHeader meta="task" title="loading…" onClose={onClose} />
          <div className="sb-loading">loading task details…</div>
        </>
      ) : mode === "edit" ? (
        <>
          <ModalHeader
            meta={`editing · #${task.id}`}
            title="edit task"
            onClose={() => setMode("view")}
          />
          <div className="sb-modal__body">
            <TaskForm
              value={basicForm}
              onChange={setBasicForm}
              onSubmit={onSaveBasicInfo}
              onCancel={() => setMode("view")}
              submitting={savingBasic}
              submitLabel="save changes"
              submittingLabel="saving…"
              maxDescriptionLength={maxDescriptionLength}
            />
          </div>
        </>
      ) : (
        <>
          <ModalHeader
            meta={`task · #${task.id}`}
            title={task.title}
            onClose={onClose}
          />
          <div className="sb-modal__body">
            <div className="sb-detail">
              <dl className="sb-detail__grid">
                <div className="sb-detail__cell">
                  <dt>priority</dt>
                  <dd>
                    <Tag tone={priorityTone(task.priority)}>{task.priority}</Tag>
                  </dd>
                </div>
                <div className="sb-detail__cell">
                  <dt>status</dt>
                  <dd>
                    <StatusBadge status={task.status} />
                  </dd>
                </div>
                <div className="sb-detail__cell">
                  <dt>start date</dt>
                  <dd>{task.start_date || "—"}</dd>
                </div>
                <div className="sb-detail__cell">
                  <dt>end date</dt>
                  <dd>{task.end_date || "—"}</dd>
                </div>
              </dl>

              <div className="sb-detail__notes">
                <div className="sb-field__label">description</div>
                {task.description ? (
                  <p className="sb-detail__notesbody">{task.description}</p>
                ) : (
                  <p className="sb-detail__notesempty">no description.</p>
                )}
              </div>

              <div className="sb-detail__meta">
                <span>created {fmtRelative(task.created_at)}</span>
                <span className="sb-detail__metadot">·</span>
                <span>id {task.id}</span>
              </div>
            </div>

            <section className="sb-insights">
              <header className="sb-insights__head">
                <div>
                  <h3 className="sb-insights__title">deep insight</h3>
                  <div className="sb-insights__sub">
                    70% focused on your category · 30% surrounding extras
                  </div>
                </div>
                <div className="sb-insights__actions">
                  <Field label="focus">
                    <select
                      className="sb-input"
                      value={insightCategory}
                      onChange={(e) => setInsightCategory(e.target.value)}
                    >
                      {INSIGHT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {insightCategory === "custom" && (
                    <Field label="custom">
                      <input
                        className="sb-input"
                        value={customInsightCategory}
                        onChange={(e) => setCustomInsightCategory(e.target.value)}
                        placeholder="data science, sales ops…"
                      />
                    </Field>
                  )}
                  <Button
                    variant="primary"
                    icon={<Icon name="sparkle" />}
                    onClick={() => void onGetDeepInsight()}
                    disabled={
                      loadingInsight ||
                      (insightCategory === "custom" &&
                        !customInsightCategory.trim())
                    }
                  >
                    {loadingInsight ? "generating…" : "generate"}
                  </Button>
                </div>
              </header>

              {insight ? (
                <div className="sb-insights__grid">
                  <article className="sb-insights__cell">
                    <div className="sb-insights__celllabel">overview</div>
                    <p className="sb-insights__cellbody">{insight.overview}</p>
                  </article>
                  <article className="sb-insights__cell">
                    <div className="sb-insights__celllabel">suggestions (70%)</div>
                    <p className="sb-insights__cellbody">
                      {parsed?.primary || insight.suggestions}
                    </p>
                  </article>
                  <article className="sb-insights__cell">
                    <div className="sb-insights__celllabel">impact</div>
                    <p className="sb-insights__cellbody">{insight.impact}</p>
                  </article>
                  <article className="sb-insights__cell">
                    <div className="sb-insights__celllabel">skills improvement</div>
                    <p className="sb-insights__cellbody">{insight.skills_improvement}</p>
                  </article>
                  <article className="sb-insights__cell sb-insights__cell--wide">
                    <div className="sb-insights__celllabel">extras (30%)</div>
                    <p className="sb-insights__cellbody">
                      {parsed?.extras ||
                        "no surrounding-category extras were returned."}
                    </p>
                  </article>
                </div>
              ) : (
                <p className="sb-detail__notesempty">
                  no deep insight yet. add a description and click generate.
                </p>
              )}
            </section>

            <section className="sb-logs">
              <header className="sb-logs__head">
                <h3 className="sb-logs__title">issues & resolutions</h3>
                <span className="sb-panel__sub">
                  {logs.length} log{logs.length === 1 ? "" : "s"}
                </span>
              </header>

              {logs.length > 0 && (
                <ul className="sb-logs__list">
                  {logs.map((log) => (
                    <li key={log.id} className="sb-logs__item">
                      <p className="sb-logs__row">
                        <span className="sb-logs__label">issue</span>
                        {log.issue}
                      </p>
                      <p className="sb-logs__row">
                        <span className="sb-logs__label">resolution</span>
                        {log.resolution || "—"}
                      </p>
                      <div className="sb-logs__meta">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form className="sb-logs__form" onSubmit={onAddLog}>
                <Field label="new issue">
                  <textarea
                    className="sb-input sb-input--ta"
                    value={logForm.issue}
                    onChange={(e) =>
                      setLogForm((p) => ({ ...p, issue: e.target.value }))
                    }
                    rows={2}
                    required
                  />
                </Field>
                <Field label="resolution" hint="optional">
                  <textarea
                    className="sb-input sb-input--ta"
                    value={logForm.resolution || ""}
                    onChange={(e) =>
                      setLogForm((p) => ({
                        ...p,
                        resolution: e.target.value === "" ? null : e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </Field>
                <div>
                  <Button
                    variant="secondary"
                    type="submit"
                    icon={<Icon name="plus" />}
                    disabled={addingLog}
                  >
                    {addingLog ? "adding…" : "add log"}
                  </Button>
                </div>
              </form>
            </section>
          </div>

          <footer className="sb-modal__footer">
            <div />
            <div className="sb-modal__footer-right">
              <Button variant="secondary" onClick={onClose}>
                close
              </Button>
              <Button
                variant="primary"
                icon={<Icon name="edit" />}
                onClick={() => setMode("edit")}
              >
                edit
              </Button>
            </div>
          </footer>
        </>
      )}
    </Modal>
  );
}
