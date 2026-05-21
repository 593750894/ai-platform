import Link from "next/link";
import { ArrowLeft, Handshake } from "lucide-react";

import { requireUser } from "@/lib/auth/guard";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CollaborationNewPage() {
  const user = await requireUser("/collaboration/new");

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="发布合作需求"
        title="发布合作或招募信息"
        description="阶段 3 仅打通登录态，合作需求表单将在后续阶段完成。"
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/collaboration" />}
          >
            <ArrowLeft className="size-3.5" />
            返回合作页
          </Button>
        }
      />
      <div className="px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
          <Handshake className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-base font-medium">已登录：{user.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            登录态有效。需求 / 提供类型 + 预算 + 标签的表单将在阶段 4 实现。
          </p>
        </div>
      </div>
    </div>
  );
}
