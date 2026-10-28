import type { HowToStep } from "./mode-config";

/** Three-step how-to shown instead of a blank feed. */
export function EmptyState({ title, steps }: { title: string; steps: HowToStep[] }) {
  return (
    <section aria-labelledby="howto" className="grid gap-4">
      <h2 id="howto" className="font-display text-[28px] leading-9 font-semibold">
        {title}
      </h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="grid gap-3 rounded-np-lg bg-np-bg-1 p-4">
            <div className="flex aspect-[4/3] items-center justify-center rounded-np-md bg-gradient-to-br from-np-accent-soft via-np-bg-2 to-np-bg-2">
              <s.icon className="size-8 text-np-text-secondary" aria-hidden />
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium">
                <span className="text-np-text-muted">{i + 1}.</span> {s.title}
              </span>
              <span className="text-[13px] text-np-text-secondary">{s.text}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
