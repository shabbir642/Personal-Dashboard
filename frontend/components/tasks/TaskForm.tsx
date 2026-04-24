"use client";

import { FormEvent, useCallback } from "react";

import { CreateTaskPayload, TaskPriority, TaskStatus } from "../../lib/types";

type Field = "title" | "description" | "start_date" | "end_date" | "status" | "priority";

export interface TaskFormProps {
  value: CreateTaskPayload;
  onChange: (next: CreateTaskPayload) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitting?: boolean;
  submitLabel: string;
  submittingLabel: string;
  maxDescriptionLength?: number;
}

export default function TaskForm({
  value,
  onChange,
  onSubmit,
  submitting = false,
  submitLabel,
  submittingLabel,
  maxDescriptionLength,
}: TaskFormProps) {
  const update = useCallback(
    (field: Field, raw: string) => {
      if (field === "start_date" || field === "end_date") {
        onChange({ ...value, [field]: raw === "" ? null : raw });
        return;
      }
      if (field === "status") {
        onChange({ ...value, status: raw as TaskStatus });
        return;
      }
      if (field === "priority") {
        onChange({ ...value, priority: raw as TaskPriority });
        return;
      }
      onChange({ ...value, [field]: raw });
    },
    [value, onChange],
  );

  const dateOrderValid = !value.start_date || !value.end_date || value.end_date >= value.start_date;

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Title
        <input
          value={value.title ?? ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Task title"
          required
          maxLength={255}
        />
      </label>

      <label>
        Description
        <textarea
          value={value.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Task description"
          rows={3}
          maxLength={maxDescriptionLength}
        />
      </label>

      <div className="inline-grid">
        <label>
          Status
          <select value={value.status} onChange={(e) => update("status", e.target.value)}>
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="done">done</option>
          </select>
        </label>

        <label>
          Priority
          <select value={value.priority} onChange={(e) => update("priority", e.target.value)}>
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
            value={value.start_date ?? ""}
            onChange={(e) => update("start_date", e.target.value)}
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            value={value.end_date ?? ""}
            onChange={(e) => update("end_date", e.target.value)}
          />
        </label>
      </div>

      {!dateOrderValid && <p className="error">End date cannot be before start date.</p>}

      <button type="submit" disabled={submitting || !dateOrderValid}>
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
