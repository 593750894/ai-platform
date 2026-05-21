import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

import { requireUser } from "@/lib/auth/guard";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ShowcaseUploadPage() {
  const user = await requireUser("/showcase/upload");

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="发布作品"
        title="上传你的 AI 视频作品"
        description="阶段 3 仅打通登录态，作品上传表单将在后续阶段完成。"
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/showcase" />}
          >
            <ArrowLeft className="size-3.5" />
            返回作品广场
          </Button>
        }
      />
      <div className="px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
          <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-base font-medium">
            欢迎回来，{user.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            登录态已生效（@{user.username}）。上传表单（视频文件、标题、prompt、参数等）将在阶段 4 实现。
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/profile/${user.id}`} />}
            >
              查看我的主页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
