import { CompletionOverTimePoint, CountByLabel, Task, TaskDetail, TaskLog } from "./types";

export function toTaskModel(input: any): Task {
  return {
    id: Number(input.id),
    title: String(input.title || ""),
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    created_at: String(input.created_at),
  };
}

export function toTaskDetailModel(input: any): TaskDetail {
  return {
    id: Number(input.id),
    task_id: Number(input.task_id),
    assigned_by: input.assigned_by ?? null,
    approach: input.approach ?? null,
    key_learnings: input.key_learnings ?? null,
    notes: input.notes ?? null,
  };
}

export function toTaskLogModel(input: any): TaskLog {
  return {
    id: Number(input.id),
    task_id: Number(input.task_id),
    issue: String(input.issue || ""),
    resolution: input.resolution ?? null,
    created_at: String(input.created_at),
  };
}

export function toCountByLabelModel(input: any): CountByLabel {
  return {
    label: String(input.label || ""),
    count: Number(input.count || 0),
  };
}

export function toCompletionPointModel(input: any): CompletionOverTimePoint {
  return {
    date: String(input.date || ""),
    count: Number(input.count || 0),
  };
}
