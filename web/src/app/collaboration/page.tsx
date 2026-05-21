import Link from "next/link";
import {
  Banknote,
  Briefcase,
  Clock,
  MapPin,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  title: string;
  org: string;
  orgTint: string;
  budget: string;
  duration: string;
  location: string;
  roles: string[];
  tags: string[];
  verified?: boolean;
  status: "招募中" | "急招" | "面试中";
};

const PROJECTS: Project[] = [
  {
    id: "p001",
    title: "AI 短剧《潮汐》第二季 · 12 集",
    org: "夜航 Studio",
    orgTint: "from-indigo-300 to-purple-500",
    budget: "¥18-30 / 集",
    duration: "3 个月",
    location: "远程 · 可上海打卡",
    roles: ["AI 合成师 × 2", "分镜导演 × 1", "后期调色 × 1"],
    tags: ["Seedance 2.0", "短剧", "长期"],
    verified: true,
    status: "急招",
  },
  {
    id: "p002",
    title: "电商品牌 618 系列广告 · 6 支短视频",
    org: "落日工作室",
    orgTint: "from-rose-300 to-red-500",
    budget: "¥8000 / 支",
    duration: "2 周",
    location: "全远程",
    roles: ["创意编剧 × 1", "AI 视频生成师 × 2"],
    tags: ["广告", "1:1", "9:16", "短期"],
    verified: true,
    status: "招募中",
  },
  {
    id: "p003",
    title: "独立游戏 CG 开场动画（约 90s）",
    org: "Pixel·林",
    orgTint: "from-fuchsia-300 to-purple-500",
    budget: "¥25,000 一次性",
    duration: "1 个月",
    location: "远程",
    roles: ["美术导演 × 1", "AI 角色生成师 × 1"],
    tags: ["游戏 CG", "数字人", "16:9"],
    status: "面试中",
  },
  {
    id: "p004",
    title: "MV 制作：独立乐队《灯塔》单曲",
    org: "MidnightAI",
    orgTint: "from-cyan-300 to-blue-500",
    budget: "¥12,000-18,000",
    duration: "3 周",
    location: "远程",
    roles: ["导演 × 1", "AI 视觉 × 2", "剪辑 × 1"],
    tags: ["MV", "Seedance 2.0", "可灵 2.0"],
    verified: true,
    status: "招募中",
  },
  {
    id: "p005",
    title: "企业宣传片：3 分钟科技公司 brand video",
    org: "Cube Studio",
    orgTint: "from-slate-300 to-zinc-500",
    budget: "¥35,000",
    duration: "1 个月",
    location: "北京 / 远程结合",
    roles: ["制片 × 1", "AI 视觉 × 2", "音效 × 1"],
    tags: ["品牌", "16:9", "中等周期"],
    status: "招募中",
  },
  {
    id: "p006",
    title: "纪录短片：非遗匠人系列 · 第一辑",
    org: "Film·北",
    orgTint: "from-yellow-300 to-orange-500",
    budget: "¥50,000 项目费",
    duration: "2 个月",
    location: "成都 / 重庆 + 远程",
    roles: ["编剧 × 1", "AI 视觉重建 × 2", "音乐 × 1"],
    tags: ["纪录片", "Seedance 2.0", "长期"],
    verified: true,
    status: "招募中",
  },
];

const TALENTS = [
  { name: "陈卷卷", role: "AI 视频导演", skills: ["Seedance", "短剧", "分镜"], price: "¥2k-5k / 天", tint: "from-amber-300 to-orange-500" },
  { name: "MidnightAI", role: "视觉特效师", skills: ["合成", "调色", "ComfyUI"], price: "¥1.5k-3k / 天", tint: "from-cyan-300 to-blue-500" },
  { name: "Pixel·林", role: "角色 / 数字人", skills: ["LoRA 训练", "rigging"], price: "¥3k-6k / 天", tint: "from-fuchsia-300 to-purple-500" },
];

const STATUS_TONE: Record<Project["status"], string> = {
  招募中: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  急招: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  面试中: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function CollaborationPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="项目合作"
        title="Collaboration"
        description="发布项目需求、组队接单、寻找认证创作者。所有交付走平台托管，结算自动分账。"
        actions={
          <>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/collaboration/talents" />}>
              <Users className="size-3.5" />
              人才库
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/collaboration/new" />}>
              <Plus className="size-3.5" />
              发布项目
            </Button>
          </>
        }
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "在招项目", value: "186", icon: Briefcase },
            { label: "认证创作者", value: "2,847", icon: UserPlus },
            { label: "本月成交", value: "¥412 万", icon: Banknote },
            { label: "平均回应", value: "< 4h", icon: Clock },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                  <div className="text-lg font-semibold tabular-nums">{s.value}</div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">最新项目</h2>
              <div className="flex gap-1 text-xs">
                {["全部", "短剧", "广告", "MV", "游戏 CG", "纪录"].map((t, i) => (
                  <button
                    key={t}
                    className={`rounded-md px-2 py-1 transition-colors ${
                      i === 0 ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {PROJECTS.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-semibold text-black/70 ${p.orgTint}`}
                    >
                      {p.org.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="line-clamp-1 text-sm font-medium group-hover:text-primary">{p.title}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_TONE[p.status]}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          {p.org}
                          {p.verified && <ShieldCheck className="size-3 text-cyan-400" />}
                        </span>
                        <Sep />
                        <span className="inline-flex items-center gap-1"><Banknote className="size-3" />{p.budget}</span>
                        <Sep />
                        <span className="inline-flex items-center gap-1"><Clock className="size-3" />{p.duration}</span>
                        <Sep />
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{p.location}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.roles.map((r) => (
                          <span key={r} className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px]">
                            {r}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((t) => (
                            <span key={t} className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">收藏</Button>
                          <Button size="sm" nativeButton={false} render={<Link href={`/collaboration/${p.id}`} />}>
                            投递
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold tracking-tight">推荐人才</h2>
            <div className="space-y-3">
              {TALENTS.map((t) => (
                <div key={t.name} className="rounded-xl border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-black/70 ${t.tint}`}>
                      {t.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.skills.map((s) => (
                      <span key={s} className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{t.price}</span>
                    <Button size="xs" variant="outline">邀请</Button>
                  </div>
                </div>
              ))}
              <Link
                href="/collaboration/talents"
                className="block rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                查看全部 2,847 位创作者 →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Sep() {
  return <span className="text-muted-foreground/40">·</span>;
}
