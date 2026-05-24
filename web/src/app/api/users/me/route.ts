import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";
import { ValidationError } from "@/lib/errors";
import { success, error } from "@/lib/response";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  avatar: z.string().url().max(2048).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  industryRole: z.string().trim().max(50).optional().nullable(),
  expertise: z.array(z.string().trim().max(30)).max(10).optional(),
  favoriteTools: z.array(z.string().trim().max(30)).max(10).optional(),
  portfolioLinks: z.array(z.string().url().max(2048)).max(5).optional(),
  contact: z.string().trim().max(200).optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        industryRole: true,
        expertise: true,
        favoriteTools: true,
        portfolioLinks: true,
        contact: true,
        createdAt: true,
        _count: { select: { posts: true, works: true, collaborations: true } },
      },
    });
    return success(profile);
  } catch (err) {
    return error(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("参数校验失败", parsed.error.flatten().fieldErrors);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        industryRole: true,
        expertise: true,
        favoriteTools: true,
        portfolioLinks: true,
        contact: true,
        createdAt: true,
      },
    });

    return success(updated, "个人资料已更新");
  } catch (err) {
    return error(err);
  }
}
