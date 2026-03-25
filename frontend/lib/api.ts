import {
  CreateTaskPayload,
  Task,
  TaskDetail,
  TaskDetailPayload,
  TaskLog,
  TaskLogPayload,
  UpdateTaskPayload,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

export async function fetchTaskById(taskId: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch task");
  }

  return response.json();
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
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

  return response.json();
}

export async function createTaskDetails(taskId: number, payload: TaskDetailPayload): Promise<TaskDetail> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create task details");
  }

  return response.json();
}

export async function updateTaskDetails(taskId: number, payload: TaskDetailPayload): Promise<TaskDetail> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/details`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update task details");
  }

  return response.json();
}

export async function fetchTaskLogs(taskId: number): Promise<TaskLog[]> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/logs`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch task logs");
  }

  return response.json();
}

export async function createTaskLog(taskId: number, payload: TaskLogPayload): Promise<TaskLog> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create task log");
  }

  return response.json();
}
