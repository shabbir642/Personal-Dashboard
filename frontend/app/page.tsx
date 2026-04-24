"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

import { useAppShell } from "../components/AppShell";
import HomeAnalytics from "../components/tasks/HomeAnalytics";
import TaskModal from "../components/tasks/TaskModal";
import { fetchConfig } from "../lib/api";
import { SWR_KEYS } from "../lib/swrKeys";

export default function HomePage() {
  const router = useRouter();
  const { openNewTask } = useAppShell();
  const { data: config, mutate: mutateConfig } = useSWR(
    SWR_KEYS.config,
    fetchConfig,
  );
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [, setError] = useState<string | null>(null);

  const minDesc = config?.task_description_min_length ?? 30;
  const maxDesc = config?.task_description_max_length ?? 5000;

  return (
    <>
      <HomeAnalytics
        onOpenTask={(id) => setOpenTaskId(id)}
        onOpenList={() => router.push("/log")}
        onNew={openNewTask}
      />

      {openTaskId !== null && (
        <TaskModal
          taskId={openTaskId}
          minDescriptionLength={minDesc}
          maxDescriptionLength={maxDesc}
          onClose={() => setOpenTaskId(null)}
          onTaskChanged={() => void mutateConfig()}
          onError={setError}
        />
      )}
    </>
  );
}
