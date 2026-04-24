"use client";

import {
  FormEvent,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";

import AppHeader from "./AppHeader";
import TaskForm from "./tasks/TaskForm";
import TweaksPanel from "./sb/TweaksPanel";
import { Modal, ModalHeader } from "./sb/primitives";
import { createTask, fetchConfig, fetchTasks } from "../lib/api";
import { SWR_KEYS } from "../lib/swrKeys";
import type { CreateTaskPayload } from "../lib/types";

type ShellContextValue = {
  openNewTask: () => void;
};

const ShellContext = createContext<ShellContextValue | undefined>(undefined);

export function useAppShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShell");
  return ctx;
}

const defaultTaskForm: CreateTaskPayload = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  start_date: null,
  end_date: null,
};

export default function AppShell({ children }: { children: ReactNode }) {
  const { data: page, mutate } = useSWR(SWR_KEYS.tasks, () => fetchTasks(0, 500));
  const { data: config } = useSWR(SWR_KEYS.config, fetchConfig);

  const entryCount = page?.total ?? page?.items?.length ?? 0;
  const maxDesc = config?.task_description_max_length ?? 5000;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskForm, setTaskForm] = useState<CreateTaskPayload>(defaultTaskForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = useCallback(() => {
    setTaskForm(defaultTaskForm);
    setError(null);
    setShowCreateForm(true);
  }, []);

  // Keyboard shortcut: N opens new-task modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showCreateForm) return;
      if (e.key !== "n" && e.key !== "N") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      openNew();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNew, showCreateForm]);

  async function onCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskForm.title.trim()) {
      setError("Title is required.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task.");
    } finally {
      setSubmitting(false);
    }
  }

  const contextValue = useMemo<ShellContextValue>(
    () => ({ openNewTask: openNew }),
    [openNew],
  );

  return (
    <ShellContext.Provider value={contextValue}>
    <div className="sb-app">
      <AppHeader entryCount={entryCount} onNew={openNew} />

      <main className="sb-main">
        {error && (
          <div className="sb-banner sb-banner--error" role="alert">
            {error}
          </div>
        )}
        {children}
      </main>

      <footer className="sb-appfoot">
        <span>shippy board · v0.3</span>
        <span className="sb-appfoot__dot">·</span>
        <span>
          tracking {entryCount} {entryCount === 1 ? "task" : "tasks"}
        </span>
        <span className="sb-appfoot__dot">·</span>
        <span>
          press <kbd className="sb-kbd">N</kbd> to log
        </span>
        <span className="sb-appfoot__spacer" />
      </footer>

      <Modal
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        label="new task"
        width={560}
      >
        <ModalHeader
          meta="new task"
          title="log a task"
          onClose={() => setShowCreateForm(false)}
        />
        <div className="sb-modal__body">
          <TaskForm
            value={taskForm}
            onChange={setTaskForm}
            onSubmit={onCreateTask}
            onCancel={() => setShowCreateForm(false)}
            submitting={submitting}
            submitLabel="log task"
            submittingLabel="logging…"
            maxDescriptionLength={maxDesc}
          />
        </div>
      </Modal>

      <TweaksPanel />
    </div>
    </ShellContext.Provider>
  );
}
