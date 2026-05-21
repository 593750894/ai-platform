"use client";

import { useActionState, useState } from "react";

import { cn } from "@/lib/utils";
import {
  COLLAB_CATEGORY_META,
  COLLAB_CATEGORY_ORDER,
  COLLAB_LOCATION_LABEL,
  COLLAB_LOCATION_VALUES,
  COLLAB_WORK_MODE_LABEL,
  COLLAB_WORK_MODE_VALUES,
  type CollabCategoryValue,
  type CollabLocationValue,
  type CollabWorkModeValue,
} from "@/lib/collaborations/categories";
import {
  createCollaborationAction,
  type CreateCollaborationFormState,
} from "@/lib/collaborations/actions";

const initial: CreateCollaborationFormState = {};

const COMMON_TAGS = [
  "Seedance 2.0",
  "ComfyUI",
  "短剧",
  "MV",
  "广告",
  "数字人",
  "纪录片",
  "二次元",
];

const SUGGESTED_BUDGETS = [
  "5000-10000 元",
  "10000-30000 元",
  "30000+ 元",
  "按集 / 按分钟计费",
  "面议",
];

export function CreateCollaborationForm() {
  const [state, action, pending] = useActionState(createCollaborationAction, initial);
  const [category, setCategory] = useState<CollabCategoryValue>("AI_VIDEO_TEAM");
  const [workMode, setWorkMode] = useState<CollabWorkModeValue>("PROJECT");
  const [location, setLocation] = useState<CollabLocationValue>("REMOTE");
  const [tagsInput, setTagsInput] = useState("");
  const [budget, setBudget] = useState("");

  const appendTag = (tag: string) => {
    const parts = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.includes(tag)) return;
    setTagsInput([...parts, tag].join(", "));
  };

  return (
    <form action={action} className="space-y-5">
      {/* 合作类型 */}
      <Section title="合作类型" error={state.fieldErrors?.category?.[0]} required>
        <input type="hidden" name="category" value={category} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COLLAB_CATEGORY_ORDER.map((c) => {
            const meta = COLLAB_CATEGORY_META[c];
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-all",
                  active
                    ? `${meta.tone} ring-2 ring-primary/40`
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:bg-muted/40",
                )}
              >
                <div className="text-sm font-medium text-foreground/95">
                  <span className="mr-1" aria-hidden>{meta.emoji}</span>
                  {meta.label}
                </div>
                <div className="mt-0.5 text-[11px] opacity-80">{meta.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 标题 */}
      <Section title="标题" error={state.fieldErrors?.title?.[0]} required>
        <input
          name="title"
          required
          maxLength={80}
          placeholder="一句话讲清楚：你在找什么 / 项目是什么"
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </Section>

      {/* 需求描述 */}
      <Section title="需求描述" error={state.fieldErrors?.description?.[0]} required>
        <textarea
          name="description"
          rows={6}
          required
          minLength={20}
          maxLength={3000}
          placeholder={`详细说明：
· 项目背景 / 目标观众
· 交付物（集数、时长、画幅）
· 工作流期望（Seedance / ComfyUI / 自定义）
· 时间节点 / 验收标准
· 其他特殊要求`}
          className="block w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </Section>

      {/* 预算 + 合作方式 + 远程线下 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Section title="预算" error={state.fieldErrors?.budget?.[0]}>
          <input
            name="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            maxLength={80}
            placeholder="可选，例：10000-30000 元"
            className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {SUGGESTED_BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className="rounded-md border border-border/60 bg-card/40 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {b}
              </button>
            ))}
          </div>
        </Section>

        <Section title="合作方式" error={state.fieldErrors?.workMode?.[0]} required>
          <input type="hidden" name="workMode" value={workMode} />
          <div className="grid grid-cols-2 gap-1.5">
            {COLLAB_WORK_MODE_VALUES.map((m) => {
              const active = workMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setWorkMode(m)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-xs transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {COLLAB_WORK_MODE_LABEL[m]}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="远程 / 线下" error={state.fieldErrors?.location?.[0]} required>
          <input type="hidden" name="location" value={location} />
          <div className="grid grid-cols-3 gap-1.5">
            {COLLAB_LOCATION_VALUES.map((m) => {
              const active = location === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLocation(m)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-xs transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {COLLAB_LOCATION_LABEL[m]}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      {/* 联系方式 */}
      <Section title="联系方式" error={state.fieldErrors?.contact?.[0]} required>
        <input
          name="contact"
          required
          maxLength={120}
          placeholder="微信号 / 邮箱 / 手机号 任选其一（仅登录用户可见）"
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          只对登录用户公开。建议留可主动联系到你的方式。
        </p>
      </Section>

      {/* 标签 */}
      <Section title="标签" error={state.fieldErrors?.tags?.[0]}>
        <input
          name="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          maxLength={200}
          placeholder="可选，用逗号分隔，例：短剧, Seedance 2.0, MV"
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground">快捷添加：</span>
          {COMMON_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => appendTag(t)}
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

      <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
        <button
          type="reset"
          onClick={() => {
            setCategory("AI_VIDEO_TEAM");
            setWorkMode("PROJECT");
            setLocation("REMOTE");
            setTagsInput("");
            setBudget("");
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
          {pending ? "发布中…" : "发布合作需求"}
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
