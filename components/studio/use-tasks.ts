"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isTerminal, type TaskRecord } from "@/lib/task-types";
import { backend } from "@/lib/backend";
import { useStudio } from "./app-context";

const TICK_MS = 3_000;

/**
 * Loads task history and keeps active tasks fresh. The server enforces the real
 * backoff (start 4 s, ×1.5, cap 30 s), so ticking often here is cheap. Active
 * tasks from earlier sessions are resumed automatically on load.
 */
export function useTasks(opts: { limit?: number; category?: string } = {}) {
  const { refreshCredits } = useStudio();
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const upsert = useCallback((t: TaskRecord) => {
    setTasks((list) => {
      const i = list.findIndex((x) => x.id === t.id);
      if (i === -1) return [t, ...list];
      const next = [...list];
      next[i] = t;
      return next;
    });
  }, []);

  const reload = useCallback(async () => {
    setTasks(await backend.tasks.list({ limit: opts.limit ?? 200, category: opts.category }));
    setLoaded(true);
  }, [opts.limit, opts.category]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set after the fetch resolves
    void reload();
  }, [reload]);

  useEffect(() => {
    let stopped = false;
    const timer = setInterval(async () => {
      const active = tasksRef.current.filter((t) => t.tracking === "active" && !isTerminal(t.state));
      for (const t of active) {
        if (stopped) return;
        try {
          const task = await backend.tasks.get(t.id);
          upsert(task);
          if (isTerminal(task.state)) void refreshCredits();
        } catch {
          // Network blip: keep tracking, try again next tick (never resubmit).
        }
      }
    }, TICK_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [upsert, refreshCredits]);

  const act = useCallback(
    async (id: string, action: "stop" | "resume" | "redownload" | "poll") => {
      const task = await backend.tasks.act(id, action);
      upsert(task);
      if (isTerminal(task.state)) void refreshCredits();
    },
    [upsert, refreshCredits],
  );

  return { tasks, loaded, upsert, reload, act };
}
