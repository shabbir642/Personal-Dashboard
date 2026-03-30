"use client";

import { FormEvent, useMemo, useState } from "react";
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

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import {
  createTask,
  createTaskLog,
  fetchCompletionOverTime,
  fetchCountByPriority,
  fetchCountByStatus,
  fetchTaskById,
  fetchTaskLogs,
  fetchTasks,
  generateTaskAIInsight,
  updateTask,
} from "../lib/api";
import {
  CompletionOverTimePoint,
  CountByLabel,
  CreateTaskPayload,
  Task,
  TaskAIInsight,
  TaskLog,
  TaskLogPayload,
  TaskPriority,
  TaskStatus,
} from "../lib/types";

const PAGE_SIZE = 6;
const MIN_INSIGHT_DESCRIPTION_LENGTH = 30;
const STATUS_COLORS = ["#7cc7b6", "#f6d28b", "#9fd8a6"];
const INSIGHT_CATEGORIES = ["general", "product", "engineering", "design", "marketing", "operations", "custom"] as const;

const defaultTaskForm: CreateTaskPayload = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  start_date: null,
  end_date: null,
};

const defaultLogForm: TaskLogPayload = {
  issue: "",
  resolution: null,
};

type SortField = "created_at" | "title" | "priority" | "status" | "start_date" | "end_date";
type SortDirection = "asc" | "desc";

const priorityWeight: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function isCountDataEmpty(items: CountByLabel[]) {
  return items.length === 0 || items.every((item) => item.count === 0);
}

function isCompletionDataEmpty(items: CompletionOverTimePoint[]) {
  return items.length === 0;
}

function parseSuggestionSections(suggestions: string) {
  const text = suggestions || "";
  const extraMarker = "Extras (30%)";
  const markerIndex = text.indexOf(extraMarker);

  if (markerIndex === -1) {
    return {
      primary: text.trim(),
      extras: "",
    };
  }

  return {
    primary: text.slice(0, markerIndex).trim(),
    extras: text.slice(markerIndex).trim(),
  };
}

