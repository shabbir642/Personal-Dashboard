"use client";

import { FormEvent, useCallback } from "react";

import { Button, Field, Icon } from "../sb/primitives";
import type {
  CreateTaskPayload,
  TaskPriority,
  TaskStatus,
} from "../../lib/types";

type FieldName =
  | "title"
  | "description"
  | "start_date"
  | "end_date"
  | "status"
  | "priority";

export interface TaskFormProps {
  value: CreateTaskPayload;
  onChange: (next: CreateTaskPayload) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel: string;
  submittingLabel: string;
  maxDescriptionLength?: number;
}

export default function TaskForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel,
  submittingLabel,
  maxDescriptionLength,
}: TaskFormProps) {
  const update = useCallback(
    (field: FieldName, raw: string) => {
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

  const dateOrderValid =
    !value.start_date ||
    !value.end_date ||
    (value.end_date ?? "") >= (value.start_date ?? "");

  return (
    <form onSubmit={onSubmit}>
      <div className="sb-form">
        <Field label="title">
          <input
            className="sb-input"
            value={value.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
            placeholder="what are you shipping?"
            required
            maxLength={255}
            autoFocus
          />
        </Field>

        <Field
          label="description"
          hint={
            maxDescriptionLength
              ? `up to ${maxDescriptionLength} chars. context helps the ai.`
              : undefined
          }
        >
          <textarea
            className="sb-input sb-input--ta"
            value={value.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="what's worth remembering?"
            rows={4}
            maxLength={maxDescriptionLength}
          />
        </Field>

        <div className="sb-form__row">
          <Field label="status">
            <select
              className="sb-input"
              value={value.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="todo">todo</option>
              <option value="in-progress">in-progress</option>
              <option value="done">done</option>
            </select>
          </Field>
          <Field label="priority">
            <select
              className="sb-input"
              value={value.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </Field>
        </div>

        <div className="sb-form__row">
          <Field label="start date">
            <input
              className="sb-input"
              type="date"
              value={value.start_date ?? ""}
              onChange={(e) => update("start_date", e.target.value)}
            />
          </Field>
          <Field
            label="end date"
            error={
              dateOrderValid ? undefined : "end date cannot be before start date."
            }
          >
            <input
              className="sb-input"
              type="date"
              value={value.end_date ?? ""}
              onChange={(e) => update("end_date", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <footer className="sb-modal__footer">
        <div />
        <div className="sb-modal__footer-right">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              cancel
            </Button>
          )}
          <Button
            variant="primary"
            type="submit"
            icon={<Icon name="check" />}
            disabled={submitting || !dateOrderValid}
          >
            {submitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}
