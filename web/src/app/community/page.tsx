import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Compass,
  Crown,
  MessageCircle,
  Pin,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "认证创作者", value: "2,847", delta: "+34 / 周" },
  { label: "本月新增作品", value: "12.6k", delta: "+18%" },
  { label: "进行中协作项目", value: "186", delta: "+9 / 周" },
  { label: "讨论帖数", value: "48.3k", delta: "今日 312" },
];

const PINNED_POSTS = [
  {
    title: "📌 SeedLand 社区公约 v1.2 — 请在投稿前阅读",
    author: "官方",
    replies: 0,
    pinned: true,
  },
  {
    title: "📌 Seedance 2.0 1080P 计费已更新：标准 31/51 ¥/M tok",
    author: "官方",
    replies: 142,
    pinned: true,
  },
];

const HOT_POSTS = [
  {
    title: "Seedance 2.0 vs 可灵 2.0 vs Veo 3：30 个场景实测对比报告",
    author: "Eval Lab",
    tag: "评测",
    tagTone: "bg-amber-500/15 text-amber-300",
    replies: 521,
    time: "2h",
  },
  {
    title: "首尾帧补间用图片做参考时，prompt 一致性的 7 个 trick",
    author: "陈卷卷",
    tag: "工作流",
    tagTone: "bg-cyan-500/15 text-cyan-300",
    replies: 268,
    time: "4h",
  },
  {
    title: "求助：1080P 输出在 24fps 下出现抖动，是参数问题吗？",
    author: "新人小白",
    tag: "提问",
    tagTone: "bg-fuchsia-500/15 text-fuchsia-300",
    replies: 47,
    time: "6h",
  },
  {
    title: "招募 — 短剧《潮汐》第二季 AI 合成师 2 名 / 远程",
    author: "夜航 Studio",
    tag: "招募",
    tagTone: "bg-emerald-500/15 text-emerald-300",
    replies: 89,
    time: "12h",
  },
  {
    title: "ComfyUI 完整节点图分享：Seedance 输入预处理工作流",
    author: "工作流研究所",
    tag: "教程",
    tagTone: "bg-blue-500/15 text-blue-300",
    replies: 312,
    time: "1d",
  },
];

const COMMUNITY_CARDS = [
  {
    href: "/showcase",
    icon: Compass,
    title: "作品广场",
    desc: "浏览全平台最新与最热作品",
    tone: "from-cyan-500/15 to-blue-500/5 border-cyan-500/30",
  },
  {
    href: "/collaboration",
    icon: Users,
    title: "项目合作",
    desc: "发布需求 / 接单 / 组团创作",
    tone: "from-emerald-500/15 to-teal-500/5 border-emerald-500/30",
  },
  {
    href: "/community/leaderboard",
    icon: Crown,
    title: "创作者榜",
    desc: "本月人气、上升最快、新人榜",
    tone: "from-amber-500/15 to-orange-500/5 border-amber-500/30",
  },
  {
    href: "/community/events",
    icon: Calendar,
    title: "官方活动",
    desc: "挑战赛、训练营、Showcase",
    tone: "from-fuchsia-500/15 to-purple-500/5 border-fuchsia-500/30",
  },
];

export default function CommunityPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="社区总览"
        title="SeedLand Community"
        description="2,847 位认证创作者 · 持续生长的中文 AI 视频内容社区。在这里分享作品、讨论工作流、寻找协作伙伴。"
        actions={
          <>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/community/rules" />}>
              社区公约
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/showcase/upload" />}>
              <Sparkles className="size-3.5" />
              发布作品
            </Button>
          </>
        }
      />

      <div className="space-y-8 px-6 py-6 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-card/40 p-4"
            >
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {s.value}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <TrendingUp className="size-3" />
                {s.delta}
              </div>
            </div>
          ))}
        </section>

        <section>
          <SectionTitle>快速入口</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITY_CARDS.map(({ href, icon: Icon, title, desc, tone }) => (
              <Link
                key={href}
                href={href}
                className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${tone} p-4 transition-all hover:-translate-y-0.5`}
              >
                <Icon className="mb-3 size-5" />
                <div className="text-sm font-medium">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
                <ChevronRight className="absolute right-3 top-3 size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionTitle action={{ label: "全部讨论", href: "/community/discussions" }}>
              社区讨论
            </SectionTitle>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
              <ul className="divide-y divide-border/40">
                {PINNED_POSTS.map((p) => (
                  <li key={p.title} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                    <Pin className="size-3.5 shrink-0 text-amber-400" />
                    <Link href="#" className="line-clamp-1 flex-1 text-sm font-medium text-foreground/95 hover:text-primary">
                      {p.title}
                    </Link>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{p.author}</span>
                  </li>
                ))}
                {HOT_POSTS.map((p) => (
                  <li key={p.title} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${p.tagTone}`}>
                      {p.tag}
                    </span>
                    <Link href="#" className="line-clamp-1 flex-1 text-sm text-foreground/90 hover:text-primary">
                      {p.title}
                    </Link>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{p.author}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <MessageCircle className="size-3" />
                      {p.replies}
                    </span>
                    <span className="hidden w-8 text-right text-xs text-muted-foreground tabular-nums sm:inline">
                      {p.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <SectionTitle>本周公告</SectionTitle>
            <div className="space-y-3">
              {[
                {
                  title: "Seedance 2.0 1080P 已全量开放",
                  desc: "本周起所有认证创作者均可使用 1080P 模式，价格 31/51 ¥/M tok。",
                  date: "2026-05-19",
                },
                {
                  title: "「未来都市 24h」挑战赛进行中",
                  desc: "奖池 ¥80,000，截止 06.15，目前已有 421 份投稿。",
                  date: "2026-06-01",
                },
                {
                  title: "创作者认证通道已升级",
                  desc: "新增团队认证、机构认证，分成结算改为周结。",
                  date: "2026-05-12",
                },
              ].map((a) => (
                <article
                  key={a.title}
                  className="group rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
                >
                  <div className="text-[11px] text-muted-foreground">{a.date}</div>
                  <div className="mt-1 text-sm font-medium group-hover:text-primary">{a.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{a.desc}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {action.label}
          <ChevronRight className="size-3" />
        </Link>
      )}
    </div>
  );
}
