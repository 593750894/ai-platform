import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";
import { ForbiddenError } from "@/lib/errors";
import { success, error } from "@/lib/response";
import type { PaginatedData } from "@/types/api";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN") throw new ForbiddenError();

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
    const search = url.searchParams.get("search")?.trim() || undefined;
    const role = url.searchParams.get("role") || undefined;

    const where: Record<string, unknown> = {};

    if (role && ["USER", "MOD", "ADMIN"].includes(role)) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          role: true,
          industryRole: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              works: true,
              collaborations: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const data: PaginatedData<(typeof items)[number]> = {
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
    return success(data);
  } catch (err) {
    return error(err);
  }
}
