"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";

import LoadingState from "../components/LoadingState";
import HomeAnalytics from "../components/tasks/HomeAnalytics";
import TaskForm from "../components/tasks/TaskForm";
import TaskModal from "../components/tasks/TaskModal";
import TasksTable from "../components/tasks/TasksTable";
import { createTask, fetchConfig, fetchTasks } from "../lib/api";
import { SWR_KEYS } from "../lib/swrKeys";
import { CreateTaskPayload } from "../lib/types";

const defaultTaskForm: CreateTaskPayload = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  start_date: null,
  end_date: null,
};

export default function HomePage() {
  const { data: page, isLoading, mutate } = useSWR(SWR_KEYS.tasks, () => fetchTasks(0, 200));
  const { data: config } = useSWR(SWR_KEYS.config, fetchConfig);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskForm, setTaskForm] = useState<CreateTaskPayload>(defaultTaskForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);

  const tasks = page?.items ?? [];
  const minDesc = config?.task_description_min_length ?? 30;
  const maxDesc = config?.task_description_max_length ?? 5000;

  async function onCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskForm.title.trim()) {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <HomeAnalytics onCreateTask={() => setShowCreateForm(true)} />

      <section className="home-menu-bar card">
        <button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
          {showCreateForm ? "Close Create Task" : "Create Task"}
        </button>
      </section>

      {showCreateForm && (
        <section className="card">
          <h2>Create Task</h2>
          <TaskForm
            value={taskForm}
            onChange={setTaskForm}
            onSubmit={onCreateTask}
            submitting={submitting}
            submitLabel="Create Task"
            submittingLabel="Creating..."
            maxDescriptionLength={maxDesc}
          />
        </section>
      )}

      {error && <p className="error">{error}</p>}

      <section className="card">
        {isLoading ? (
          <LoadingState text="Loading tasks..." />
        ) : (
          <TasksTable tasks={tasks} onRowClick={(id) => setOpenTaskId(id)} />
        )}
      </section>

      {openTaskId !== null && (
        <TaskModal
          taskId={openTaskId}
          minDescriptionLength={minDesc}
          maxDescriptionLength={maxDesc}
          onClose={() => setOpenTaskId(null)}
          onTaskChanged={() => void mutate()}
          onError={setError}
        />
      )}
    </main>
  );
}