export default function HomePage() {
  const { data: tasks = [], isLoading, mutate } = useSWR("tasks", fetchTasks);
  const { data: statusData = [], isLoading: statusLoading } = useSWR("home-analytics-status", fetchCountByStatus);
  const { data: priorityData = [], isLoading: priorityLoading } = useSWR("home-analytics-priority", fetchCountByPriority);
  const { data: completionData = [], isLoading: completionLoading } = useSWR(
    "home-analytics-completion",
    fetchCompletionOverTime,
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskForm, setTaskForm] = useState<CreateTaskPayload>(defaultTaskForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskInsight, setSelectedTaskInsight] = useState<TaskAIInsight | null>(null);
  const [selectedTaskLogs, setSelectedTaskLogs] = useState<TaskLog[]>([]);

  const [basicForm, setBasicForm] = useState<CreateTaskPayload>(defaultTaskForm);
  const [logForm, setLogForm] = useState<TaskLogPayload>(defaultLogForm);

  const [savingBasic, setSavingBasic] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightCategory, setInsightCategory] = useState<string>("general");
  const [customInsightCategory, setCustomInsightCategory] = useState<string>("");
  const [addingLog, setAddingLog] = useState(false);

  const analyticsLoading = statusLoading || priorityLoading || completionLoading;
  const analyticsEmpty =
    !analyticsLoading && isCountDataEmpty(statusData) && isCountDataEmpty(priorityData) && isCompletionDataEmpty(completionData);

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);

      return matchesStatus && matchesPriority && matchesSearch;
    });

    return filtered.sort((a, b) => {
      let value = 0;

      if (sortField === "title") {
        value = a.title.localeCompare(b.title);
      } else if (sortField === "priority") {
        value = priorityWeight[a.priority] - priorityWeight[b.priority];
      } else if (sortField === "status") {
        value = a.status.localeCompare(b.status);
      } else if (sortField === "start_date") {
        value = (a.start_date || "").localeCompare(b.start_date || "");
      } else if (sortField === "end_date") {
        value = (a.end_date || "").localeCompare(b.end_date || "");
      } else {
        value = a.created_at.localeCompare(b.created_at);
      }

      return sortDirection === "asc" ? value : -value;
    });
  }, [tasks, statusFilter, priorityFilter, searchTerm, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visibleTasks.slice(start, start + PAGE_SIZE);
  }, [visibleTasks, currentPage]);
  const parsedSuggestionSections = selectedTaskInsight ? parseSuggestionSections(selectedTaskInsight.suggestions) : null;

  function onTaskFormChange(
    field: "title" | "description" | "start_date" | "end_date" | "status" | "priority",
    value: string,
  ) {
    setTaskForm((prev) => {
      if (field === "start_date" || field === "end_date") {
        return {
          ...prev,
          [field]: value === "" ? null : value,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function onBasicFormChange(
    field: "title" | "description" | "start_date" | "end_date" | "status" | "priority",
    value: string,
  ) {
    setBasicForm((prev) => {
      if (field === "start_date" || field === "end_date") {
        return {
          ...prev,
          [field]: value === "" ? null : value,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function onLogFormChange(field: keyof TaskLogPayload, value: string) {
    setLogForm((prev) => {
      if (field === "issue") {
        return {
          ...prev,
          issue: value,
        };
      }

      return {
        ...prev,
        resolution: value === "" ? null : value,
      };
    });
  }

  async function onCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskForm.title || !taskForm.title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTask({
        ...taskForm,
        title: taskForm.title.trim(),
        description: taskForm.description || "",
      });
      setTaskForm(defaultTaskForm);
      setShowCreateForm(false);
      await mutate();
    } catch {
      setError("Could not create task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function openTaskModal(taskId: number) {
    setIsModalOpen(true);
    setModalLoading(true);
    setError(null);

    try {
      const [task, logs] = await Promise.all([
        fetchTaskById(taskId),
        fetchTaskLogs(taskId),
      ]);

      setSelectedTask(task);
      setSelectedTaskInsight(task.ai_insight);
      setSelectedTaskLogs(logs);

      setBasicForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        start_date: task.start_date,
        end_date: task.end_date,
      });

      setLogForm(defaultLogForm);
    } catch {
      setError("Could not load task details.");
      closeTaskModal();
    } finally {
      setModalLoading(false);
    }
  }

  function closeTaskModal() {
    setIsModalOpen(false);
    setSelectedTask(null);
    setSelectedTaskInsight(null);
    setSelectedTaskLogs([]);
    setBasicForm(defaultTaskForm);
    setLogForm(defaultLogForm);
    setInsightCategory("general");
    setCustomInsightCategory("");
  }

  async function onSaveBasicInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;

    setSavingBasic(true);
    setError(null);

    try {
      const updated = await updateTask(selectedTask.id, {
        title: (basicForm.title || "").trim(),
        description: basicForm.description || "",
        status: basicForm.status,
        priority: basicForm.priority,
        start_date: basicForm.start_date,
        end_date: basicForm.end_date,
      });

      setSelectedTask(updated);
      await mutate();
    } catch {
      setError("Could not save basic task info.");
    } finally {
      setSavingBasic(false);
    }
  }

  async function onGetDeepInsight() {
    if (!selectedTask) return;
    const description = (selectedTask.description || "").trim();
    if (description.length < MIN_INSIGHT_DESCRIPTION_LENGTH) {
      setError(`Please add at least ${MIN_INSIGHT_DESCRIPTION_LENGTH} characters in description before generating deep insight.`);
      return;
    }

    setLoadingInsight(true);
    setError(null);

    try {
      const selectedCategory = insightCategory === "custom" ? customInsightCategory.trim() : insightCategory;
      if (!selectedCategory) {
        setError("Please enter a custom category for deep insight.");
        return;
      }
      const insight = await generateTaskAIInsight(selectedTask.id, selectedCategory);
      setSelectedTaskInsight(insight);
      setSelectedTask((prev) => (prev ? { ...prev, ai_insight: insight } : prev));
      await mutate();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not generate deep insight.");
      }
    } finally {
      setLoadingInsight(false);
    }
  }

  async function onAddLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    if (!logForm.issue || !logForm.issue.trim()) {
      setError("Issue is required for task logs.");
      return;
    }

    setAddingLog(true);
    setError(null);

    try {
      const newLog = await createTaskLog(selectedTask.id, {
        issue: logForm.issue.trim(),
        resolution: logForm.resolution,
      });

      setSelectedTaskLogs((prev) => [newLog, ...prev]);
      setLogForm(defaultLogForm);
    } catch {
      setError("Could not add task log.");
    } finally {
      setAddingLog(false);
    }
  }

  return (
    <main className="container">
      <section className="card peaceful-hero">
        <h2>Home Analytics</h2>
        <p className="muted">A calm overview of your task progress.</p>

        {analyticsLoading ? (
          <LoadingState text="Loading home analytics..." />
        ) : analyticsEmpty ? (
          <div className="center-cta-wrap">
            <EmptyState text="No analytics yet. Create your first task to get started." />
            <button type="button" onClick={() => setShowCreateForm(true)}>
              Create Task
            </button>
          </div>
        ) : (
          <div className="home-analytics-grid">
            <article className="analytics-mini-card">
              <h3>By Status</h3>
              <div className="mini-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="label" outerRadius={70}>
                      {statusData.map((item, index) => (
                        <Cell key={item.label} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="analytics-mini-card">
              <h3>By Priority</h3>
              <div className="mini-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#83c5be" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="analytics-mini-card analytics-wide-card">
              <h3>Completion Trend</h3>
              <div className="mini-chart wide-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#6ba3be" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        )}
      </section>

      {!analyticsEmpty && (
        <section className="home-menu-bar card">
          <button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? "Close Create Task" : "Create Task"}
          </button>
        </section>
      )}

      {showCreateForm && (
        <section className="card">
          <h2>Create Task</h2>
          <form className="form-grid" onSubmit={onCreateTask}>
            <label>
              Title
              <input
                value={taskForm.title ?? ""}
                onChange={(e) => onTaskFormChange("title", e.target.value)}
                placeholder="Task title"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={taskForm.description ?? ""}
                onChange={(e) => onTaskFormChange("description", e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </label>

            <div className="inline-grid">
              <label>
                Status
                <select
                  value={taskForm.status}
                  onChange={(e) => onTaskFormChange("status", e.target.value as TaskStatus)}
                >
                  <option value="todo">todo</option>
                  <option value="in-progress">in-progress</option>
                  <option value="done">done</option>
                </select>
              </label>

              <label>
                Priority
                <select
                  value={taskForm.priority}
                  onChange={(e) => onTaskFormChange("priority", e.target.value as TaskPriority)}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
            </div>

            <div className="inline-grid">
              <label>
                Start Date
                <input
                  type="date"
                  value={taskForm.start_date ?? ""}
                  onChange={(e) => onTaskFormChange("start_date", e.target.value)}
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  value={taskForm.end_date ?? ""}
                  onChange={(e) => onTaskFormChange("end_date", e.target.value)}
                />
              </label>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </form>
        </section>
      )}

      {error && <p className="error">{error}</p>}

      <section className="card">
        <div className="header-row">
          <h2>Tasks</h2>
          <div className="controls-grid">
            <label>
              Search
              <input
                value={searchTerm}
                placeholder="Search title/description"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </label>

            <label>
              Status Filter
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "all" | TaskStatus);
                  setPage(1);
                }}
              >
                <option value="all">all</option>
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            </label>

            <label>
              Priority Filter
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as "all" | TaskPriority);
                  setPage(1);
                }}
              >
                <option value="all">all</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>

            <label>
              Sort By
              <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}>
                <option value="created_at">created_at</option>
                <option value="title">title</option>
                <option value="priority">priority</option>
                <option value="status">status</option>
                <option value="start_date">start_date</option>
                <option value="end_date">end_date</option>
              </select>
            </label>

            <label>
              Direction
              <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value as SortDirection)}>
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </select>
            </label>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Loading tasks..." />
        ) : paginatedTasks.length === 0 ? (
          <EmptyState text="No tasks found for the current filters." />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="clickable-row"
                      onClick={() => void openTaskModal(task.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void openTaskModal(task.id);
                        }
                      }}
                    >
                      <td>{task.title}</td>
                      <td>{task.description || "-"}</td>
                      <td>
                        <span className={`status-badge status-${task.status}`}>{task.status}</span>
                      </td>
                      <td>
                        <span className={`priority-pill priority-${task.priority}`}>{task.priority}</span>
                      </td>
                      <td>{task.start_date || "-"}</td>
                      <td>{task.end_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-row">
              <button
                type="button"
                className="secondary-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="secondary-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeTaskModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button type="button" className="secondary-btn" onClick={closeTaskModal}>
                Close
              </button>
            </div>

            {modalLoading || !selectedTask ? (
              <LoadingState text="Loading task details..." />
            ) : (
              <>
                <section className="card section-card">
                  <h3>Section 1: Basic Info</h3>
                  <form className="form-grid" onSubmit={onSaveBasicInfo}>
                    <label>
                      Title
                      <input
                        value={basicForm.title ?? ""}
                        onChange={(e) => onBasicFormChange("title", e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        value={basicForm.description ?? ""}
                        onChange={(e) => onBasicFormChange("description", e.target.value)}
                        rows={3}
                      />
                    </label>

                    <div className="inline-grid">
                      <label>
                        Status
                        <select
                          value={basicForm.status}
                          onChange={(e) => onBasicFormChange("status", e.target.value as TaskStatus)}
                        >
                          <option value="todo">todo</option>
                          <option value="in-progress">in-progress</option>
                          <option value="done">done</option>
                        </select>
                      </label>

                      <label>
                        Priority
                        <select
                          value={basicForm.priority}
                          onChange={(e) => onBasicFormChange("priority", e.target.value as TaskPriority)}
                        >
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                      </label>
                    </div>

                    <div className="inline-grid">
                      <label>
                        Start Date
                        <input
                          type="date"
                          value={basicForm.start_date ?? ""}
                          onChange={(e) => onBasicFormChange("start_date", e.target.value)}
                        />
                      </label>

                      <label>
                        End Date
                        <input
                          type="date"
                          value={basicForm.end_date ?? ""}
                          onChange={(e) => onBasicFormChange("end_date", e.target.value)}
                        />
                      </label>
                    </div>

                    <button type="submit" disabled={savingBasic}>
                      {savingBasic ? "Saving..." : "Save Basic Info"}
                    </button>
                  </form>
                </section>

                <section className="card section-card">
                  <div className="insight-header-row">
                    <h3>Section 2: Deep Insight</h3>
                    <div className="insight-actions">
                      <label className="insight-category-label">
                        Focus Category
                        <select value={insightCategory} onChange={(e) => setInsightCategory(e.target.value)}>
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
                      <button type="button" onClick={() => void onGetDeepInsight()} disabled={loadingInsight}>
                        {loadingInsight ? "Generating..." : "Get Deep Insight"}
                      </button>
                    </div>
                  </div>
                  <p className="muted insight-hint">
                    AI keeps suggestions mostly in your selected category (70%) and separates surrounding-category
                    extras (30%). Add a meaningful description before generating.
                  </p>

                  {selectedTaskInsight ? (
                    <div className="ai-insight-grid">
                      <article className="ai-insight-card">
                        <h4>Overview</h4>
                        <p>{selectedTaskInsight.overview}</p>
                      </article>
                      <article className="ai-insight-card">
                        <h4>Suggestions (70%)</h4>
                        <p>{parsedSuggestionSections?.primary || selectedTaskInsight.suggestions}</p>
                      </article>
                      <article className="ai-insight-card">
                        <h4>Impact</h4>
                        <p>{selectedTaskInsight.impact}</p>
                      </article>
                      <article className="ai-insight-card">
                        <h4>Skills Improvement</h4>
                        <p>{selectedTaskInsight.skills_improvement}</p>
                      </article>
                      <article className="ai-insight-card ai-insight-card-wide">
                        <h4>Extras (30%)</h4>
                        <p>{parsedSuggestionSections?.extras || "No surrounding-category extras were returned."}</p>
                      </article>
                    </div>
                  ) : (
                    <EmptyState text="No deep insight yet. Click 'Get Deep Insight' to generate AI output." />
                  )}

                  <div className="logs-section">
                    <h4>Issues Faced & Resolutions</h4>
                    {selectedTaskLogs.length === 0 ? (
                      <EmptyState text="No issues logged yet." />
                    ) : (
                      <div className="log-list">
                        {selectedTaskLogs.map((log) => (
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
                          onChange={(e) => onLogFormChange("issue", e.target.value)}
                          rows={2}
                          required
                        />
                      </label>

                      <label>
                        Resolution
                        <textarea
                          value={logForm.resolution || ""}
                          onChange={(e) => onLogFormChange("resolution", e.target.value)}
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
      )}
    </main>
  );
}
