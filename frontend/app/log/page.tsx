"use client";

import { useState } from "react";
import useSWR from "swr";

import { useAppShell } from "../../components/AppShell";
import TaskModal from "../../components/tasks/TaskModal";
import TasksTable from "../../components/tasks/TasksTable";
import { fetchConfig, fetchTasks } from "../../lib/api";
import { SWR_KEYS } from "../../lib/swrKeys";

export default function LogPage() {
  const { openNewTask } = useAppShell();
  const {
    data: page,
    isLoading,
    mutate,
  } = useSWR(SWR_KEYS.tasks, () => fetchTasks(0, 500));
  const { data: config } = useSWR(SWR_KEYS.config, fetchConfig);

  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tasks = page?.items ?? [];
  const minDesc = config?.task_description_min_length ?? 30;
  const maxDesc = config?.task_description_max_length ?? 5000;

  return (
    <>
      {error && (
        <div className="sb-banner sb-banner--error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="sb-loading">loading tasks…</div>
      ) : (
        <TasksTable
          tasks={tasks}
          onRowClick={(id) => setOpenTaskId(id)}
          onNew={openNewTask}
        />
      )}

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
    </>
  );
}
