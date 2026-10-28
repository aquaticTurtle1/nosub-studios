import { layoutFields, type RefField, type RefKind } from "@/lib/ui/fields";
import type { JsonSchema, PromptReferenceSyntax } from "./types";

/**
 * Reference chips in a prompt. In the editor and the saved draft a chip is the plain text
 * `@image_1` (`@video_2`, `@audio_1`): the reference's label, which never changes while it
 * is attached. At submit the chip is replaced with what the model understands — its
 * documented token, or plain words — so the prompt Kie.ai receives is ordinary text.
 */
export const CHIP_RE = /@(image|video|audio)_(\d+)\b/g;

/** An attached reference as the prompt sees it. */
export interface PromptRef {
  label: string;
  kind: RefKind;
  /** The value sent in the reference field (local:// URI before upload). */
  uri: string;
}

export function chipLabels(prompt: string): string[] {
  return [...prompt.matchAll(CHIP_RE)].map((m) => m[0].slice(1));
}

interface Placement {
  ref: PromptRef;
  field: RefField;
  /** Position inside the field (0 for single-URL fields). */
  index: number;
}

const ORDINAL = ["", "second ", "third ", "fourth ", "fifth ", "sixth ", "seventh ", "eighth ", "ninth ", "tenth "];
const KIND_NOUN: Record<RefKind, string> = { image: "image", video: "video", audio: "audio" };

/** What a field does with a reference, in words ("the first frame"), when the name says so. */
function roleOf(field: string): string | null {
  if (/(first|start)_?frame/i.test(field)) return "the first frame";
  if (/(last|end)_?frame|tail/i.test(field)) return "the last frame";
  if (/keyframe/i.test(field)) return "a keyframe";
  return null;
}

/** The values a reference field sends, in order. */
function sent(input: Record<string, unknown>, f: RefField): unknown[] {
  const v = input[f.name];
  if (f.itemKey && Array.isArray(v)) return v.map((x) => (x as Record<string, unknown>)?.[f.itemKey!]);
  return Array.isArray(v) ? v : v === undefined || v === null || v === "" ? [] : [v];
}

function place(input: Record<string, unknown>, fields: RefField[], refs: PromptRef[]): Placement[] {
  const unused = [...refs];
  const out: Placement[] = [];
  for (const f of fields) {
    sent(input, f).forEach((uri, index) => {
      const i = unused.findIndex((r) => r.uri === uri);
      if (i < 0) return;
      out.push({ ref: unused[i], field: f, index });
      unused.splice(i, 1);
    });
  }
  return out;
}

export interface SerializedPrompt {
  input: Record<string, unknown>;
  /** Chips sent as words, explained under the prompt ("image_1 is used as the first frame"). */
  hint: string | null;
  /** Chips that can't be sent; Generate stops with this message. */
  problems: string[];
}

/** Replaces chips with the model's documented token or plain words. Pure; used by the server and Preview. */
export function serializePrompt(
  input: Record<string, unknown>,
  schema: JsonSchema,
  syntax: PromptReferenceSyntax | undefined,
  refs: PromptRef[],
): SerializedPrompt {
  const layout = layoutFields(schema);
  const pf = layout.promptField;
  const prompt = pf ? input[pf] : undefined;
  if (!pf || typeof prompt !== "string" || !prompt.match(CHIP_RE)) return { input, hint: null, problems: [] };

  const placed = place(input, layout.refFields, refs);
  const out: Record<string, unknown> = { ...input };
  const token = syntax?.kind === "token" ? syntax : null;
  const covered = (f: RefField) => Boolean(token && (token.fieldFormats?.[f.name] || (token.fields ?? layout.refFields.map((x) => x.name)).includes(f.name)));

  // PixVerse-style names: every placed item carries its label.
  if (token?.nameField) {
    for (const f of layout.refFields.filter((x) => covered(x) && x.itemKey)) {
      const items = (out[f.name] as Record<string, unknown>[]).map((x) => ({ ...x }));
      for (const p of placed.filter((x) => x.field === f)) items[p.index] = { ...items[p.index], [token.nameField]: p.ref.label };
      out[f.name] = items;
    }
  }

  const problems: string[] = [];
  const spoken: string[] = [];
  const text = prompt.replace(CHIP_RE, (chip) => {
    const label = chip.slice(1);
    const ref = refs.find((r) => r.label === label);
    if (!ref) {
      problems.push(`${label} is no longer attached`);
      return chip;
    }
    const p = placed.find((x) => x.ref === ref);
    if (!p) {
      problems.push(`${label} isn't sent to this model`);
      return chip;
    }
    if (token && covered(p.field)) {
      const fmt = token.fieldFormats?.[p.field.name] ?? token.format;
      // Position as sent: inside the field for field-specific tokens, else across the covered fields of this kind.
      const before = layout.refFields
        .slice(0, layout.refFields.indexOf(p.field))
        .filter((f) => covered(f) && f.kinds.includes(ref.kind))
        .reduce((n, f) => n + sent(input, f).length, 0);
      const pos = token.fieldFormats?.[p.field.name] ? p.index : before + p.index;
      return fmt
        .replace("{name}", label)
        .replace("{Kind}", ref.kind[0].toUpperCase() + ref.kind.slice(1))
        .replace("{kind}", ref.kind)
        .replace("{n}", String(pos + token.indexBase));
    }
    const role = roleOf(p.field.name);
    if (role) {
      spoken.push(`${label} is used as ${role}`);
      return `${role} ${KIND_NOUN[ref.kind]}`;
    }
    const nth =
      layout.refFields
        .slice(0, layout.refFields.indexOf(p.field))
        .filter((f) => !roleOf(f.name) && f.kinds.includes(ref.kind))
        .reduce((n, f) => n + sent(input, f).length, 0) + p.index;
    const words = `the ${ORDINAL[nth] ?? `${nth + 1}th `}reference ${KIND_NOUN[ref.kind]}`;
    spoken.push(`${label} is ${words}`);
    return words;
  });
  out[pf] = text;
  const hint = spoken.length
    ? `${token ? "This model names only its reference inputs." : "This model doesn't read references by name."} ${spoken.join(", ")}.`
    : null;
  return { input: out, hint, problems: [...new Set(problems)] };
}
