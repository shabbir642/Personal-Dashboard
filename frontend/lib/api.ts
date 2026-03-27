import {
  CompletionOverTimePoint,
  CountByLabel,
  CreateTaskPayload,
  Task,
  TaskDetail,
  TaskDetailPayload,
  TaskLog,
  TaskLogPayload,
  UpdateTaskPayload,
} from "./types";
import {
  toCompletionPointModel,
  toCountByLabelModel,
  toTaskDetailModel,
  toTaskLogModel,
  toTaskModel,
} from "./adapters";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const data = await request<any[]>("/tasks");
  return data.map(toTaskModel);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const data = await request<any>("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return toTaskModel(data);
}

export async function fetchTaskById(taskId: number): Promise<Task> {
  const data = await request<any>(`/tasks/${taskId}`);
  return toTaskModel(data);
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const data = await request<any>(`/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return toTaskModel(data);
}

export async function fetchTaskDetails(taskId: number): Promise<TaskDetail | null> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/details`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch task details");
  }

  return toTaskDetailModel(await response.json());
}

export async function createTaskDetails(taskId: number, payload: TaskDetailPayload): Promise<TaskDetail> {
  const data = await request<any>(`/tasks/${taskId}/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return toTaskDetailModel(data);
}

export async function updateTaskDetails(taskId: number, payload: TaskDetailPayload): Promise<TaskDetail> {
  const data = await request<any>(`/tasks/${taskId}/details`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
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
