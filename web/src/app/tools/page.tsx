import Link from "next/link";
import { Filter, Search, Sparkles, Wrench } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ToolCard, type ToolCardItem } from "@/components/feed/tool-card";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  isToolCategoryValue,
  toolCategoryMeta,
  TOOL_CATEGORY_ORDER,
  type ToolCategoryValue,
  type ToolPricingValue,
} from "@/lib/tools/categories";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; q?: string }>;

async function getTools(category: ToolCategoryValue | null, q: string | null) {
  const trimmed = q?.trim();
  return prisma.tool.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(trimmed
        ? {
            OR: [
              { name: { contains: trimmed, mode: "insensitive" } },
              { description: { contains: trimmed, mode: "insensitive" } },
              { useCase: { contains: trimmed, mode: "insensitive" } },
              { tags: { has: trimmed } },
            ],
          }
        : {}),
    },
    orderBy: [{ isOfficial: "desc" }, { createdAt: "desc" }],
    take: 120,
  });
}

async function getCategoryCounts(
  q: string | null,
): Promise<Record<string, number>> {
  const trimmed = q?.trim();
  const rows = await prisma.tool.groupBy({
    by: ["category"],
    where: trimmed
      ? {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { description: { contains: trimmed, mode: "insensitive" } },
            { useCase: { contains: trimmed, mode: "insensitive" } },
            { tags: { has: trimmed } },
          ],
        }
      : undefined,
    _count: { _all: true },
  });
  const result: Record<string, number> = {};
  for (const row of rows) result[row.category] = row._count._all;
  return result;
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category: rawCategory, q: rawQ } = await searchParams;
  const activeCategory = isToolCategoryValue(rawCategory) ? rawCategory : null;
  const query = typeof rawQ === "string" ? rawQ : "";

  const [tools, counts] = await Promise.all([
    getTools(activeCategory, query || null),
    getCategoryCounts(query || null),
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const items: ToolCardItem[] = tools.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    url: t.url,
    category: t.category,
    useCase: t.useCase,
    logoUrl: t.logoUrl,
    pricing: t.pricing as ToolPricingValue,
    tags: t.tags,
    isOfficial: t.isOfficial,
  }));

  const queryWithCategory = (cat: ToolCategoryValue | null) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (query) params.set("q", query);
    const s = params.toString();
    return s ? `/tools?${s}` : "/tools";
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="工具库"
        title="Tools · AI 视频工具导航"
        description="社区精选 + 官方集成的 AI 视频全链路工具集。按工具类型筛选，或直接搜索名称、标签、适用场景。"
        actions={
          <>
            <form method="GET" action="/tools" className="relative">
              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
              )}
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="搜索工具 / 标签 / 场景..."
                className="h-8 w-56 rounded-md border border-border/60 bg-card/40 pl-8 pr-3 text-sm outline-none focus:border-primary/50"
              />
            </form>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/community" />}
            >
              <Wrench className="size-3.5" />
              推荐工具
            </Button>
          </>
        }
      />

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {/* 分类筛选 */}
        <section className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            工具类型
            <span className="text-muted-foreground/60">
              · 共 {total} 个{query ? `匹配 "${query}" 的` : ""}工具
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              href={queryWithCategory(null)}
              active={!activeCategory}
              label="全部"
              emoji="🌐"
              count={total}
              tone="bg-primary/15 text-primary border-primary/30"
            />
            {TOOL_CATEGORY_ORDER.map((c) => {
              const meta = toolCategoryMeta(c);
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

        {/* 当前过滤状态 */}
        <section className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {activeCategory ? (
              <>
                筛选：
                <span className="font-medium text-foreground">
                  {toolCategoryMeta(activeCategory).label}
                </span>
                <span className="text-muted-foreground/60">
                  · {items.length} 个工具
                </span>
              </>
            ) : query ? (
              <>
                关键词：
                <span className="font-medium text-foreground">
                  &ldquo;{query}&rdquo;
                </span>
                <span className="text-muted-foreground/60">
                  · 共 {items.length} 条匹配
                </span>
              </>
            ) : (
              <>
                按推荐排序 · 官方工具置顶 ·{" "}
                <span className="font-medium text-foreground">
                  {items.length}
                </span>{" "}
                个工具
              </>
            )}
          </div>
          {(activeCategory || query) && (
            <Link
              href="/tools"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              清除筛选
            </Link>
          )}
        </section>

        {items.length === 0 ? (
          <EmptyState hasFilter={!!(activeCategory || query)} />
        ) : (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {items.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </section>
        )}

        <section className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            没找到合适的工具？前往社区{" "}
            <Link
              href="/community/tooling"
              className="font-medium text-primary hover:underline"
            >
              工具与流水线频道
            </Link>{" "}
            推荐或求助。
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

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        {hasFilter
          ? "当前筛选条件下没有工具。换一个类型或关键词试试。"
          : "工具库还没有数据，等待管理员录入。"}
      </p>
      {hasFilter && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/tools" />}
          >
            清除筛选
          </Button>
        </div>
      )}
    </div>
  );
}
