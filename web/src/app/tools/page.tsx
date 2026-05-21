import Link from "next/link";
import {
  ArrowRight,
  Brush,
  Cpu,
  Film,
  Image as ImageIcon,
  Layers,
  Mic,
  Music2,
  PenLine,
  Scissors,
  Search,
  Sparkles,
  Star,
  UserCircle,
  Wand2,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type Tool = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  vendor: string;
  tag?: string;
  tone: string;
  featured?: boolean;
};

const CATEGORIES = [
  { key: "video", label: "视频生成", icon: Film },
  { key: "image", label: "图像 / 素材", icon: ImageIcon },
  { key: "character", label: "角色 / 数字人", icon: UserCircle },
  { key: "edit", label: "剪辑 / 后期", icon: Scissors },
  { key: "audio", label: "音频 / 配乐", icon: Music2 },
  { key: "voice", label: "配音 / TTS", icon: Mic },
  { key: "script", label: "编剧 / 分镜", icon: PenLine },
  { key: "workflow", label: "工作流 / 模型", icon: Layers },
];

const TOOLS: Record<string, Tool[]> = {
  video: [
    {
      href: "/generate",
      icon: Wand2,
      name: "Seedance 2.0 工作台",
      desc: "官方集成 · 4 种生成模式、批量任务、TOS 持久化",
      vendor: "SeedLand 官方",
      tag: "官方",
      tone: "from-cyan-500/15 to-blue-500/5 border-cyan-500/40",
      featured: true,
    },
    {
      href: "/tools/kling",
      icon: Film,
      name: "可灵 2.0",
      desc: "快手 · 真实人像、运动一致性强",
      vendor: "Kuaishou",
      tone: "from-emerald-500/15 to-teal-500/5 border-emerald-500/30",
    },
    {
      href: "/tools/runway",
      icon: Film,
      name: "Runway Gen-4",
      desc: "Runway · 角色一致性 + 场景控制",
      vendor: "Runway",
      tone: "from-fuchsia-500/15 to-purple-500/5 border-fuchsia-500/30",
    },
    {
      href: "/tools/veo3",
      icon: Film,
      name: "Veo 3",
      desc: "Google · 物理真实度行业领先",
      vendor: "Google",
      tone: "from-amber-500/15 to-orange-500/5 border-amber-500/30",
    },
    {
      href: "/tools/pika",
      icon: Film,
      name: "Pika 2.0",
      desc: "Pika Labs · 风格化与快速迭代",
      vendor: "Pika",
      tone: "from-rose-500/15 to-pink-500/5 border-rose-500/30",
    },
  ],
  image: [
    { href: "/tools/midjourney", icon: ImageIcon, name: "Midjourney v7", desc: "图像生成 · 艺术风格基石", vendor: "MJ", tone: "from-violet-500/15 to-purple-500/5 border-violet-500/30" },
    { href: "/tools/sd", icon: ImageIcon, name: "Stable Diffusion XL Turbo", desc: "开源 · 可定制 LoRA / ControlNet", vendor: "Stability", tone: "from-blue-500/15 to-cyan-500/5 border-blue-500/30" },
    { href: "/tools/flux", icon: ImageIcon, name: "FLUX.1 Pro", desc: "Black Forest Labs · 高保真出图", vendor: "BFL", tone: "from-stone-500/15 to-zinc-500/5 border-stone-500/30" },
  ],
  character: [
    { href: "/tools/heygen", icon: UserCircle, name: "HeyGen 数字人", desc: "口型 + 表情驱动", vendor: "HeyGen", tone: "from-indigo-500/15 to-blue-500/5 border-indigo-500/30" },
    { href: "/tools/character", icon: UserCircle, name: "数字人定制（私域）", desc: "上传素材，生成专属数字人", vendor: "SeedLand 官方", tag: "邀测", tone: "from-cyan-500/15 to-blue-500/5 border-cyan-500/40" },
  ],
  edit: [
    { href: "/tools/capcut", icon: Scissors, name: "剪映专业版", desc: "字节 · 时间线 + AI 配乐", vendor: "ByteDance", tone: "from-slate-500/15 to-zinc-500/5 border-slate-500/30" },
    { href: "/tools/davinci", icon: Brush, name: "DaVinci Resolve", desc: "BMD · 调色 + 剪辑", vendor: "Blackmagic", tone: "from-red-500/15 to-rose-500/5 border-red-500/30" },
  ],
  audio: [
    { href: "/tools/suno", icon: Music2, name: "Suno v4", desc: "AI 编曲 + 演唱", vendor: "Suno", tone: "from-amber-500/15 to-yellow-500/5 border-amber-500/30" },
    { href: "/tools/udio", icon: Music2, name: "Udio", desc: "高质量 AI 音乐生成", vendor: "Udio", tone: "from-pink-500/15 to-rose-500/5 border-pink-500/30" },
  ],
  voice: [
    { href: "/tools/elevenlabs", icon: Mic, name: "ElevenLabs", desc: "多语言 TTS / 声音克隆", vendor: "ElevenLabs", tone: "from-purple-500/15 to-violet-500/5 border-purple-500/30" },
  ],
  script: [
    { href: "/tools/claude", icon: PenLine, name: "Claude Opus 4.7", desc: "Anthropic · 编剧、分镜、prompt 助手", vendor: "Anthropic", tone: "from-orange-500/15 to-amber-500/5 border-orange-500/30" },
  ],
  workflow: [
    { href: "/tools/comfyui", icon: Layers, name: "ComfyUI 模板库", desc: "社区 · 节点图分享与导入", vendor: "Community", tone: "from-teal-500/15 to-cyan-500/5 border-teal-500/30" },
    { href: "/tools/lora", icon: Cpu, name: "LoRA 训练任务", desc: "上传素材，云端微调专属模型", vendor: "SeedLand 官方", tag: "官方", tone: "from-cyan-500/15 to-blue-500/5 border-cyan-500/40" },
  ],
};

