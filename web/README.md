# SeedLand · V — 社群 Web

AI 视频创作者社群平台。Next.js 16 App Router + Prisma 7 + PostgreSQL。
前端走 Server Components + Server Actions，后端提供完整 REST API（`/api/*`）供前端和第三方集成。

## 功能清单（MVP）

| 模块 | 能力 |
|---|---|
| 账号 | 邮箱/用户名 + 密码注册、登录、登出；JWT cookie 会话（7 天）；bcrypt 哈希；ADMIN / MOD / USER 三级角色 |
| 个人主页 | 头像、昵称、行业角色、擅长领域、常用工具、作品链接、联系方式；本人可编辑 |
| 社区频道 | 12 个内置频道；任何登录用户可创建自定义频道；按频道浏览帖子 |
| 帖子 | 7 种类型（讨论 / 展示 / 合作 / 工具推荐 / 教程 / 提问 / 资讯）；支持视频/封面 URL；浏览数、点赞数、评论数 |
| 评论 | 嵌套回复（一级 + 子评论）、点赞 |
| 作品广场 | AI 视频作品发布；9 种作品分类；模型（Seedance 2.0 / Fast）+ 4 模式标签；浏览、点赞、收藏 |
| 合作大厅 | "我要找 / 我可提供" 两类需求；10 种合作类别、6 种工作模式、3 种地点；状态机：OPEN / IN_PROGRESS / CLOSED |
| 工具库 | 11 类 29 个常用 AI 视频工具，标签筛选 + 关键字搜索 |
| 私信 | 1:1 会话；从个人主页一键发起；最后阅读时间标记 |
| 互动 | 点赞 / 收藏（帖子、作品、评论），冗余计数字段 |
| 管理后台 | `/admin` — 用户禁言、帖子下架、作品下架、合作关闭、工具增删（仅 ADMIN/MOD 可见） |
| UI 体系 | shadcn/ui + Tailwind v4；语义化设计 token；移动端底部导航；空 / 加载 / 错误状态组件 |

## 技术栈

- **Next.js 16.2** (App Router, Server Components, Server Actions, Turbopack)
- **React 19.2**
- **Prisma 7.8** + `@prisma/adapter-pg` + node-postgres
- **PostgreSQL 16**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** + `tw-animate-css` + shadcn/ui
- **jose** (HS256 JWT 会话) + **bcryptjs** (密码)
- **zod 4** (表单与 Server Action 输入校验)

## 安装

需要 Node.js 20+ 与可达的 Postgres（本地或远端）。

```bash
cd web
npm install
```

## 环境变量

复制示例并按注释填写：

```bash
cp .env.example .env
```

| 变量 | 必填 | 说明 |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres 连接串。本地最简：`npx prisma dev start seedlandv` 后用打印出来的 `postgres://...` |
| `AUTH_SECRET`  | ✅ | HS256 签名密钥，建议 base64-32 字节：`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `SHADOW_DATABASE_URL` | | Prisma migrate dev 的影子数据库 URL（仅 Prisma Dev 环境需要） |

## 数据库

三选一：

```bash
# A. Prisma Dev（零安装本地 Postgres，开发首选）
npx prisma dev start seedlandv         # 启动后会打印 DATABASE_URL，粘贴进 .env

# B. Docker compose（在仓库根目录）
docker compose -f docker-compose.dev.yml up -d postgres

