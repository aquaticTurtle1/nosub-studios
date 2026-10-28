"use client";

import type { TaskOutput, TaskRecord } from "@/lib/task-types";
import { outputUri, type UploadRecord, uploadUri } from "@/lib/ui/local-ref";
import type { LibraryItem } from "./use-generator";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  flac: "audio/flac",
  ogg: "audio/ogg",
};

export type LibraryEntry = LibraryItem & { createdAt: number; label: string; prompt: string };

const promptOf = (t: TaskRecord) => {
  const p = t.input.prompt ?? t.input.text ?? t.input.lyrics;
  return typeof p === "string" ? p : "";
};

/** A finished generation's local file as a reference (used directly from data/outputs). */
export function outputItem(task: TaskRecord, o: TaskOutput): LibraryEntry | null {
  if (!o.localPath || o.kind === "file") return null;
  const ext = o.localPath.split(".").pop()?.toLowerCase() ?? "";
  return {
    uri: outputUri(o.localPath),
    kind: o.kind,
    name: `${task.modelTitle.trim()} ${o.localPath.split("/").pop()}`,
    mime: MIME[ext] ?? `${o.kind}/*`,
    size: o.bytes ?? 0,
    createdAt: task.completedAt ?? task.createdAt,
    label: task.modelTitle.trim(),
    prompt: promptOf(task),
  };
}

export function uploadItem(u: UploadRecord): LibraryEntry {
  return { uri: uploadUri(u.id), kind: u.kind, name: u.name, mime: u.mime, size: u.size, duration: u.duration, createdAt: u.createdAt, label: "Uploaded", prompt: "" };
}

export function generatedItems(tasks: TaskRecord[]): LibraryEntry[] {
  return tasks
    .filter((t) => t.state === "success")
    .flatMap((t) => t.outputs.map((o) => outputItem(t, o)))
    .filter((x): x is LibraryEntry => x !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}
