"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createTask,
  createTaskDetails,
  createTaskLog,
  fetchTaskById,
  fetchTaskDetails,
  fetchTaskLogs,
  fetchTasks,
  updateTask,
  updateTaskDetails,
} from "../lib/api";
import {
  CreateTaskPayload,
  Task,
  TaskDetail,
  TaskDetailPayload,
  TaskLog,
  TaskLogPayload,
  TaskPriority,
  TaskStatus,
} from "../lib/types";

const defaultTaskForm: CreateTaskPayload = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  start_date: null,
  end_date: null,
};

const defaultDetailForm: TaskDetailPayload = {
  assigned_by: "",
  approach: "",
  key_learnings: "",
  notes: "",
};

const defaultLogForm: TaskLogPayload = {
  issue: "",
  resolution: "",
};

type SortField = "created_at" | "title" | "priority" | "status" | "start_date" | "end_date";
type SortDirection = "asc" | "desc";

const priorityWeight: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState<CreateTaskPayload>(defaultTaskForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskDetail | null>(null);
  const [selectedTaskLogs, setSelectedTaskLogs] = useState<TaskLog[]>([]);

  const [basicForm, setBasicForm] = useState<CreateTaskPayload>(defaultTaskForm);
  const [detailForm, setDetailForm] = useState<TaskDetailPayload>(defaultDetailForm);
  const [logForm, setLogForm] = useState<TaskLogPayload>(defaultLogForm);

  const [savingBasic, setSavingBasic] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);
  const [addingLog, setAddingLog] = useState(false);

  async function loadTasks() {
    try {
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      setError("Could not load tasks. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesStatus && matchesPriority;
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
  }, [tasks, statusFilter, priorityFilter, sortField, sortDirection]);

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

  function onDetailFormChange(field: keyof TaskDetailPayload, value: string) {
    setDetailForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function onLogFormChange(field: keyof TaskLogPayload, value: string) {
    setLogForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      await loadTasks();
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
      const [task, detail, logs] = await Promise.all([
        fetchTaskById(taskId),
        fetchTaskDetails(taskId),
        fetchTaskLogs(taskId),
      ]);

      setSelectedTask(task);
      setSelectedTaskDetail(detail);
      setSelectedTaskLogs(logs);

      setBasicForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        start_date: task.start_date,
        end_date: task.end_date,
      });

      setDetailForm({
        assigned_by: detail?.assigned_by || "",
        approach: detail?.approach || "",
        key_learnings: detail?.key_learnings || "",
        notes: detail?.notes || "",
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
    setSelectedTaskDetail(null);
    setSelectedTaskLogs([]);
    setBasicForm(defaultTaskForm);
    setDetailForm(defaultDetailForm);
    setLogForm(defaultLogForm);
  }

  async function onSaveBasicInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    if (!basicForm.title || !basicForm.title.trim()) {
      setError("Title is required");
      return;
    }

    setSavingBasic(true);
    setError(null);

    try {
      const updated = await updateTask(selectedTask.id, {
        title: basicForm.title.trim(),
        description: basicForm.description || "",
        status: basicForm.status,
        priority: basicForm.priority,
        start_date: basicForm.start_date,
        end_date: basicForm.end_date,
      });

      setSelectedTask(updated);
      await loadTasks();
    } catch {
      setError("Could not save basic task info.");
    } finally {
      setSavingBasic(false);
    }
  }

  async function onSaveDeepDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;

    setSavingDetail(true);
    setError(null);

    try {
      const payload = {
        assigned_by: detailForm.assigned_by || null,
        approach: detailForm.approach || null,
        key_learnings: detailForm.key_learnings || null,
        notes: detailForm.notes || null,
      };

      const updatedDetail = selectedTaskDetail
        ? await updateTaskDetails(selectedTask.id, payload)
        : await createTaskDetails(selectedTask.id, payload);

      setSelectedTaskDetail(updatedDetail);
    } catch {
      setError("Could not save deep details.");
    } finally {
      setSavingDetail(false);
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
        resolution: logForm.resolution || "",
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
      <h1>Personal Task Dashboard</h1>

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

      {error && <p className="error">{error}</p>}

      <section className="card">
        <div className="header-row">
          <h2>Tasks</h2>
          <div className="controls-grid">
            <label>
              Status Filter
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatus)}>
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
                onChange={(e) => setPriorityFilter(e.target.value as "all" | TaskPriority)}
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

        {loading ? (
          <p>Loading tasks...</p>
        ) : visibleTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
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
                {visibleTasks.map((task) => (
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
              <p>Loading task details...</p>
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
                  <h3>Section 2: Deep Details</h3>
                  <form className="form-grid" onSubmit={onSaveDeepDetails}>
                    <label>
                      Assigned By
                      <input
                        value={detailForm.assigned_by}
                        onChange={(e) => onDetailFormChange("assigned_by", e.target.value)}
                        placeholder="Person/team assigning this task"
                      />
                    </label>

                    <label>
                      Approach To Solve
                      <textarea
                        value={detailForm.approach}
                        onChange={(e) => onDetailFormChange("approach", e.target.value)}
                        rows={3}
                      />
                    </label>

                    <label>
                      Key Learnings
                      <textarea
                        value={detailForm.key_learnings}
                        onChange={(e) => onDetailFormChange("key_learnings", e.target.value)}
                        rows={2}
                      />
                    </label>

                    <label>
                      Notes
                      <textarea
                        value={detailForm.notes}
                        onChange={(e) => onDetailFormChange("notes", e.target.value)}
                        rows={2}
                      />
                    </label>

                    <button type="submit" disabled={savingDetail}>
                      {savingDetail ? "Saving..." : selectedTaskDetail ? "Update Deep Details" : "Create Deep Details"}
                    </button>
                  </form>

                  <div className="logs-section">
                    <h4>Issues Faced & Resolutions</h4>
                    {selectedTaskLogs.length === 0 ? (
                      <p>No issues logged yet.</p>
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
                          value={logForm.resolution}
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
