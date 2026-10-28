"use client";

import { Link2, Plus, Trash2, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { acceptFor, isUrlField } from "@/lib/catalog/schema";
import type { JsonSchema } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { type FileRef, type FormValue, type FormValues, isFileRef, makeFileRef } from "./form-values";

const typeOf = (s: JsonSchema) => (Array.isArray(s.type) ? s.type.find((t) => t !== "null") : s.type) ?? (s.properties ? "object" : "string");
const humanize = (k: string) => k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

interface Ctx {
  /** Recent successful Kie task IDs, offered for task_id / taskId fields. */
  taskIds: string[];
  issues: Record<string, string>;
}

export function SchemaForm({
  schema,
  values,
  onChange,
  taskIds,
  issues,
  only,
}: {
  schema: JsonSchema;
  values: FormValues;
  onChange: (v: FormValues) => void;
  taskIds: string[];
  issues: Record<string, string>;
  /** Render only these top-level fields (others keep their values). */
  only?: string[];
}) {
  const shown = only
    ? { ...schema, properties: Object.fromEntries(Object.entries(schema.properties ?? {}).filter(([k]) => only.includes(k))) }
    : schema;
  return <ObjectFields schema={shown} value={values} onChange={(v) => onChange(v as FormValues)} ctx={{ taskIds, issues }} path="" />;
}

function ObjectFields({
  schema,
  value,
  onChange,
  ctx,
  path,
}: {
  schema: JsonSchema;
  value: Record<string, FormValue> | undefined;
  onChange: (v: Record<string, FormValue>) => void;
  ctx: Ctx;
  path: string;
}) {
  const required = new Set(schema.required ?? []);
  const entries = Object.entries(schema.properties ?? {}).filter(([, p]) => !p.deprecated);
  const v = value ?? {};
  return (
    <div className="grid gap-4">
      {entries.map(([name, p]) => {
        const fieldPath = path ? `${path}.${name}` : name;
        return (
          <Field
            key={name}
            name={name}
            schema={p}
            required={required.has(name)}
            value={v[name]}
            onChange={(nv) => onChange({ ...v, [name]: nv })}
            ctx={ctx}
            path={fieldPath}
          />
        );
      })}
    </div>
  );
}

function Field({
  name,
  schema,
  required,
  value,
  onChange,
  ctx,
  path,
}: {
  name: string;
  schema: JsonSchema;
  required: boolean;
  value: FormValue;
  onChange: (v: FormValue) => void;
  ctx: Ctx;
  path: string;
}) {
  const id = useId();
  const t = typeOf(schema);
  const issue = ctx.issues[path];
  const range =
    schema.minimum !== undefined || schema.maximum !== undefined
      ? ` (${schema.minimum ?? "…"}–${schema.maximum ?? "…"})`
      : schema.maxItems !== undefined
        ? ` (max ${schema.maxItems})`
        : "";

  let control: React.ReactNode;
  if (schema.enum?.length) {
    control = <EnumSelect id={id} schema={schema} value={value} onChange={onChange} />;
  } else if (t === "boolean") {
    control = (
      <div className="flex items-center gap-2">
        <Switch id={id} checked={(value ?? schema.default ?? false) as boolean} onCheckedChange={(c) => onChange(c)} />
        <span className="text-xs text-muted-foreground">{value === undefined ? "Auto" : String(value)}</span>
        {value !== undefined && (
          <button className="text-xs text-muted-foreground underline" onClick={() => onChange(undefined)}>
            reset
          </button>
        )}
      </div>
    );
  } else if (t === "integer" || t === "number") {
    control = <NumberField id={id} schema={schema} integer={t === "integer"} value={value as number | undefined} onChange={onChange} />;
  } else if (isUrlField(name, schema)) {
    control =
      t === "array" ? (
        <MultiUpload accept={acceptFor(name, schema)} max={schema.maxItems} value={(value as FormValue[]) ?? []} onChange={onChange} />
      ) : (
        <UploadField accept={acceptFor(name, schema)} value={value as string | FileRef | undefined} onChange={onChange} />
      );
  } else if (t === "array" && schema.items && typeOf(schema.items) === "object") {
    control = <ObjectList schema={schema} value={(value as FormValue[]) ?? []} onChange={onChange} ctx={ctx} path={path} />;
  } else if (t === "array") {
    const items = schema.items ?? {};
    const numeric = typeOf(items) === "integer" || typeOf(items) === "number";
    control = (
      <Textarea
        id={id}
        rows={2}
        placeholder="One value per line"
        value={((value as FormValue[]) ?? []).join("\n")}
        onChange={(e) => {
          const lines = e.target.value.split("\n");
          onChange(numeric ? lines.filter((l) => l.trim()).map(Number) : lines);
        }}
      />
    );
  } else if (t === "object") {
    control = (
      <div className="rounded-md border p-3">
        <ObjectFields schema={schema} value={value as Record<string, FormValue>} onChange={onChange} ctx={ctx} path={path} />
      </div>
    );
  } else {
    const long = /prompt|lyrics|text|description|style|script|dialogue|content/i.test(name) || (schema.maxLength ?? 0) > 300;
    const isTaskId = /^(task_?id|taskId|origin_task_id|original_task_id)$/i.test(name);
    control = long ? (
      <Textarea
        id={id}
        rows={name.toLowerCase().includes("prompt") ? 4 : 3}
        maxLength={schema.maxLength}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <>
        <Input
          id={id}
          list={isTaskId ? `${id}-tasks` : undefined}
          maxLength={schema.maxLength}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {isTaskId && (
          <datalist id={`${id}-tasks`}>
            {ctx.taskIds.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        )}
      </>
    );
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="flex items-baseline gap-1">
        <span>{humanize(name)}</span>
        {required && <span className="text-destructive">*</span>}
        {range && <span className="ml-auto text-[11px] font-normal text-np-text-muted">{range.trim()}</span>}
      </Label>
      {control}
      {schema.description && <FieldHelp text={schema.description} />}
      {issue && <p className="text-xs text-destructive">{issue}</p>}
    </div>
  );
}

function FieldHelp({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const short = text.length > 140 && !open;
  return (
    <p className="text-xs whitespace-pre-line text-muted-foreground">
      {short ? `${text.slice(0, 140).trim()}… ` : `${text} `}
      {text.length > 140 && (
        <button className="underline" onClick={() => setOpen(!open)}>
          {open ? "less" : "more"}
        </button>
      )}
    </p>
  );
}

const UNSET = "__unset__";

function EnumSelect({ id, schema, value, onChange }: { id: string; schema: JsonSchema; value: FormValue; onChange: (v: FormValue) => void }) {
  const t = typeOf(schema);
  const options = schema.enum!.map((v) => String(v));
  const cast = (s: string): FormValue => (t === "integer" || t === "number" ? Number(s) : t === "boolean" ? s === "true" : s);
  const current = value === undefined ? UNSET : String(value);
  return (
    <Select value={current} onValueChange={(s) => onChange(s === UNSET || s === null ? undefined : cast(String(s)))}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{(v: string) => (v === UNSET ? "Auto" : v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSET}>Auto</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NumberField({
  id,
  schema,
  integer,
  value,
  onChange,
}: {
  id: string;
  schema: JsonSchema;
  integer: boolean;
  value: number | undefined;
  onChange: (v: FormValue) => void;
}) {
  const hasRange = schema.minimum !== undefined && schema.maximum !== undefined && schema.maximum - schema.minimum <= 10_000;
  const step = integer ? 1 : schema.maximum !== undefined && schema.minimum !== undefined && schema.maximum - schema.minimum <= 2 ? 0.01 : 0.1;
  return (
    <div className="flex items-center gap-3">
      {hasRange && (
        <Slider
          className="flex-1"
          min={schema.minimum}
          max={schema.maximum}
          step={step}
          value={value ?? (typeof schema.default === "number" ? schema.default : schema.minimum!)}
          onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        />
      )}
      <Input
        id={id}
        type="number"
        className={hasRange ? "w-24" : "w-full"}
        min={schema.minimum}
        max={schema.maximum}
        step={step}
        placeholder={schema.default !== undefined ? String(schema.default) : undefined}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

function UploadField({
  accept,
  value,
  onChange,
}: {
  accept: string;
  value: string | FileRef | undefined;
  onChange: (v: FormValue) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "url">(typeof value === "string" && value ? "url" : "file");
  const [drag, setDrag] = useState(false);

  if (isFileRef(value)) {
    return <FileChip file={value} onRemove={() => onChange(undefined)} />;
  }
  if (mode === "url") {
    return (
      <div className="flex gap-2">
        <Input
          placeholder="https://… (public URL)"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button variant="outline" size="icon" onClick={() => setMode("file")} title="Upload a file instead">
          <Upload />
        </Button>
      </div>
    );
  }
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onChange(makeFileRef(f));
      }}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground",
        drag && "border-primary bg-muted",
      )}
    >
      <button className="flex items-center gap-2 hover:text-foreground" onClick={() => input.current?.click()}>
        <Upload className="size-4" /> Drop a file or click to choose ({accept.replace(/\/\*/g, "")})
      </button>
      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => setMode("url")}>
        <Link2 className="size-3.5" /> URL
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(makeFileRef(f));
          e.target.value = "";
        }}
      />
    </div>
  );
}

function MultiUpload({
  accept,
  max,
  value,
  onChange,
}: {
  accept: string;
  max?: number;
  value: FormValue[];
  onChange: (v: FormValue) => void;
}) {
  const items = value.filter((v) => v !== undefined && v !== "");
  const canAdd = max === undefined || items.length < max;
  return (
    <div className="grid gap-2">
      {items.map((v, i) =>
        isFileRef(v) ? (
          <FileChip key={i} file={v} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
        ) : (
          <div key={i} className="flex gap-2">
            <Input value={String(v)} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
              <X />
            </Button>
          </div>
        ),
      )}
      {canAdd && (
        <UploadField
          accept={accept}
          value={undefined}
          onChange={(v) => {
            if (v !== undefined && v !== "") onChange([...items, v]);
          }}
        />
      )}
    </div>
  );
}

function FileChip({ file, onRemove }: { file: FileRef; onRemove: () => void }) {
  const kind = file.file.type.split("/")[0];
  return (
    <div className="flex items-center gap-3 rounded-md border p-2 text-xs">
      {kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview
        <img src={file.previewUrl} alt="" className="size-10 rounded object-cover" />
      ) : (
        <div className="flex size-10 items-center justify-center rounded bg-muted uppercase">{kind}</div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{file.file.name}</div>
        <div className="text-muted-foreground">
          {(file.file.size / 1048576).toFixed(2)} MB · uploaded to Kie.ai on submit (kept 24 h)
        </div>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove file">
        <X />
      </Button>
    </div>
  );
}

function ObjectList({
  schema,
  value,
  onChange,
  ctx,
  path,
}: {
  schema: JsonSchema;
  value: FormValue[];
  onChange: (v: FormValue) => void;
  ctx: Ctx;
  path: string;
}) {
  const canAdd = schema.maxItems === undefined || value.length < schema.maxItems;
  return (
    <div className="grid gap-2">
      {value.map((item, i) => (
        <div key={i} className="relative rounded-md border p-3 pr-10">
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label="Remove item"
          >
            <Trash2 />
          </Button>
          <ObjectFields
            schema={schema.items!}
            value={item as Record<string, FormValue>}
            onChange={(nv) => onChange(value.map((x, j) => (j === i ? nv : x)))}
            ctx={ctx}
            path={`${path}.${i}`}
          />
        </div>
      ))}
      {canAdd && (
        <Button variant="outline" size="sm" className="justify-self-start" onClick={() => onChange([...value, {}])}>
          <Plus /> Add item
        </Button>
      )}
    </div>
  );
}
