import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { success, error } from "@/lib/response";
import type { PaginatedData } from "@/types/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  try {
    const { channelId } = await params;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true },
    });
    if (!channel) throw new NotFoundError("频道");

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
    const type = url.searchParams.get("type") || undefined;

    const where = {
      channelId,
      ...(type ? { type: type as never } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      }),
      prisma.post.count({ where }),
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