const FEATURED: Tool[] = TOOLS.video.filter((t) => t.featured).concat([TOOLS.character[1], TOOLS.workflow[1]]);

export default function ToolsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="工具库"
        title="Tools"
        description="社区精选 + 官方集成的 AI 视频全链路工具集。绿色背景为 SeedLand 原生工具，可一键打通项目与素材。"
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="搜索工具..."
                className="h-8 w-56 rounded-md border border-border/60 bg-card/40 pl-8 pr-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/tools/submit" />}>
              <Wrench className="size-3.5" />
              推荐工具
            </Button>
          </>
        }
      />

      <div className="space-y-7 px-6 py-6 sm:px-8">
        <section>
          <div className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight">
            <Star className="size-4 text-amber-400" />
            精选与官方
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((t) => (
              <ToolCard key={t.name} tool={t} large />
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <a
                key={c.key}
                href={`#${c.key}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  i === 0
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {c.label}
              </a>
            );
          })}
        </section>

        {CATEGORIES.map((c) => (
          <section key={c.key} id={c.key} className="space-y-3 scroll-mt-20">
            <div className="flex items-end justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <c.icon className="size-4 text-primary" />
                {c.label}
                <span className="text-xs font-normal text-muted-foreground">
                  · {TOOLS[c.key]?.length ?? 0} 个工具
                </span>
              </div>
              <Link href={`/tools/${c.key}`} className="text-xs text-muted-foreground hover:text-foreground">
                查看全部 →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {(TOOLS[c.key] ?? []).map((t) => (
                <ToolCard key={t.name} tool={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool, large }: { tool: Tool; large?: boolean }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 ${tool.tone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-background/40 ring-1 ring-inset ring-border/60">
          <Icon className="size-4" />
        </span>
        {tool.tag && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Sparkles className="size-2.5" />
            {tool.tag}
          </span>
        )}
      </div>
      <div className="mt-3 text-sm font-semibold">{tool.name}</div>
      <div className={`mt-1 text-xs text-muted-foreground ${large ? "" : "line-clamp-2"}`}>
        {tool.desc}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground/80">{tool.vendor}</span>
        <span className="inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
          打开 <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}
