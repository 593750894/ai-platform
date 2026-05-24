import { prisma } from "@/lib/db";
import { success, error } from "@/lib/response";
import { parsePagination, paginatedResponse } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(url);
    const search = url.searchParams.get("search")?.trim() || undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    const select = {
      id: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      industryRole: true,
      expertise: true,
      favoriteTools: true,
      createdAt: true,
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
      prisma.user.count({ where }),
    ]);

    return success(paginatedResponse(items, total, page, pageSize));
  } catch (err) {
    return error(err);
  }
}
