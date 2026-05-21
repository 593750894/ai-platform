import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { requireUser } from "@/lib/auth/guard";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CommunityNewPostPage() {
  const user = await requireUser("/community/new");

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="发布帖子"
        title="向社区发帖"
        description="阶段 3 仅打通登录态，帖子表单将在后续阶段完成。"
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/community" />}
          >
            <ArrowLeft className="size-3.5" />
            返回社区
          </Button>
        }
      />
      <div className="px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
          <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-base font-medium">已登录：{user.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            登录态有效。帖子标题 + 正文 + 频道选择的表单将在阶段 4 实现。
          </p>
        </div>
      </div>
    </div>
  );
}
