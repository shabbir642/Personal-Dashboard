"use client";

import { FormEvent, useEffect, useState } from "react";

import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";
import TaskForm from "./TaskForm";
import {
  createTaskLog,
  fetchTaskById,
  fetchTaskLogs,
  generateTaskAIInsight,
  updateTask,
} from "../../lib/api";
import {
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

  const [basicForm, setBasicForm] = useState<CreateTaskPayload | null>(null);
  const [logForm, setLogForm] = useState<TaskLogPayload>(defaultLogForm);

  const [savingBasic, setSavingBasic] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [addingLog, setAddingLog] = useState(false);
  const [insightCategory, setInsightCategory] = useState<string>("general");
  const [customInsightCategory, setCustomInsightCategory] = useState<string>("");

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
      onTaskChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save basic task info.");
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Task Details</h2>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {loading || !task || !basicForm ? (
          <LoadingState text="Loading task details..." />
        ) : (
          <>
            <section className="card section-card">
              <h3>Section 1: Basic Info</h3>
              <TaskForm
                value={basicForm}
                onChange={setBasicForm}
                onSubmit={onSaveBasicInfo}
                submitting={savingBasic}
                submitLabel="Save Basic Info"
                submittingLabel="Saving..."
                maxDescriptionLength={maxDescriptionLength}
              />
            </section>

            <section className="card section-card">
              <div className="insight-header-row">
                <h3>Section 2: Deep Insight</h3>
                <div className="insight-actions">
                  <label className="insight-category-label">
                    Focus Category
                    <select
                      value={insightCategory}
                      onChange={(e) => setInsightCategory(e.target.value)}
                    >
                      {INSIGHT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  {insightCategory === "custom" && (
                    <label className="insight-category-label">
                      Custom Category
                      <input
                        value={customInsightCategory}
                        onChange={(e) => setCustomInsightCategory(e.target.value)}
                        placeholder="e.g. data science, sales ops"
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => void onGetDeepInsight()}
                    disabled={
                      loadingInsight ||
                      (insightCategory === "custom" && !customInsightCategory.trim())
                    }
                  >
                    {loadingInsight ? "Generating..." : "Get Deep Insight"}
                  </button>
                </div>
              </div>
              <p className="muted insight-hint">
                AI keeps suggestions mostly in your selected category (70%) and separates
                surrounding-category extras (30%). Add a meaningful description before
                generating.
              </p>

              {insight ? (
                <div className="ai-insight-grid">
                  <article className="ai-insight-card">
                    <h4>Overview</h4>
                    <p>{insight.overview}</p>
                  </article>
                  <article className="ai-insight-card">
                    <h4>Suggestions (70%)</h4>
                    <p>{parsed?.primary || insight.suggestions}</p>
                  </article>
                  <article className="ai-insight-card">
                    <h4>Impact</h4>
                    <p>{insight.impact}</p>
                  </article>
                  <article className="ai-insight-card">
                    <h4>Skills Improvement</h4>
                    <p>{insight.skills_improvement}</p>
                  </article>
                  <article className="ai-insight-card ai-insight-card-wide">
                    <h4>Extras (30%)</h4>
                    <p>{parsed?.extras || "No surrounding-category extras were returned."}</p>
                  </article>
                </div>
              ) : (
                <EmptyState text="No deep insight yet. Click 'Get Deep Insight' to generate AI output." />
              )}

              <div className="logs-section">
                <h4>Issues Faced & Resolutions</h4>
                {logs.length === 0 ? (
                  <EmptyState text="No issues logged yet." />
                ) : (
                  <div className="log-list">
                    {logs.map((log) => (
                      <article className="log-item" key={log.id}>
                        <p>
                          <strong>Issue:</strong> {log.issue}
                        </p>
                        <p>
                          <strong>Resolution:</strong> {log.resolution || "-"}
                        </p>
                        <p className="meta">{new Date(log.created_at).toLocaleString()}</p>
                      </article>
                    ))}
                  </div>
                )}

                <form className="form-grid" onSubmit={onAddLog}>
                  <label>
                    New Issue
                    <textarea
                      value={logForm.issue}
                      onChange={(e) => setLogForm((p) => ({ ...p, issue: e.target.value }))}
                      rows={2}
                      required
                    />
                  </label>

                  <label>
                    Resolution
                    <textarea
                      value={logForm.resolution || ""}
                      onChange={(e) =>
                        setLogForm((p) => ({
                          ...p,
                          resolution: e.target.value === "" ? null : e.target.value,
                        }))
                      }
                      rows={2}
                    />
                  </label>

                  <button type="submit" disabled={addingLog}>
                    {addingLog ? "Adding..." : "Add Task Log"}
                  </button>
                </form>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