# C. 远端 Postgres（Neon / Supabase / RDS …）直接填 .env
```

## 初始化 schema + 种子数据

```bash
npm run db:generate         # 生成 Prisma Client 到 src/generated/prisma
npm run db:push             # 把 schema 同步到数据库（开发期；生产用 db:migrate:deploy）
npm run seed                # 写入演示数据（8 用户 / 12 频道 / 20 帖 / 10 作品 / 8 合作 / 15 工具 …）
```

Seed 可重复执行（先清空再写入）。种子用户统一密码：`seedland-dev-2026`

| 邮箱 | 用户名 | 角色 |
|---|---|---|
| admin@aivideohub.com | admin | **ADMIN** |
| creator@aivideohub.com | ai_creator | MOD |
| client@aivideohub.com | ecom_client | USER |
| comic@seedland.dev | comic_artist | USER |
| drama@seedland.dev | drama_director | USER |
| avatar@seedland.dev | digital_human | USER |
| comfy@seedland.dev | comfyui_dev | USER |
| anim@seedland.dev | ai_animator | USER |

> ⚠️ `db:push` 会按 schema 改表，必要时丢列。生产请走 `prisma migrate`：
> ```bash
> npx prisma migrate dev --name init       # 首次本地创建迁移
> npm run db:migrate:deploy                # 在目标环境执行已生成的迁移
> ```

## 本地启动

```bash
npm run dev
# → http://localhost:3000
```

常用脚本：

| 命令 | 作用 |
|---|---|
| `npm run dev` | Next.js 开发服（Turbopack） |
| `npm run build` | 生产构建（含 TypeScript 检查） |
| `npm run start` | 跑生产构建 |
| `npm run lint` | ESLint |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:push` | 推 schema 到数据库（开发期） |
| `npm run db:migrate` | 生成 + 应用迁移（开发期） |
| `npm run db:migrate:deploy` | 仅应用已存在的迁移（生产） |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run db:reset` | 重置数据库并重跑迁移 + 种子 |
| `npm run seed` | 只跑种子脚本 |

## API 路由总表

完整文档见 [API.md](API.md)。**共计 54 个接口端点。**

| 模块 | 端点数 | 说明 |
|------|--------|------|
| 认证 | 4 | 注册 / 登录 / 当前用户 / 登出 |
| 用户 | 4 | 列表 / 我的资料 / 更新资料 / 公开资料 |
| 频道 | 3 | 列表 / 详情 / 频道帖子 |
| 帖子 | 7 | 列表 / 创建 / 详情 / 更新 / 删除 / 评论列表 / 发评论 |
| 评论 | 2 | 更新 / 删除 |
| 作品 | 5 | 列表 / 创建 / 详情 / 更新 / 删除 |
| 合作 | 5 | 列表 / 创建 / 详情 / 更新 / 删除 |
| 工具 | 2 | 列表 / 详情 |
| 互动 | 3 | 点赞 / 收藏 / 状态查询 |
| 私信 | 6 | 会话列表 / 发起 / 详情 / 已读 / 消息列表 / 发消息 |
| 管理后台 | 16 | 统计 + 用户/帖子/作品/合作/工具 CRUD |
| 系统 | 1 | 健康检查 |

## 项目结构

```
web/
├── prisma/
│   ├── schema.prisma          # 数据模型（13 张表）
│   ├── migrations/            # 数据库迁移
│   └── seed.ts                # 演示数据
├── prisma.config.ts           # Prisma 配置（含 shadow DB）
├── src/
│   ├── app/
│   │   ├── api/               # REST API 路由（54 个端点）
│   │   │   ├── auth/          # 认证（register/login/me/logout）
│   │   │   ├── users/         # 用户（列表/me/[userId]）
│   │   │   ├── channels/      # 频道（列表/[id]/[id]/posts）
│   │   │   ├── posts/         # 帖子（CRUD/comments）
│   │   │   ├── comments/      # 评论（update/delete）
│   │   │   ├── works/         # 作品（CRUD）
│   │   │   ├── collaborations/ # 合作需求（CRUD）
│   │   │   ├── tools/         # 工具库（list/detail）
│   │   │   ├── likes/         # 点赞 toggle
│   │   │   ├── bookmarks/     # 收藏 toggle
│   │   │   ├── interactions/  # 互动状态查询
│   │   │   ├── conversations/ # 私信（会话/消息）
│   │   │   ├── admin/         # 管理后台（stats/users/posts/works/collabs/tools）
│   │   │   └── health/        # 健康检查
│   │   ├── page.tsx           # 首页
│   │   ├── auth/              # 登录 / 注册页面
│   │   ├── community/         # 频道列表 / 单频道
│   │   ├── showcase/          # 作品广场
│   │   ├── collaboration/     # 合作大厅
│   │   ├── tools/             # 工具库页面
│   │   ├── messages/          # 私信页面
│   │   ├── profile/           # 个人主页
│   │   └── admin/             # 管理后台页面
│   ├── components/            # React 组件
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   ├── layout/            # 导航栏
│   │   ├── feed/              # 帖子/评论/互动卡片
│   │   └── admin/             # 后台组件
│   ├── lib/                   # 业务逻辑
│   │   ├── db.ts              # PrismaClient 单例
│   │   ├── auth/              # session / guard / password
│   │   ├── pagination.ts      # 统一分页
│   │   ├── response.ts        # 统一响应
│   │   └── errors.ts          # 错误类
│   └── generated/prisma/      # Prisma Client（生成产物）
├── API.md                     # API 接口文档
└── .env.example               # 环境变量模板
```

## 一遍跑通 MVP（白盒检查）

阶段 15 交付校验，全部通过：

```bash
npm install                            # ✓ 装依赖
npx prisma dev start seedlandv         # ✓ 起本地 Postgres
npm run db:push                        # ✓ schema 同步
npm run seed                           # ✓ 8 用户 / 12 频道 / 20 帖 / 30 评论 / 10 作品 / 8 合作 / 15 工具
npm run seed                           # ✓ 再跑一次，验证 seed 可重复执行
npm run dev                            # ✓ 启动开发服务器
# API E2E 测试：40 个接口全部通过
# 注册 → 登录 → 发帖 → 评论 → 发作品 → 发合作 →
# 点赞 → 收藏 → 私信 → 管理后台 → 登出 全链路验证 ✓
```

## 常见错误处理

| 问题 | 原因 | 解决 |
|------|------|------|
| `P1001: Can't reach database` | 数据库未启动 | `npx prisma dev start seedlandv` |
| `P1017: Server has closed the connection` | Prisma migrate dev + Prisma Dev 兼容性 | 改用 `npx prisma db push` |
| `prepared statement already exists` | Prisma Dev 连接池复用 | 重启：`npx prisma dev stop seedlandv && npx prisma dev start seedlandv` |
| `P3005: Database schema is not empty` | migrate deploy 在已有表的 DB 上 | 用 `db push` 或 `migrate reset` |
| 401 Unauthorized | 未登录或 cookie 过期 | 重新调用 `/api/auth/login` |
| 403 Forbidden | 非作者或非 ADMIN | 检查用户角色和资源归属 |

