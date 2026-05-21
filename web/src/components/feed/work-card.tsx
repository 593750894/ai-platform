import Link from "next/link";
import { Heart, MessageCircle, Play, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type Work = {
  id: string;
  title: string;
  cover: string; // tailwind gradient class
  duration: string;
  author: string;
  authorTint: string;
  model?: string;
  likes: number | string;
  comments: number | string;
  tag?: string;
  ratio?: "16:9" | "9:16" | "1:1";
};

export function WorkCard({ work }: { work: Work }) {
  const ratio = work.ratio ?? "16:9";
  const aspect =
    ratio === "9:16"
      ? "aspect-[9/16]"
      : ratio === "1:1"
        ? "aspect-square"
        : "aspect-video";
  return (
    <Link
      href={`/showcase/${work.id}`}
      className="group block overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70 hover:shadow-[0_8px_30px_-12px_rgba(56,189,248,0.35)]"
    >
      <div className={cn("relative w-full overflow-hidden", aspect)}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", work.cover)} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur">
          {work.duration}
        </span>
        {work.tag && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/85 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            <Sparkles className="size-2.5" />
            {work.tag}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30">
            <Play className="size-5 fill-white text-white" />
          </span>
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground/95 group-hover:text-foreground">
          {work.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-black/70",
              work.authorTint,
            )}
          >
            {work.author.slice(0, 1)}
          </span>
          <span className="truncate">{work.author}</span>
          {work.model && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="truncate text-primary/80">{work.model}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3" />
              {work.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3" />
              {work.comments}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export const DEMO_WORKS: Work[] = [
  {
    id: "w001",
    title: "未来都市 24h — Seedance 2.0 1080P 实拍级测试",
    cover: "from-cyan-500/70 via-blue-700/60 to-violet-900/80",
    duration: "00:18",
    author: "MidnightAI",
    authorTint: "from-cyan-300 to-blue-500",
    model: "Seedance 2.0",
    likes: "12.4k",
    comments: 268,
    tag: "本周精选",
  },
  {
    id: "w002",
    title: "AI 短剧《潮汐》第 3 集 · 雨夜对话长镜头",
    cover: "from-amber-400/60 via-rose-700/60 to-indigo-900/80",
    duration: "01:42",
    author: "陈卷卷",
    authorTint: "from-amber-300 to-orange-500",
    model: "Seedance 2.0 + Kling",
    likes: "8.7k",
    comments: 412,
  },
  {
    id: "w003",
    title: "数字人 Lina · 弹琴 30s 连续动作",
    cover: "from-fuchsia-500/60 via-purple-700/60 to-slate-900/80",
    duration: "00:30",
    author: "Pixel·林",
    authorTint: "from-fuchsia-300 to-purple-500",
    model: "Seedance + 自训练 LoRA",
    likes: "6.1k",
    comments: 198,
    tag: "数字人",
  },
  {
    id: "w004",
    title: "首尾帧补间挑战 · 从黎明到落日",
    cover: "from-orange-400/70 via-rose-600/60 to-slate-900/80",
    duration: "00:24",
    author: "落日工作室",
    authorTint: "from-rose-300 to-red-500",
    model: "Seedance 2.0",
    likes: "5.3k",
    comments: 156,
  },
  {
    id: "w005",
    title: "实验：纯文本驱动 · 工业风产品广告",
    cover: "from-slate-400/60 via-zinc-700/60 to-slate-950/90",
    duration: "00:12",
    author: "Cube Studio",
    authorTint: "from-slate-300 to-zinc-500",
    model: "Seedance 2.0",
    likes: "3.9k",
    comments: 87,
  },
  {
    id: "w006",
    title: "可灵 2.0 vs Seedance · 同 prompt 真实人像对比",
    cover: "from-emerald-400/60 via-teal-700/60 to-blue-900/80",
    duration: "00:48",
    author: "Eval Lab",
    authorTint: "from-emerald-300 to-teal-500",
    model: "对比评测",
    likes: "9.8k",
    comments: 521,
    tag: "评测",
  },
  {
    id: "w007",
    title: "MV 《银河便利店》全片 — 9 镜头连贯叙事",
    cover: "from-indigo-400/60 via-purple-700/60 to-slate-900/80",
    duration: "02:35",
    author: "夜航 Studio",
    authorTint: "from-indigo-300 to-purple-500",
    model: "Seedance + AE",
    likes: "15.2k",
    comments: 730,
  },
  {
    id: "w008",
    title: "ComfyUI × Seedance 工作流分享（完整节点图）",
    cover: "from-blue-400/60 via-cyan-700/60 to-emerald-900/80",
    duration: "教程",
    author: "工作流研究所",
    authorTint: "from-cyan-300 to-emerald-500",
    model: "Tutorial",
    likes: "4.5k",
    comments: 312,
    tag: "教程",
  },
];
