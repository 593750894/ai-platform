import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";
import { ValidationError } from "@/lib/errors";
import { success, created, error } from "@/lib/response";
import { CreatePostSchema } from "@/lib/posts/schemas";
import type { PaginatedData } from "@/types/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
    const channelId = url.searchParams.get("channelId") || undefined;
    const type = url.searchParams.get("type") || undefined;

    const where = {
      ...(channelId ? { channelId } : {}),
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
          channel: {
            select: { id: true, slug: true, name: true, icon: true, color: true },
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

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("参数校验失败", parsed.error.flatten().fieldErrors);
    }

    const { channelId, type, title, content, videoUrl, imageUrl } = parsed.data;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true },
    });
    if (!channel) {
      throw new ValidationError("频道不存在");
    }

    const post = await prisma.post.create({
      data: {
        channelId,
        authorId: user.id,
        type,
        title,
        content,
        videoUrl,
        imageUrl,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        channel: {
          select: { id: true, slug: true, name: true, icon: true, color: true },
        },
      },
    });

    return created(post, "发帖成功");
  } catch (err) {
    return error(err);
  }
}
