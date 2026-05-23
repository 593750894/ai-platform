import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";
import { ValidationError } from "@/lib/errors";
import { success, created, error } from "@/lib/response";
import { CreateWorkSchema } from "@/lib/works/schemas";
import type { PaginatedData } from "@/types/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
    const category = url.searchParams.get("category") || undefined;
    const tool = url.searchParams.get("tool") || undefined;
    const authorId = url.searchParams.get("authorId") || undefined;

    const where = {
      isPublic: true,
      ...(category ? { category: category as never } : {}),
      ...(authorId ? { authorId } : {}),
      ...(tool ? { tools: { has: tool } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.work.findMany({
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
      prisma.work.count({ where }),
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
    const parsed = CreateWorkSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("参数校验失败", parsed.error.flatten().fieldErrors);
    }

    const { title, description, thumbnailUrl, videoUrl, category, tools } = parsed.data;

    const work = await prisma.work.create({
      data: {
        authorId: user.id,
        title,
        description,
        thumbnailUrl,
        videoUrl,
        category,
        tools,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true },
        },
      },
    });

    return created(work, "作品发布成功");
  } catch (err) {
    return error(err);
  }
}
