import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { success, error } from "@/lib/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        industryRole: true,
        expertise: true,
        favoriteTools: true,
        portfolioLinks: true,
        createdAt: true,
        _count: { select: { posts: true, works: true, collaborations: true } },
      },
    });
    if (!user) throw new NotFoundError("用户");
    return success(user);
  } catch (err) {
    return error(err);
  }
}
