"use client";

import Document from "@tiptap/extension-document";
import Mention from "@tiptap/extension-mention";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { closeHistory } from "@tiptap/pm/history";
import { Fragment, Slice } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { useEditor } from "@tiptap/react";
import type { SuggestionProps } from "@tiptap/suggestion";
import { useEffect, useRef, useState } from "react";
import type { RefKind } from "@/lib/ui/fields";
import { CHIP_NODE, type DocNode, docToText, textToContent, textToDoc } from "@/lib/ui/prompt-doc";

export interface ChipRef {
  label: string;
  kind: RefKind;
  name: string;
  preview: string;
}

/** The open @ picker: matching references and where the caret is. */
export interface Suggest {
  items: ChipRef[];
  active: number;
  rect: DOMRect | null;
  pick: (r: ChipRef) => void;
}

interface Store {
  /** The attached references now. */
  refs: () => ChipRef[];
  /** Redraws of the chips on screen, so they follow the attached references. */
  views: Set<() => void>;
  onSuggest: (p: SuggestionProps<ChipRef> | null) => void;
  onKey: (e: KeyboardEvent) => boolean;
}

const AUDIO_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/></svg>';

function drawChip(dom: HTMLElement, label: string, ref: ChipRef | undefined) {
  dom.dataset.chip = label;
  if (ref) delete dom.dataset.missing;
  else dom.dataset.missing = "true";
  dom.className = ref
    ? "np-chip inline-flex h-[1.25rem] items-center gap-1 rounded-np-sm bg-np-accent-soft pr-1 pl-0.5 align-top text-np-accent-text select-none"
    : "np-chip inline-flex h-[1.25rem] items-center rounded-np-sm bg-np-warning-soft px-1 align-top text-np-warning line-through select-none";
  dom.replaceChildren();
  if (ref) {
    let thumb: HTMLElement;
    if (ref.kind === "image") {
      thumb = Object.assign(document.createElement("img"), { src: ref.preview, alt: "" });
    } else if (ref.kind === "video") {
      thumb = Object.assign(document.createElement("video"), { src: `${ref.preview}#t=0.1`, muted: true, preload: "metadata" });
    } else {
      thumb = document.createElement("span");
      thumb.innerHTML = AUDIO_ICON;
    }
    thumb.className = "size-3.5 shrink-0 rounded-[3px] object-cover [&>svg]:size-full";
    dom.append(thumb);
  }
  dom.append(ref ? label : `@${label}`);
}

/** Runs an edit as its own undo step: not merged with the typing before or after it. */
function separateUndo(view: EditorView, edit: () => void) {
  view.dispatch(closeHistory(view.state.tr));
  edit();
  view.dispatch(closeHistory(view.state.tr));
}

/** Replaces the selection with plain text, as its own undo step; `@image_1` becomes a chip. */
function insertText(view: EditorView, text: string) {
  const nodes = textToContent(text).map((p) => view.state.schema.nodeFromJSON(p));
  separateUndo(view, () => view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.fromArray(nodes), 1, 1)).scrollIntoView()));
}

/** A reference chip: one atomic inline node, written to the prompt string as `@image_1`. */
function refChip(store: Store) {
  return Mention.extend({
    name: CHIP_NODE,
    addNodeView() {
      return ({ node: initial }) => {
        let node = initial;
        const dom = document.createElement("span");
        dom.contentEditable = "false";
        const draw = () => drawChip(dom, String(node.attrs.id), store.refs().find((r) => r.label === node.attrs.id));
        store.views.add(draw);
        draw();
        return {
          dom,
          update: (n) => {
            if (n.type !== node.type) return false;
            node = n;
            draw();
            return true;
          },
          ignoreMutation: () => true,
          destroy: () => store.views.delete(draw),
        };
      };
    },
    addKeyboardShortcuts() {
      // Backspace after a chip (Delete before one) removes the whole chip, as one undo step.
      const remove = (back: boolean) => () => {
        const { view } = this.editor;
        const sel = view.state.selection;
        const node = back ? sel.$from.nodeBefore : sel.$from.nodeAfter;
        if (!sel.empty || node?.type.name !== CHIP_NODE) return false;
        const from = back ? sel.from - node.nodeSize : sel.from;
        separateUndo(view, () => view.dispatch(view.state.tr.delete(from, from + node.nodeSize)));
        return true;
      };
      return { Backspace: remove(true), Delete: remove(false) };
    },
  }).configure({
    deleteTriggerWithBackspace: true,
    renderText: ({ node }) => `@${node.attrs.id}`,
    suggestion: {
      char: "@",
      items: ({ query }) => store.refs().filter((r) => r.label.startsWith(query)),
      command: ({ editor, range, props }) => {
        // A space after the chip, like the old editor, unless one is already there.
        const after = editor.state.doc.textBetween(range.to, Math.min(range.to + 1, editor.state.doc.content.size), "\n");
        separateUndo(editor.view, () =>
          editor
            .chain()
            .focus()
            .insertContentAt(range, [{ type: CHIP_NODE, attrs: { id: props.label } }, ...(after === " " ? [] : [{ type: "text", text: " " }])])
            .run(),
        );
      },
      render: () => ({
        onStart: (p) => store.onSuggest(p),
        onUpdate: (p) => store.onSuggest(p),
        onExit: () => store.onSuggest(null),
        onKeyDown: ({ event }) => store.onKey(event),
      }),
    },
  });
}

