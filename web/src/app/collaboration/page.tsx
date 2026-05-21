import Link from "next/link";
import {
  Banknote,
  Briefcase,
  Clock,
  Filter,
  Handshake,
  Plus,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  CollaborationCard,
  type CollabCardItem,
} from "@/components/feed/collaboration-card";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  COLLAB_CATEGORY_ORDER,
  COLLAB_STATUS_LABEL,
  COLLAB_STATUS_TONE,
  COLLAB_STATUS_VALUES,
  collabCategoryMeta,
  type CollabCategoryValue,
  type CollabLocationValue,
  type CollabStatusValue,
  type CollabWorkModeValue,
} from "@/lib/collaborations/categories";
import type {
  CollaborationCategory,
  CollaborationStatus,
} from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; status?: string }>;

async function getCollaborations(
  category: CollabCategoryValue | null,
  status: CollabStatusValue | null,
) {
  return prisma.collaboration.findMany({
    where: {
      ...(category ? { category: category as CollaborationCategory } : {}),
      ...(status ? { status: status as CollaborationStatus } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          industryRole: true,
        },
      },
    },
    take: 80,
  });
}

async function getCategoryCounts(): Promise<Record<string, number>> {
  const rows = await prisma.collaboration.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const result: Record<string, number> = {};
  for (const row of rows) result[row.category] = row._count._all;
  return result;
}

async function getStats() {
  const [openCount, totalCount, weekCount] = await Promise.all([
    prisma.collaboration.count({ where: { status: "OPEN" } }),
    prisma.collaboration.count(),
    prisma.collaboration.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  const creatorCount = await prisma.user.count();
  return { openCount, totalCount, weekCount, creatorCount };
}

export default async function CollaborationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category: rawCategory, status: rawStatus } = await searchParams;
  const activeCategory =
    rawCategory && (COLLAB_CATEGORY_ORDER as string[]).includes(rawCategory)
      ? (rawCategory as CollabCategoryValue)
      : null;
  const activeStatus =
    rawStatus && (COLLAB_STATUS_VALUES as readonly string[]).includes(rawStatus)
      ? (rawStatus as CollabStatusValue)
      : null;

  const [rows, counts, stats] = await Promise.all([
    getCollaborations(activeCategory, activeStatus),
    getCategoryCounts(),
    getStats(),
  ]);

  const items: CollabCardItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as CollabCategoryValue,
    workMode: r.workMode as CollabWorkModeValue,
    location: r.location as CollabLocationValue,
    status: r.status as CollabStatusValue,
    budget: r.budget,
    tags: r.tags,
    createdAt: r.createdAt,
    author: r.author,
  }));

  const totalForCategory = activeCategory
    ? counts[activeCategory] ?? 0
    : stats.totalCount;

  const queryWithStatus = (status: CollabStatusValue | null) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (status) params.set("status", status);
    const s = params.toString();
    return s ? `/collaboration?${s}` : "/collaboration";
  };

  const queryWithCategory = (cat: CollabCategoryValue | null) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (activeStatus) params.set("status", activeStatus);
    const s = params.toString();
    return s ? `/collaboration?${s}` : "/collaboration";
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="项目合作"
        title="Collaboration · 找团队 · 接项目"
        description="发布合作需求、组队接单、找认证创作者。从 AI 短剧到数字人、从 ComfyUI 搭建到联合创始人。"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/showcase" />}
            >
              <Handshake className="size-3.5" />
              看作品库
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/collaboration/new" />}
            >
              <Plus className="size-3.5" />
              发布合作
            </Button>
          </>
        }
      />

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {/* 顶部统计 */}
        <section className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "开放中需求", value: stats.openCount, icon: Briefcase, tone: "text-emerald-300" },
            { label: "本周新发布", value: stats.weekCount, icon: Clock, tone: "text-cyan-300" },
            { label: "累计合作", value: stats.totalCount, icon: Handshake, tone: "text-fuchsia-300" },
            { label: "平台创作者", value: stats.creatorCount, icon: UserPlus, tone: "text-amber-300" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <span className={cn("flex size-9 items-center justify-center rounded-lg bg-primary/10", s.tone)}>
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

        {/* 分类筛选 */}
        <section className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            合作类型
            <span className="text-muted-foreground/60">
              · 共 {stats.totalCount} 个合作机会
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              href={queryWithCategory(null)}
              active={!activeCategory}
              label="全部"
              emoji="🌐"
              count={stats.totalCount}
              tone="bg-primary/15 text-primary border-primary/30"
            />
            {COLLAB_CATEGORY_ORDER.map((c) => {
              const meta = collabCategoryMeta(c);
              return (
                <CategoryChip
                  key={c}
                  href={queryWithCategory(c)}
                  active={activeCategory === c}
                  label={meta.label}
                  emoji={meta.emoji}
                  count={counts[c] ?? 0}
                  tone={meta.tone}
                />
              );
            })}
          </div>
        </section>

        {/* 状态过滤 + 排序 */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            {activeCategory ? (
              <>
                筛选：
                <span className="font-medium text-foreground">
                  {collabCategoryMeta(activeCategory).label}
                </span>
                <span className="text-muted-foreground/60">
                  · {totalForCategory} 个机会
                </span>
              </>
            ) : (
              <>
                按状态排序 ·{" "}
                <span className="font-medium text-foreground">{items.length}</span>{" "}
                条合作信息
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <StatusChip href={queryWithStatus(null)} active={!activeStatus} label="全部状态" tone="bg-muted/50 text-foreground" />
            {COLLAB_STATUS_VALUES.map((s) => (
              <StatusChip
                key={s}
                href={queryWithStatus(s)}
                active={activeStatus === s}
                label={COLLAB_STATUS_LABEL[s]}
                tone={COLLAB_STATUS_TONE[s]}
              />
            ))}
          </div>
        </section>

        {items.length === 0 ? (
          <EmptyState hasFilter={!!(activeCategory || activeStatus)} />
        ) : (
          <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {items.map((item) => (
              <CollaborationCard key={item.id} item={item} />
            ))}
          </section>
        )}

        {/* 提示 / 引导 */}
        <section className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            没有找到合适的合作？
            <Link
              href="/collaboration/new"
              className="ml-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <Banknote className="size-3.5" />
              直接发布你的需求
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function CategoryChip({
  href,
  active,
  label,
  emoji,
  count,
  tone,
}: {
  href: string;
  active: boolean;
  label: string;
  emoji: string;
  count: number;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? `${tone} ring-1 ring-primary/40`
          : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] tabular-nums",
          active ? "bg-white/10" : "bg-muted/60",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function StatusChip({
  href,
  active,
  label,
  tone,
}: {
  href: string;
  active: boolean;
  label: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 transition-colors",
        active
          ? `${tone} border-current/40 ring-1 ring-primary/20`
          : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        {hasFilter
          ? "当前筛选条件下还没有合作需求。换一个分类，或者第一个发布吧。"
          : "合作板块还没有任何需求，欢迎发布第一条。"}
      </p>
      <div className="mt-4 inline-flex gap-2">
        {hasFilter && (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/collaboration" />}
          >
            清除筛选
          </Button>
        )}
        <Button size="sm" nativeButton={false} render={<Link href="/collaboration/new" />}>
          <Plus className="size-3.5" />
          发布合作
        </Button>
      </div>
    </div>
  );
}
