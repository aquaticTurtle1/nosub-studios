/**
 * Models that have completed at least one real, paid run through this app.
 * Maintained by hand after a live test (key = catalog key).
 */
export const LIVE_TESTED: Record<string, { date: string; note: string }> = {
  "z-image/z-image": {
    date: "2026-10-28",
    note: "1:1 text-to-image, success in 14 s; creditsConsumed 0.8 = estimate; balance 656 → 655.2",
  },
  "pixverse/text-to-video": {
    date: "2026-10-28",
    note: "3 s, 360p, 16:9, no audio; success in 24 s; creditsConsumed 12 (4/s); balance 655.2 → 643.2; 640×360 mp4",
  },
};