/**
 * The prompt editor (TipTap / ProseMirror). The document is the single layer you see and
 * edit; `value` stays the plain prompt string (`@image_1` for chips) that drafts and the
 * serializer use, so nothing about what is saved or sent changes.
 */
export function usePromptEditor({
  value,
  onChange,
  refs,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  refs: ChipRef[];
  placeholder: string;
}) {
  const onChangeRef = useRef(onChange);
  const refsRef = useRef(refs);
  const last = useRef(value);
  const [suggest, setSuggest] = useState<Suggest | null>(null);
  const sug = useRef<{ props: SuggestionProps<ChipRef>; active: number } | null>(null);
  /** Where helpers insert: the caret once you have been in the prompt, the end before that. */
  const touched = useRef(false);

  const show = () => {
    const s = sug.current;
    setSuggest(
      s && s.props.items.length
        ? { items: s.props.items, active: s.active, rect: s.props.clientRect?.() ?? null, pick: (r) => s.props.command(r) }
        : null,
    );
  };

  const [store] = useState<Store>(() => ({
    refs: () => refsRef.current,
    views: new Set(),
    onSuggest: (p) => {
      sug.current = p ? { props: p, active: Math.min(sug.current?.active ?? 0, Math.max(0, p.items.length - 1)) } : null;
      show();
    },
    onKey: (e) => {
      const s = sug.current;
      if (!s || !s.props.items.length || e.ctrlKey || e.metaKey) return false;
      const n = s.props.items.length;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        s.active = (s.active + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
        show();
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        s.props.command(s.props.items[s.active]);
        return true;
      }
      return false;
    },
  }));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [Document, Paragraph, Text, UndoRedo, Placeholder.configure({ placeholder }), refChip(store)],
    content: textToDoc(value),
    editorProps: {
      attributes: {
        id: "prompt",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": "prompt-label",
        spellcheck: "false",
        class: "px-3 py-2.5 break-words whitespace-pre-wrap",
      },
      // Plain text only: formatting is dropped, line breaks are kept, @image_1 becomes a chip.
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!text || event.clipboardData?.files.length) return false;
        event.preventDefault();
        insertText(view, text);
        return true;
      },
      clipboardTextSerializer: (slice) => docToText({ type: "doc", content: slice.content.toJSON() ?? [] }),
    },
    onFocus: () => {
      touched.current = true;
    },
    onUpdate: ({ editor: ed }) => {
      const text = docToText(ed.getJSON() as DocNode);
      if (text === last.current) return;
      last.current = text;
      onChangeRef.current(text);
    },
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Outside changes (a restored draft, Reuse prompt) replace the document.
  useEffect(() => {
    if (!editor || value === last.current) return;
    last.current = value;
    editor.commands.setContent(textToDoc(value), { emitUpdate: false });
  }, [editor, value]);

  // Chips follow the attached references (a removed one turns into a warning).
  useEffect(() => {
    refsRef.current = refs;
    for (const draw of store.views) draw();
  }, [store, refs]);

  /**
   * Inserts text where the caret is (at the end before you've been in the prompt), spaced
   * from its neighbours. A sentence (`phrase`) also gets a full stop before it when needed.
   */
  const insertAtCaret = (text: string, phrase = false) => {
    if (!editor) return;
    editor.commands.focus(touched.current ? undefined : "end");
    const { $from, $to } = editor.state.selection;
    const before = $from.parent.textBetween(0, $from.parentOffset, "\n", "x");
    const after = $to.parent.textBetween($to.parentOffset, $to.parent.content.size, "\n", "x");
    const lead = !before.trim() || /\s$/.test(before) ? "" : phrase && !/[.!?]$/.test(before) ? ". " : " ";
    const trail = after && !/^\s/.test(after) ? " " : "";
    insertText(editor.view, `${lead}${text}${trail}`);
  };

  return { editor, suggest, insertAtCaret };
}