## 部署建议

最简（推荐）：

- **应用**：Vercel — Next.js 16 一键部署；环境变量加 `DATABASE_URL` + `AUTH_SECRET`；构建命令默认 `next build`
- **数据库**：Neon / Supabase / Railway Postgres，启用 connection pooling；`DATABASE_URL` 走 pooler 端口
- **迁移**：CI 中部署前跑 `npx prisma migrate deploy`，**不要**用 `db push`

进阶：

- 自托管：Node 20 + 任意 PaaS（Render / Fly / Railway）+ Docker。`npm run build && npm run start`，端口 3000
- 长期：上传服务（作品视频、头像）建议接对象存储（火山 TOS / S3 / R2），现在 schema 里都是 URL 字段
- 长期：把会话从 JWT cookie 升级到带 revocation 的服务端 session（重要操作能立刻踢线）

## 后续版本路线图

| 版本 | 重点 |
|---|---|
| **v0.2** | 真实文件上传（视频 / 封面 / 头像走 TOS/S3 直传）；视频缩略图自动生成 |
| **v0.3** | 通知中心（点赞 / 评论 / 私信未读小红点 + push）；@提及 |
| **v0.4** | 搜索 + 推荐：Postgres 全文索引 → Meilisearch / Typesense；个性化首页 feed |
| **v0.5** | 接入 Seedance 2.0 在站内生成作品（沿用根目录 electron 时期的 Ark 通道） |
| **v0.6** | 群聊、公告、活动 |
| **v0.7** | 审核工作流：举报 → 队列 → 处置；MOD 操作日志 |
| **v1.0** | 移动端 PWA / 原生 App；SSO；可选 i18n |

## 许可

Proprietary — internal SeedLand · V project.
