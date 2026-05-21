"use client";

import { useActionState, useState } from "react";

import { cn } from "@/lib/utils";
import {
  POST_TYPE_META,
  POST_TYPE_ORDER,
  type PostTypeValue,
} from "@/lib/post-types";
import {
  createPostAction,
  type CreatePostFormState,
} from "@/lib/posts/actions";

const initial: CreatePostFormState = {};

export type ChannelOption = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export function CreatePostForm({
  channels,
  defaultChannelId,
}: {
  channels: ChannelOption[];
  defaultChannelId?: string;
}) {
  const [state, action, pending] = useActionState(createPostAction, initial);
  const [selectedType, setSelectedType] = useState<PostTypeValue>("DISCUSSION");

  return (
    <form action={action} className="space-y-5">
      <Section title="频道" error={state.fieldErrors?.channelId?.[0]}>
        <select
          name="channelId"
          defaultValue={defaultChannelId ?? ""}
          required
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        >
          <option value="" disabled>
            请选择频道
          </option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {(c.icon ?? "#") + " " + c.name} · {c.slug}
            </option>
          ))}
        </select>
      </Section>

      <Section title="帖子类型" error={state.fieldErrors?.type?.[0]}>
        <input type="hidden" name="type" value={selectedType} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {POST_TYPE_ORDER.map((t) => {
            const meta = POST_TYPE_META[t];
            const active = selectedType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
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
          placeholder="一句话说清楚你想分享什么"
          className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </Section>

      <Section title="正文" error={state.fieldErrors?.content?.[0]} required>
        <textarea
          name="content"
          required
          rows={8}
          maxLength={8000}
          placeholder="把你的工作流、prompt、感受讲清楚。支持纯文本，不支持 markdown 渲染。"
          className="block w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="视频链接（可选）" error={state.fieldErrors?.videoUrl?.[0]}>
          <input
            name="videoUrl"
            type="url"
            placeholder="https://..."
            className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </Section>
        <Section title="图片链接（可选）" error={state.fieldErrors?.imageUrl?.[0]}>
          <input
            name="imageUrl"
            type="url"
            placeholder="https://..."
            className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </Section>
      </div>

      {state.message && !state.ok && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="reset"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-background px-4 text-sm transition-colors hover:bg-muted"
        >
          重置
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "发布中…" : "发布帖子"}
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
