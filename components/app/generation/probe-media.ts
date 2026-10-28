"use client";

export interface MediaProbe {
  width: number | null;
  height: number | null;
  duration: number | null;
}

/** Dimensions / duration read in the browser before the file is saved (best effort, 4 s max). */
export function probeMedia(file: File): Promise<MediaProbe> {
  const none: MediaProbe = { width: null, height: null, duration: null };
  const kind = file.type.split("/")[0];
  if (kind !== "image" && kind !== "video" && kind !== "audio") return Promise.resolve(none);
  const url = URL.createObjectURL(file);
  return new Promise<MediaProbe>((resolve) => {
    const done = (p: MediaProbe) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(p);
    };
    const timer = setTimeout(() => done(none), 4000);
    if (kind === "image") {
      const img = new Image();
      img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight, duration: null });
      img.onerror = () => done(none);
      img.src = url;
      return;
    }
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const v = el as HTMLVideoElement;
      done({
        width: kind === "video" ? v.videoWidth || null : null,
        height: kind === "video" ? v.videoHeight || null : null,
        duration: Number.isFinite(el.duration) ? el.duration : null,
      });
    };
    el.onerror = () => done(none);
    el.src = url;
  });
}
