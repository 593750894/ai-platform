import Link from "next/link";
import { Eye, Heart, ImageIcon, MessageCircle, Pin, Play } from "lucide-react";

import { cn, formatRelativeTime } from "@/lib/utils";
import { postTypeMeta, type PostTypeValue } from "@/lib/post-types";

export type PostCardData = {
  id: string;
  title: string;
  content: string;
  type: PostTypeValue;
  videoUrl: string | null;
  imageUrl: string | null;
  views: number;
  likeCount: number;
  commentCount: number;
  pinned: boolean;
  createdAt: Date | string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  channel?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string;
  };
};

export function PostCard({
  post,
  showChannel = false,
}: {
  post: PostCardData;
  showChannel?: boolean;
}) {
  const meta = postTypeMeta(post.type);
  const hasMedia = Boolean(post.videoUrl || post.imageUrl);

  return (
    <article
      className={cn(
        "group rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70",
        post.pinned && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <div className="flex items-center gap-2 text-[11px]">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-medium",
            meta.tone,
          )}
        >
          {meta.label}
        </span>
        {post.pinned && (
          <span className="inline-flex items-center gap-1 text-amber-400">
            <Pin className="size-3" />
            置顶
          </span>
        )}
        {showChannel && post.channel && (
          <Link
            href={`/community/${post.channel.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {post.channel.icon && <span>{post.channel.icon}</span>}
            <span>{post.channel.name}</span>
          </Link>
        )}
        <span className="ml-auto text-muted-foreground tabular-nums">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      <Link
        href={`/post/${post.id}`}
        className="mt-2 block text-base font-semibold leading-snug text-foreground/95 group-hover:text-primary"
      >
        {post.title}
      </Link>

      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        {post.content}
      </p>

      {hasMedia && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          {post.videoUrl && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-primary">
              <Play className="size-3" />
              视频
            </span>
          )}
          {post.imageUrl && (
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
              <ImageIcon className="size-3" />
              图片
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {post.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="size-6 rounded-full border border-border/60"
            />
          ) : (
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground">
              {post.author.name.slice(0, 1)}
            </span>
          )}
          <Link
            href={`/profile/${post.author.id}`}
            className="font-medium text-foreground/90 transition-colors hover:text-primary"
          >
            {post.author.name}
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3 tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" />
            {post.views}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3" />
            {post.likeCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </article>
  );
}
