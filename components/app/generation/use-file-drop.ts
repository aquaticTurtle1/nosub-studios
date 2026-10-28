"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const TARGET = "[data-drop-target]";
const hasFiles = (e: DragEvent) => Boolean(e.dataTransfer?.types.includes("Files"));

/**
 * Whether files are being dragged over the page. Window listeners in the capture phase,
 * so no element below can swallow the events (the old zone called stopPropagation on
 * drop and the page never reset). Hides on drop anywhere, leaving the window, dragend,
 * Escape, window blur, and 300 ms after the last dragover as a safety net.
 * Drops outside a [data-drop-target] are blocked (the browser would open the file).
 */
export function useFileDragActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let depth = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Escape hides the overlay for the rest of this drag.
    let dismissed = false;
    const off = () => {
      clearTimeout(timer);
      depth = 0;
      dismissed = false;
      setActive(false);
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(off, 300);
    };
    // While dismissed, the flag itself expires 300 ms after the last dragover.
    const armDismiss = () => {
      clearTimeout(timer);
      timer = setTimeout(() => (dismissed = false), 300);
    };
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      if (dismissed) return;
      setActive(true);
      arm();
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (dismissed) return armDismiss();
      setActive(true);
      arm();
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      // relatedTarget null = the pointer left the browser window.
      if (depth === 0 || e.relatedTarget === null) off();
    };
    const onDrop = (e: DragEvent) => {
      off();
      if (!hasFiles(e)) return;
      if (!(e.target instanceof Element && e.target.closest(TARGET))) {
        e.preventDefault();
        toast("Drop files on the left panel to add them");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      off();
      dismissed = true;
      armDismiss();
    };
    const opts = { capture: true };
    window.addEventListener("dragenter", onEnter, opts);
    window.addEventListener("dragover", onOver, opts);
    window.addEventListener("dragleave", onLeave, opts);
    window.addEventListener("drop", onDrop, opts);
    window.addEventListener("dragend", off, opts);
    window.addEventListener("keydown", onKey, opts);
    window.addEventListener("blur", off);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("dragenter", onEnter, opts);
      window.removeEventListener("dragover", onOver, opts);
      window.removeEventListener("dragleave", onLeave, opts);
      window.removeEventListener("drop", onDrop, opts);
      window.removeEventListener("dragend", off, opts);
      window.removeEventListener("keydown", onKey, opts);
      window.removeEventListener("blur", off);
    };
  }, []);
  return active;
}

/** Props that make an element accept dropped files. Never stops propagation. */
export function dropTarget(onFiles: (files: File[]) => void) {
  return {
    "data-drop-target": "",
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const files = [...e.dataTransfer.files];
      if (files.length) onFiles(files);
    },
  };
}
