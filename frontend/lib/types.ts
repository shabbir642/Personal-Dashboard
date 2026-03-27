export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  end_date: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string | null;
  end_date?: string | null;
}

export interface TaskDetail {
  id: number;
  task_id: number;
  assigned_by: string | null;
  approach: string | null;
  key_learnings: string | null;
  notes: string | null;
}

export interface TaskDetailPayload {
  assigned_by: string | null;
  approach: string | null;
  key_learnings: string | null;
  notes: string | null;
}

export interface TaskLog {
  id: number;
  task_id: number;
  issue: string;
  resolution: string | null;
  created_at: string;
}

export interface TaskLogPayload {
  issue: string;
  resolution: string | null;
}

export interface CountByLabel {
  label: string;
  count: number;
}

export interface CompletionOverTimePoint {
  date: string;
  count: number;
}
