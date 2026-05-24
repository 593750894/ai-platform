import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";
import { success, error } from "@/lib/response";
import { CreateCollaborationSchema } from "@/lib/collaborations/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collaborationId: string }> },
) {
  try {
    const { collaborationId } = await params;
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true },
        },
      },
    });
    if (!collaboration) throw new NotFoundError("合作需求");
    return success(collaboration);
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ collaborationId: string }> },
) {
  try {
    const user = await requireAuth();
    const { collaborationId } = await params;

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      select: { authorId: true },
    });
    if (!collaboration) throw new NotFoundError("合作需求");
    if (collaboration.authorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const parsed = CreateCollaborationSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("参数校验失败", parsed.error.flatten().fieldErrors);
    }

    const updated = await prisma.collaboration.update({
      where: { id: collaborationId },
      data: parsed.data,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatar: true },
        },
      },
    });

    return success(updated, "更新成功");
  } catch (err) {
    return error(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ collaborationId: string }> },
) {
  try {
    const user = await requireAuth();
    const { collaborationId } = await params;

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      select: { authorId: true },
    });
    if (!collaboration) throw new NotFoundError("合作需求");
    if (collaboration.authorId !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenError();
    }

    await prisma.collaboration.delete({ where: { id: collaborationId } });
    return success(null, "删除成功");
  } catch (err) {
    return error(err);
  }
}
