import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";
import { ValidationError } from "@/lib/errors";
import { success, created, error } from "@/lib/response";
import { StartConversationSchema } from "@/lib/messages/schemas";
import type { PaginatedData } from "@/types/api";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 20),
    );

    const where = {
      participants: { some: { userId: user.id } },
    };

    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, username: true, name: true, avatar: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, username: true, name: true, avatar: true },
              },
            },
          },
        },
      }),
      prisma.conversation.count({ where }),
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
    const parsed = StartConversationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("参数校验失败", parsed.error.flatten().fieldErrors);
    }

    const { targetUserId } = parsed.data;

    if (targetUserId === user.id) {
      throw new ValidationError("不能和自己创建会话");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!targetUser) {
      throw new ValidationError("目标用户不存在");
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (existing) {
      return success(existing, "会话已存在");
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user.id }, { userId: targetUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    return created(conversation, "会话创建成功");
  } catch (err) {
    return error(err);
  }
}
