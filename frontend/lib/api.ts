import {
  AppConfig,
  CompletionOverTimePoint,
  CountByLabel,
  CreateTaskPayload,
  Task,
  TaskAIInsight,
  TaskDetail,
  TaskDetailPayload,
  TaskListPage,
  TaskLog,
  TaskLogPayload,
  UpdateTaskPayload,
} from "./types";
import {
  toCompletionPointModel,
  toCountByLabelModel,
  toTaskAIInsightModel,
  toTaskDetailModel,
  toTaskLogModel,
  toTaskModel,
} from "./adapters";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: init?.body ? { "Content-Type": "application/json", ...(init?.headers || {}) } : init?.headers,
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body?.detail)) {
        // FastAPI validation error shape
        message = body.detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; ");
      }
    } catch {
      // keep fallback
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function fetchConfig(): Promise<AppConfig> {
  return request<AppConfig>("/config");
}

export async function fetchTasks(skip = 0, limit = 200): Promise<TaskListPage> {
  const data = await request<any>(`/tasks?skip=${skip}&limit=${limit}`);
  return {
    items: (data.items || []).map(toTaskModel),
    total: Number(data.total ?? 0),
    skip: Number(data.skip ?? 0),
    limit: Number(data.limit ?? limit),
  };
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const data = await request<any>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toTaskModel(data);
}

export async function fetchTaskById(taskId: number): Promise<Task> {
  const data = await request<any>(`/tasks/${taskId}`);
  return toTaskModel(data);
}

export async function generateTaskAIInsight(taskId: number, category: string): Promise<TaskAIInsight> {
  const data = await request<any>(`/tasks/${taskId}/ai-insight/generate`, {
    method: "POST",
    body: JSON.stringify({ category }),
  });
  return toTaskAIInsightModel(data);
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const data = await request<any>(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return toTaskModel(data);
}

export async function fetchTaskDetails(taskId: number): Promise<TaskDetail | null> {
  try {
    const data = await request<any>(`/tasks/${taskId}/details`);
    return toTaskDetailModel(data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createTaskDetails(taskId: number, payload: TaskDetailPayload): Promise<TaskDetail> {
  const data = await request<any>(`/tasks/${taskId}/details`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toTaskDetailModel(data);
}

export async function updateTaskDetails(taskId: number, payload: TaskDetailPayload): Promise<TaskDetail> {
  const data = await request<any>(`/tasks/${taskId}/details`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return toTaskDetailModel(data);
}

export async function fetchTaskLogs(taskId: number): Promise<TaskLog[]> {
  const data = await request<any[]>(`/tasks/${taskId}/logs`);
  return data.map(toTaskLogModel);
}

export async function createTaskLog(taskId: number, payload: TaskLogPayload): Promise<TaskLog> {
  const data = await request<any>(`/tasks/${taskId}/logs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toTaskLogModel(data);
}

export async function fetchCountByStatus(): Promise<CountByLabel[]> {
  const data = await request<any[]>("/analytics/count-by-status");
  return data.map(toCountByLabelModel);
}

export async function fetchCountByPriority(): Promise<CountByLabel[]> {
  const data = await request<any[]>("/analytics/count-by-priority");
  return data.map(toCountByLabelModel);
}

export async function fetchCompletionOverTime(): Promise<CompletionOverTimePoint[]> {
  const data = await request<any[]>("/analytics/completion-over-time");
  return data.map(toCompletionPointModel);
}
