# SeedLand · V — API 文档

> Base URL: `http://localhost:3000/api`

所有响应格式统一：

```jsonc
// 成功
{ "success": true, "data": { ... }, "message": "..." }

// 分页
{ "success": true, "data": { "items": [...], "total": 50, "page": 1, "pageSize": 10, "pages": 5 } }

// 错误
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { ... } } }
```

---

## 目录

- [认证](#认证)
- [用户](#用户)
- [频道](#频道)
- [帖子](#帖子)
- [评论](#评论)
- [作品](#作品)
- [合作需求](#合作需求)
- [工具库](#工具库)
- [互动（点赞 / 收藏）](#互动)
- [私信](#私信)
- [管理后台](#管理后台)
- [健康检查](#健康检查)

---

## 认证

认证基于 JWT cookie（`seedland_session`），httpOnly，7 天有效。
登录/注册成功后 cookie 自动写入，后续请求浏览器自动携带。

### POST /api/auth/register

注册新用户。

```jsonc
// Request
{
  "email": "user@example.com",     // 必填，有效邮箱
  "username": "myname",            // 必填，唯一
  "name": "显示名",                // 必填
  "password": "SecurePass123!"     // 必填，≥8 字符
}

// Response 201
{
  "success": true,
  "data": { "id": "...", "email": "...", "username": "...", "name": "...", "role": "USER" }
}
// Set-Cookie: seedland_session=<jwt>; Path=/; HttpOnly; SameSite=Lax
```

### POST /api/auth/login

```jsonc
// Request
{ "email": "admin@aivideohub.com", "password": "seedland-dev-2026" }

// Response 200
{ "success": true, "data": { "id": "...", "email": "...", "username": "...", "name": "...", "role": "ADMIN" } }
```

### GET /api/auth/me

获取当前登录用户信息。需认证。

```jsonc
// Response 200
{ "success": true, "data": { "id": "...", "email": "...", "username": "...", "name": "...", "role": "ADMIN" } }
```

### POST /api/auth/logout

清除 session cookie。

```jsonc
// Response 200
{ "success": true, "message": "已退出登录" }
```

---

## 用户

### GET /api/users

公开用户列表（分页）。

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码，默认 1 |
| pageSize | number | 每页数量，默认 10 |
| search | string | 按 name / username / bio 搜索 |

```jsonc
// Response 200
{
  "success": true,
  "data": {
    "items": [
      { "id": "...", "username": "...", "name": "...", "avatar": "...", "bio": "...",
        "industryRole": "...", "expertise": [...], "favoriteTools": [...], "createdAt": "..." }
    ],
    "total": 8, "page": 1, "pageSize": 10, "pages": 1
  }
}
```

### GET /api/users/me

获取当前用户详细资料（含统计）。需认证。

```jsonc
// Response 200
{
  "success": true,
  "data": {
    "id": "...", "email": "...", "username": "...", "name": "...", "avatar": "...",
    "bio": "...", "role": "ADMIN", "industryRole": "...",
    "expertise": [...], "favoriteTools": [...], "portfolioLinks": [...], "contact": "...",
    "createdAt": "...",
    "_count": { "posts": 5, "works": 2, "collaborations": 1 }
  }
}
```

### PATCH /api/users/me

更新当前用户资料。需认证。

```jsonc
// Request（所有字段可选）
{
  "name": "新名字",
  "avatar": "https://...",
  "bio": "新简介",
  "industryRole": "AI 视频创作者",
  "expertise": ["文生视频", "图生视频"],
  "favoriteTools": ["Seedance 2.0", "Runway"],
  "portfolioLinks": ["https://..."],
  "contact": "微信: xxx"
}

// Response 200
{ "success": true, "data": { ... }, "message": "个人资料已更新" }
```

### GET /api/users/:userId

获取指定用户公开资料。

```jsonc
// Response 200
{ "success": true, "data": { "id": "...", "username": "...", "name": "...", ... , "_count": { ... } } }
```

---

## 频道

### GET /api/channels

获取所有频道列表。

```jsonc
// Response 200
{
  "success": true,
  "data": [
    { "id": "...", "slug": "general", "name": "综合交流", "description": "...",
      "icon": "💬", "color": "#3b82f6", "ownerId": "...",
      "_count": { "posts": 5, "members": 8 } }
  ]
}
```

### GET /api/channels/:channelId

获取频道详情。

### GET /api/channels/:channelId/posts

获取频道内帖子列表（分页）。

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |

---

## 帖子

### GET /api/posts

帖子列表（分页、可筛选）。

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量，默认 10 |
| channelId | string | 按频道筛选 |
| type | PostType | 帖子类型筛选 |
| search | string | 按标题/内容搜索 |

**PostType 枚举值：**
`DISCUSSION` `SHOWCASE` `COLLABORATION` `TOOL_RECOMMEND` `TUTORIAL` `QUESTION` `NEWS`

### POST /api/posts

发帖。需认证。

```jsonc
// Request
{
  "channelId": "cuid...",               // 必填
  "title": "帖子标题",                  // 必填，2-200 字符
  "content": "帖子内容",                // 必填
  "type": "DISCUSSION",                 // 可选，默认 DISCUSSION
  "videoUrl": "https://...",            // 可选
  "imageUrl": "https://..."             // 可选
}

// Response 201
{ "success": true, "data": { "id": "...", "title": "...", ... }, "message": "发帖成功" }
```

### GET /api/posts/:postId

帖子详情。

### PATCH /api/posts/:postId

更新帖子。需认证，仅作者或 ADMIN。

### DELETE /api/posts/:postId

删除帖子。需认证，仅作者或 ADMIN。

### GET /api/posts/:postId/comments

帖子评论列表（分页）。

### POST /api/posts/:postId/comments

发表评论。需认证。

```jsonc
// Request
{
  "content": "评论内容",       // 必填
  "parentId": "cuid..."       // 可选，回复某条评论
}

// Response 201
{ "success": true, "data": { "id": "...", "content": "...", ... } }
```

---

## 评论

### PATCH /api/comments/:commentId

更新评论。需认证，仅作者。

### DELETE /api/comments/:commentId

删除评论。需认证，仅作者或 ADMIN。

---

## 作品

### GET /api/works

作品列表（分页、可筛选）。

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| category | WorkCategory | 作品类型 |
| tool | string | 按使用工具筛选 |
| authorId | string | 按作者筛选 |
| search | string | 按标题搜索 |

**WorkCategory 枚举值：**
`AI_COMIC` `AI_DRAMA` `AI_ANIMATION` `DIGITAL_HUMAN` `ECOMMERCE_AD` `PRODUCT_SHOW` `KNOWLEDGE` `STORY` `EXPERIMENT`

### POST /api/works

发布作品。需认证。

```jsonc
// Request
{
  "title": "作品标题",                   // 必填，2-120 字符
  "description": "作品描述",             // 可选
  "videoUrl": "https://...",            // 必填，有效 URL
  "thumbnailUrl": "https://...",        // 可选
  "category": "STORY",                  // 必填，WorkCategory 枚举
  "tools": "Seedance,Midjourney"        // 可选，逗号分隔字符串
}

// Response 201
{ "success": true, "data": { "id": "...", "title": "...", ... } }
```

### GET /api/works/:workId

作品详情。

### PATCH /api/works/:workId

更新作品。需认证，仅作者或 ADMIN。

### DELETE /api/works/:workId

删除作品。需认证，仅作者或 ADMIN。

---

## 合作需求

### GET /api/collaborations

合作需求列表（分页、可筛选）。

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| status | CollaborationStatus | OPEN / IN_PROGRESS / CLOSED |
| category | CollaborationCategory | 分类筛选 |
| type / cooperationType | CollaborationType | LOOKING_FOR / OFFERING |
| search | string | 按标题/描述搜索 |

**CollaborationCategory 枚举值：**
`AI_VIDEO_TEAM` `AI_COMIC_CREATOR` `AI_DRAMA_TEAM` `DIGITAL_HUMAN` `PROMPT_ENGINEER` `COMFYUI_WORKFLOW` `EDITOR` `COFOUNDER` `INVEST_BIZ` `OTHER`

**CollaborationWorkMode 枚举值：**
`PROJECT` `FULL_TIME` `PART_TIME` `FREELANCE` `EQUITY` `ONE_OFF`

**CollaborationLocation 枚举值：**
`REMOTE` `ONSITE` `HYBRID`

### POST /api/collaborations

发布合作需求。需认证。

```jsonc
// Request
{
  "title": "标题",                       // 必填，4-80 字符
  "description": "详细描述...",           // 必填，≥20 字符
  "category": "OTHER",                   // 必填
  "type": "LOOKING_FOR",                 // 可选，默认 LOOKING_FOR
  "workMode": "PROJECT",                 // 必填
  "location": "REMOTE",                  // 必填
  "budget": "¥10000",                    // 可选
  "contact": "微信: xxx",                // 必填，2-120 字符
  "tags": "短片,Seedance,合作"            // 可选，逗号分隔，最多 8 个
}

// Response 201
{ "success": true, "data": { "id": "...", ... }, "message": "合作需求发布成功" }
```

### GET /api/collaborations/:collaborationId

合作需求详情。

### PATCH /api/collaborations/:collaborationId

更新合作需求。需认证，仅作者或 ADMIN。

### DELETE /api/collaborations/:collaborationId

删除合作需求。需认证，仅作者或 ADMIN。

---

## 工具库

### GET /api/tools

工具列表（分页、可筛选）。

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| category | string | 分类筛选 |
| search | string | 按名称/描述搜索 |

### GET /api/tools/:toolId

工具详情。

---

## 互动

### POST /api/likes/toggle

切换点赞状态。需认证。

```jsonc
// Request
{ "targetType": "POST",  "targetId": "cuid..." }   // targetType: POST | WORK | COMMENT

// Response 200
{ "success": true, "data": { "liked": true } }
```

### POST /api/bookmarks/toggle

切换收藏状态。需认证。

```jsonc
// Request
{ "targetType": "POST", "targetId": "cuid..." }     // targetType: POST | WORK

// Response 200
{ "success": true, "data": { "bookmarked": true } }
```

### GET /api/interactions/status

查询当前用户对某个目标的点赞/收藏状态。需认证。

| 参数 | 类型 | 说明 |
|------|------|------|
| targetType | string | POST / WORK |
| targetId | string | 目标 ID |

```jsonc
// Response 200
{ "success": true, "data": { "liked": true, "bookmarked": false } }
```

---

## 私信

### GET /api/conversations

会话列表（分页）。需认证。

### POST /api/conversations

发起会话（如已存在则返回现有）。需认证。

```jsonc
// Request
{ "targetUserId": "cuid..." }

// Response 201 (新建) / 200 (已存在)
{ "success": true, "data": { "id": "...", "participants": [...], "lastMessageAt": "..." } }
```

### GET /api/conversations/:conversationId

会话详情。需认证，仅参与者。

### PATCH /api/conversations/:conversationId

标记已读。需认证，仅参与者。

### GET /api/conversations/:conversationId/messages

消息列表（分页，按时间正序）。需认证，仅参与者。

### POST /api/conversations/:conversationId/messages

发送消息。需认证，仅参与者。

```jsonc
// Request
{ "content": "消息内容" }

// Response 201
{ "success": true, "data": { "id": "...", "content": "...", "senderId": "...", "createdAt": "..." } }
```

---

## 管理后台

所有管理接口需要 `ADMIN` 角色，否则返回 `403 FORBIDDEN`。

### GET /api/admin/stats

仪表盘统计。

```jsonc
// Response 200
{
  "success": true,
  "data": {
    "users": 8, "posts": 20, "works": 10,
    "collaborations": 8, "tools": 15, "conversations": 3
  }
}
```

### GET /api/admin/users

用户管理列表（分页、可按 role 和 search 筛选）。

### GET /api/admin/posts

帖子管理列表（分页）。

### PATCH /api/admin/posts/:postId

锁定/解锁帖子。

```jsonc
{ "locked": true }
```

### DELETE /api/admin/posts/:postId

管理员删除帖子。

### GET /api/admin/works

作品管理列表（分页）。

### PATCH /api/admin/works/:workId

隐藏/显示作品。

```jsonc
{ "isPublic": false }
```

### DELETE /api/admin/works/:workId

管理员删除作品。

### GET /api/admin/collaborations

合作需求管理列表。

### PATCH /api/admin/collaborations/:collaborationId

管理员更新合作需求。

### DELETE /api/admin/collaborations/:collaborationId

管理员删除合作需求。

### PATCH /api/admin/collaborations/:collaborationId/status

更新合作需求状态。

```jsonc
{ "id": "...", "status": "CLOSED" }
```

### GET /api/admin/tools

工具管理列表。

### POST /api/admin/tools

管理员创建工具。

### PATCH /api/admin/tools/:toolId

管理员更新工具。

### DELETE /api/admin/tools/:toolId

管理员删除工具。

---

## 健康检查

### GET /api/health

```jsonc
// Response 200
{ "success": true, "data": { "db": "ok" }, "message": "API is running" }
```

---

## 错误码

| HTTP 状态码 | 错误码 | 说明 |
|------------|--------|------|
| 400 | VALIDATION_ERROR | 请求参数校验失败 |
| 401 | UNAUTHORIZED | 未登录或 token 过期 |
| 403 | FORBIDDEN | 无权操作（非作者 / 非管理员） |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 冲突（如邮箱已注册） |
| 500 | INTERNAL_ERROR | 服务端错误 |

---

## 分页约定

所有列表接口支持分页：

| 参数 | 默认 | 说明 |
|------|------|------|
| page | 1 | 页码（从 1 开始） |
| pageSize | 10 | 每页条数（最大 100） |

响应格式：

```jsonc
{
  "items": [...],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "pages": 5
}
```
