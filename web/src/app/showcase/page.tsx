import Link from "next/link";
import { Filter, Flame, Grid3x3, Sparkles, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DEMO_WORKS, WorkCard, type Work } from "@/components/feed/work-card";

const FILTERS = ["全部", "Seedance 2.0", "可灵 2.0", "Veo 3", "Runway Gen-4", "Pika 2.0", "自训练 / LoRA"];
const SORTS = ["综合排序", "最新发布", "本周最热", "本月最热", "争议榜"];
const RATIOS = ["全部比例", "16:9", "9:16", "1:1"];

const EXTRA_WORKS: Work[] = [
  {
    id: "w101",
    title: "竖屏短剧 · 都市奇遇 · Ep.01",
    cover: "from-rose-500/60 via-pink-700/60 to-slate-900/80",
    duration: "01:12",
    author: "短剧工坊",
    authorTint: "from-rose-300 to-pink-500",
    model: "Seedance 2.0",
    likes: "7.2k",
    comments: 184,
    ratio: "9:16",
    tag: "竖屏",
  },
  {
    id: "w102",
    title: "方形 · 极简产品广告 · 香水",
    cover: "from-stone-400/60 via-amber-700/60 to-stone-950/80",
    duration: "00:15",
    author: "Cube Studio",
    authorTint: "from-stone-300 to-amber-500",
    model: "Seedance 2.0",
    likes: "3.4k",
    comments: 56,
    ratio: "1:1",
  },
  {
    id: "w103",
    title: "复古胶片质感 · 90 年代街景",
    cover: "from-yellow-500/60 via-orange-700/60 to-red-900/80",
    duration: "00:36",
    author: "Film·北",
    authorTint: "from-yellow-300 to-orange-500",
    model: "Seedance + 调色",
    likes: "5.6k",
    comments: 142,
  },
  {
    id: "w104",
    title: "赛博朋克角色 turntable 360°",
    cover: "from-purple-500/60 via-violet-700/60 to-slate-950/80",
    duration: "00:08",
    author: "NeoDigital",
    authorTint: "from-purple-300 to-violet-500",
    model: "Seedance 2.0",
    likes: "8.1k",
    comments: 213,
    tag: "角色",
  },
];

const ALL_WORKS: Work[] = [...DEMO_WORKS, ...EXTRA_WORKS];

export default function ShowcasePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="作品广场"
        title="Showcase"
        description="社区全部公开作品，按热度 / 时间 / 模型筛选。点击作品进入详情，可查看 prompt、参数、原始素材与作者完整工作流。"
        actions={
          <>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/showcase/curated" />}>
              <Sparkles className="size-3.5" />
              官方精选
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/showcase/upload" />}>
              <Upload className="size-3.5" />
              发布作品
            </Button>
          </>
        }
      />

      <div className="space-y-5 px-6 py-6 sm:px-8">
        <section className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            模型
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f, i) => (
              <Chip key={f} active={i === 0}>{f}</Chip>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterGroup label="排序">
              {SORTS.map((s, i) => (
                <Chip key={s} active={i === 0} variant="ghost">{s}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="比例">
              {RATIOS.map((r, i) => (
                <Chip key={r} active={i === 0} variant="ghost">{r}</Chip>
              ))}
            </FilterGroup>
          </div>
        </section>

        <section className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="size-4 text-primary" />
            共 <span className="font-medium text-foreground">12,614</span> 个作品 · 实时刷新
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-border/60 p-0.5">
            <button className="rounded bg-muted px-2 py-1 text-foreground" aria-label="网格视图">
              <Grid3x3 className="size-3.5" />
            </button>
            <button className="rounded px-2 py-1 text-muted-foreground hover:text-foreground" aria-label="列表视图">
              <span className="text-[11px]">列表</span>
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {ALL_WORKS.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </section>

        <div className="flex justify-center py-4">
          <Button variant="outline" size="lg">
            加载更多
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  children,
  active,
  variant = "solid",
}: {
  children: React.ReactNode;
  active?: boolean;
  variant?: "solid" | "ghost";
}) {
  const base =
    "rounded-md px-2.5 py-1 text-xs transition-colors";
  if (variant === "ghost") {
    return (
      <button
        className={`${base} ${
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      className={`${base} border ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
