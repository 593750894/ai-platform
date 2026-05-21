"use client";

import { useActionState, useState } from "react";

import { cn } from "@/lib/utils";
import {
  WORK_CATEGORY_META,
  WORK_CATEGORY_ORDER,
  type WorkCategoryValue,
} from "@/lib/work-categories";
import {
  createWorkAction,
  type CreateWorkFormState,
} from "@/lib/works/actions";

const initial: CreateWorkFormState = {};

const COMMON_TOOLS = [
  "Seedance 2.0",
  "Seedance Fast",
  "Runway Gen-3",
  "Kling AI",
  "Veo 3",
  "Pika",
  "Luma Dream Machine",
  "Midjourney",
  "Flux",
  "ComfyUI",
  "Suno",
  "ElevenLabs",
];

export function CreateWorkForm() {
  const [state, action, pending] = useActionState(createWorkAction, initial);
  const [selectedCategory, setSelectedCategory] =
    useState<WorkCategoryValue>("STORY");
  const [toolsInput, setToolsInput] = useState("");

  const appendTool = (tool: string) => {
    const parts = toolsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.includes(tool)) return;
    setToolsInput([...parts, tool].join(", "));
  };

  return (
    <form action={action} className="space-y-5">
      <Section title="作品类型" error={state.fieldErrors?.category?.[0]} required>
        <input type="hidden" name="category" value={selectedCategory} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
          {WORK_CATEGORY_ORDER.map((c) => {
            const meta = WORK_CATEGORY_META[c];
            const active = selectedCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-all",
                  active
                    ? `${meta.tone} ring-2 ring-primary/40`
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:bg-muted/40",
                )}
              >
                <div className="text-sm font-medium text-foreground/95">
                  {meta.label}
                </div>
                <div className="mt-0.5 text-[11px] opacity-80">{meta.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="标题" error={state.fieldErrors?.title?.[0]} required>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="给你的作品起个名字"
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </Section>

      <Section title="简介" error={state.fieldErrors?.description?.[0]}>
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="说一说创作背景、用了什么工具、踩过什么坑（可选，最多 2000 字）"
          className="block w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section
          title="封面链接"
          error={state.fieldErrors?.thumbnailUrl?.[0]}
        >
          <input
            name="thumbnailUrl"
            type="url"
            placeholder="https://...（可选，建议 16:9 静帧图）"
            className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </Section>
        <Section
          title="视频链接"
          error={state.fieldErrors?.videoUrl?.[0]}
          required
        >
          <input
            name="videoUrl"
            type="url"
            required
            placeholder="https://...（必填，B 站 / YouTube / CDN 直链均可）"
            className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </Section>
      </div>

      <Section title="使用工具" error={state.fieldErrors?.tools?.[0]}>
        <input
          name="tools"
          value={toolsInput}
          onChange={(e) => setToolsInput(e.target.value)}
          maxLength={500}
          placeholder="如：Seedance 2.0, Runway Gen-3, Suno（用逗号分隔，最多 10 个）"
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground">快捷添加：</span>
          {COMMON_TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => appendTool(t)}
              className="rounded-md border border-border/60 bg-card/40 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              + {t}
            </button>
          ))}
        </div>
      </Section>

      {state.message && !state.ok && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="reset"
          onClick={() => {
            setSelectedCategory("STORY");
            setToolsInput("");
          }}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-background px-4 text-sm transition-colors hover:bg-muted"
        >
          重置
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "发布中…" : "发布作品"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  required,
  error,
  children,
}: {
  title: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {title}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
