import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bell,
  ChevronRight,
  Database,
  Film,
  Flag,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "今日 DAU", value: "8,412", delta: "+5.2%", tone: "text-emerald-400" },
  { label: "今日新作品", value: "412", delta: "+12%", tone: "text-emerald-400" },
  { label: "待审核工单", value: "23", delta: "↑ 7", tone: "text-amber-400" },
  { label: "Ark API 健康度", value: "99.94%", delta: "p95 1.8s", tone: "text-cyan-400" },
];

const MODULES = [
  { href: "/admin/users", icon: Users, title: "用户管理", desc: "查询、封禁、认证审核、角色权限" },
  { href: "/admin/content", icon: Film, title: "内容审核", desc: "作品 / 评论 / 私信审核、申诉处理" },
  { href: "/admin/reports", icon: Flag, title: "举报与申诉", desc: "举报队列、申诉队列、处置记录" },
  { href: "/admin/projects", icon: Layers, title: "项目与协作", desc: "项目审核、纠纷仲裁、平台抽佣" },
  { href: "/admin/billing", icon: Banknote, title: "结算与账单", desc: "创作者分成、提现、对账、发票" },
  { href: "/admin/tools", icon: Wrench, title: "工具与模型", desc: "工具上架、模型评分、白名单" },
  { href: "/admin/tags", icon: Tag, title: "标签与频道", desc: "频道树、话题、标签合并" },
  { href: "/admin/notice", icon: Bell, title: "公告与推送", desc: "全站公告、定向推送、模板管理" },
  { href: "/admin/audit", icon: ShieldCheck, title: "审计日志", desc: "管理员操作流水、敏感操作回溯" },
  { href: "/admin/system", icon: Database, title: "系统设置", desc: "Ark Key、TOS bucket、限流、Feature Flag" },
];

const ALERTS = [
  { tone: "danger", icon: AlertTriangle, title: "Ark API 5xx 突增", desc: "近 5min 错误率 2.4%，已自动降级到 Fast 模式", time: "8 min ago" },
  { tone: "warn", icon: Activity, title: "TOS 上传队列堆积", desc: "积压 142 条任务，worker 自动扩容中", time: "21 min ago" },
  { tone: "info", icon: Sparkles, title: "Seedance 2.0 1080P 用量首日报告已生成", desc: "查看 /admin/reports/seedance-1080p-day1", time: "1 h ago" },
];

const REVIEW_QUEUE = [
  { type: "作品", title: "未来都市 24h v2", from: "MidnightAI", risk: "low" },
  { type: "评论", title: '"这是抄袭…"', from: "匿名用户", risk: "mid" },
  { type: "项目", title: "招募 AI 真人换脸合成师", from: "X 工作室", risk: "high" },
  { type: "认证", title: "团队认证申请 · 落日工作室", from: "落日工作室", risk: "low" },
];

const RISK_TONE: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-300",
  mid: "bg-amber-500/15 text-amber-300",
  high: "bg-rose-500/15 text-rose-300",
};

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="管理后台"
        title="Admin Console"
        description="面向官方运营 / 审核 / 财务 / 技术的统一后台入口。当前账号：zhaobohao793 · 角色：超级管理员。"
        actions={
          <>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/audit" />}>
              <ShieldCheck className="size-3.5" />
              审计日志
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/admin/system" />}>
              <Gauge className="size-3.5" />
              系统设置
            </Button>
          </>
        }
      />

      <div className="space-y-7 px-6 py-6 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card/40 p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</div>
              <div className={`mt-1 text-[11px] ${s.tone}`}>{s.delta}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="mb-3 text-base font-semibold tracking-tight">管理模块</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {MODULES.map(({ href, icon: Icon, title, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium group-hover:text-primary">{title}</div>
                      <ChevronRight className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="mb-3 text-base font-semibold tracking-tight">系统告警</h2>
              <div className="space-y-2">
                {ALERTS.map((a) => {
                  const Icon = a.icon;
                  const tone =
                    a.tone === "danger"
                      ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
                      : a.tone === "warn"
                        ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
                        : "border-cyan-500/30 bg-cyan-500/5 text-cyan-300";
                  return (
                    <div key={a.title} className={`flex items-start gap-3 rounded-xl border p-3 ${tone}`}>
                      <Icon className="mt-0.5 size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{a.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{a.desc}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground/70">{a.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight">待审核队列</h2>
                <Link href="/admin/content" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
                  全部 <ArrowRight className="ml-1 size-3" />
                </Link>
              </div>
              <ul className="overflow-hidden rounded-xl border border-border/60 bg-card/40 divide-y divide-border/40">
                {REVIEW_QUEUE.map((q) => (
                  <li key={q.title} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{q.type}</span>
                    <span className="line-clamp-1 flex-1 text-sm">{q.title}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${RISK_TONE[q.risk]}`}>
                      {q.risk === "high" ? "高风险" : q.risk === "mid" ? "中" : "低"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
