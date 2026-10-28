"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import type { FormValue } from "@/components/studio/form-values";
import { type SettingField, chipLabel, chipValueText } from "@/lib/ui/fields";
import { cn } from "@/lib/utils";

const typeOf = (c: SettingField) => (Array.isArray(c.schema.type) ? c.schema.type[0] : c.schema.type);

/**
 * One core setting. `tile` = label on top + value + chevron (2-column grid);
 * `chip` = compact inline pill. Both open the same options popover.
 */
export function SettingChip({
  chip,
  value,
  invalid,
  onChange,
  variant = "chip",
}: {
  chip: SettingField;
  value: FormValue;
  invalid?: boolean;
  onChange: (v: FormValue) => void;
  variant?: "chip" | "tile";
}) {
  const [open, setOpen] = useState(false);
  const s = chip.schema;
  const t = typeOf(chip);
  const label = chipLabel(chip.name);
  const shown = value === undefined && s.default !== undefined ? s.default : value;
  const text = chipValueText(chip.name, shown);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={cn(
              "rounded-np-md bg-np-bg-2 text-left transition-colors duration-150 hover:bg-np-bg-3",
              variant === "chip" ? "flex h-8 items-center gap-1.5 px-3 text-sm" : "flex h-14 w-full items-center gap-2 px-3",
              open && "bg-np-accent-soft ring-1 ring-np-accent hover:bg-np-accent-soft",
              invalid && !open && "ring-1 ring-np-danger",
            )}
            aria-label={`${label}: ${text}`}
          />
        }
      >
        {variant === "chip" ? (
          <>
            <span className={cn("text-xs text-np-text-muted", open && "text-np-accent-text")}>{label}</span>
            <span className="font-medium">{text}</span>
          </>
        ) : (
          <>
            <span className="grid min-w-0 flex-1">
              <span className={cn("text-xs font-medium text-np-text-muted", open && "text-np-accent-text")}>{label}</span>
              <span className="truncate text-sm font-medium text-np-text-primary">{text}</span>
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-np-text-muted transition-transform duration-150", open && "rotate-180")} aria-hidden />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        {s.enum?.length ? (
          <div role="listbox" aria-label={label} className="grid max-h-72 gap-0.5 overflow-y-auto">
            {!chip.required && (
              <Option selected={value === undefined} onClick={() => (onChange(undefined), setOpen(false))}>
                Auto
              </Option>
            )}
            {s.enum.map((o) => {
              const v: FormValue = t === "integer" || t === "number" ? Number(o) : t === "boolean" ? o === true || o === "true" : (o as string);
              return (
                <Option key={String(o)} selected={String(value) === String(o)} onClick={() => (onChange(v), setOpen(false))}>
                  {chipValueText(chip.name, o)}
                </Option>
              );
            })}
          </div>
        ) : t === "boolean" ? (
          <div role="listbox" aria-label={label} className="grid gap-0.5">
            {!chip.required && (
              <Option selected={value === undefined} onClick={() => (onChange(undefined), setOpen(false))}>
                Auto
              </Option>
            )}
            <Option selected={value === true} onClick={() => (onChange(true), setOpen(false))}>
              On
            </Option>
            <Option selected={value === false} onClick={() => (onChange(false), setOpen(false))}>
              Off
            </Option>
          </div>
        ) : (
          <div className="grid gap-3 p-2">
            <div className="flex items-center justify-between text-xs text-np-text-muted">
              <span>{label}</span>
              {(s.minimum !== undefined || s.maximum !== undefined) && (
                <span>
                  {s.minimum ?? "…"}–{s.maximum ?? "…"}
                </span>
              )}
            </div>
            {s.minimum !== undefined && s.maximum !== undefined && (
              <Slider
                min={s.minimum}
                max={s.maximum}
                step={t === "integer" ? 1 : 0.1}
                value={typeof value === "number" ? value : s.minimum}
                onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
              />
            )}
            <Input
              type="number"
              min={s.minimum}
              max={s.maximum}
              step={t === "integer" ? 1 : "any"}
              value={typeof value === "number" ? value : ""}
              placeholder={s.default !== undefined ? String(s.default) : undefined}
              onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              aria-label={label}
            />
          </div>
        )}
        {s.description && <p className="px-2 pt-1.5 pb-1 text-xs text-np-text-muted">{s.description.split("\n")[0].slice(0, 140)}</p>}
      </PopoverContent>
    </Popover>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex h-8 items-center justify-between rounded-np-sm px-2 text-left text-sm hover:bg-np-bg-2",
        selected && "text-np-accent-text",
      )}
    >
      {children}
      {selected && <Check className="size-4" aria-hidden />}
    </button>
  );
}
