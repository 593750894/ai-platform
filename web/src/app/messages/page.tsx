import { AtSign, Bell, Briefcase, Heart, MessageSquare, Search, Send, Settings2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type Conv = {
  id: string;
  name: string;
  tint: string;
  preview: string;
  time: string;
  unread?: number;
  active?: boolean;
};

const CONVERSATIONS: Conv[] = [
  { id: "c1", name: "夜航 Studio", tint: "from-indigo-300 to-purple-500", preview: "你好，看到你《潮汐》的作品很喜欢，我们正在招合成师...", time: "10:24", unread: 2, active: true },
  { id: "c2", name: "陈卷卷", tint: "from-amber-300 to-orange-500", preview: "好的，那我把 prompt 模板发你～", time: "09:58", unread: 1 },
  { id: "c3", name: "Eval Lab", tint: "from-emerald-300 to-teal-500", preview: "评测报告 v2 已更新到精选，欢迎评论。", time: "昨天" },
  { id: "c4", name: "落日工作室", tint: "from-rose-300 to-red-500", preview: "本期合作已结算 ✓", time: "昨天" },
  { id: "c5", name: "SeedLand 官方", tint: "from-cyan-300 to-blue-500", preview: "你提交的「未来都市 24h」已通过审核。", time: "周三" },
];

const TABS = [
  { key: "dm", label: "私信", icon: MessageSquare, count: 5 },
  { key: "at", label: "@ 我", icon: AtSign, count: 12 },
  { key: "like", label: "赞与收藏", icon: Heart, count: 86 },
  { key: "system", label: "系统通知", icon: Bell, count: 3 },
  { key: "biz", label: "项目相关", icon: Briefcase, count: 4 },
];

const MESSAGES = [
  { from: "夜航 Studio", text: "你好！我们看到你给《潮汐》第一季写的两条评论，分析很到位。", time: "10:18", self: false },
  { from: "夜航 Studio", text: "第二季正在招 AI 合成师 2 名，远程 / 弹性时间，¥18-30k / 集。你方便聊聊吗？", time: "10:19", self: false },
  { from: "我", text: "你好！可以的，请问主要负责什么环节？", time: "10:22", self: true },
  { from: "夜航 Studio", text: "Seedance 2.0 生成 + 首尾帧补间 + 后期 AE 合成。我们用 ComfyUI 工作流，文档完备。", time: "10:24", self: false },
];

export default function MessagesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        eyebrow="消息中心"
        title="Messages"
        description="私信、@ 提醒、点赞收藏、系统通知与项目通知，全部集中在一个收件箱。"
        actions={
          <Button variant="outline" size="sm">
            <Settings2 className="size-3.5" />
            消息设置
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-80 shrink-0 flex-col border-r border-border/60 bg-background/40">
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="搜索消息..."
                className="h-8 w-full rounded-md border border-border/60 bg-card/40 pl-8 pr-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <nav className="border-b border-border/60 p-2">
            <ul className="space-y-0.5">
              {TABS.map((t, i) => {
                const Icon = t.icon;
                return (
                  <li key={t.key}>
                    <button
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        i === 0
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span className="flex-1 text-left">{t.label}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                        i === 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {t.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ul className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((c) => (
              <li key={c.id}>
                <button
                  className={`flex w-full items-center gap-3 border-b border-border/30 px-3 py-3 text-left transition-colors ${
                    c.active ? "bg-muted/40" : "hover:bg-muted/30"
                  }`}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-black/70 ${c.tint}`}>
                    {c.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground tabular-nums">{c.time}</span>
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.preview}</div>
                  </div>
                  {c.unread && (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-300 to-purple-500 text-sm font-semibold text-black/70">
              夜
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium">夜航 Studio</div>
              <div className="text-[11px] text-muted-foreground">在线 · 通常 1 小时内回复</div>
            </div>
            <Button variant="outline" size="sm">查看主页</Button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="text-center text-[11px] text-muted-foreground">2026-05-21 10:18</div>
            {MESSAGES.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.self ? "justify-end" : "justify-start"}`}>
                {!m.self && (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-300 to-purple-500 text-[11px] font-semibold text-black/70">
                    夜
                  </span>
                )}
                <div className={`max-w-md rounded-2xl px-3 py-2 text-sm ${
                  m.self
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-card/70 text-foreground/95"
                }`}>
                  {m.text}
                  <div className={`mt-1 text-[10px] ${m.self ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-card/40 p-2 focus-within:border-primary/50">
              <textarea
                rows={2}
                placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button size="sm">
                <Send className="size-3.5" />
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
