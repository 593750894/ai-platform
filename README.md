# SeedLand · V

Seedance 2.0 AI 视频桌面应用（Electron + React + Vite + TypeScript）

**走火山方舟 Ark 通道，覆盖 Seedance 2.0 / Seedance Fast 两款模型、4 个功能模式**。

## 服务矩阵

| 分类 | 服务 | 通道 | 支持模式 |
|---|---|---|---|
| 视频生成 | Seedance 2.0 | Ark | 文生/图生/首尾帧/多模态参考 |
| 视频生成 | Seedance Fast | Ark | 文生/图生/首尾帧/多模态参考 |

## 功能模式

| 模式 | 输入 | 输出 |
|---|---|---|
| 文生视频 | 提示词 | 视频 |
| 图生视频 | 提示词 + 1 张参考图 | 视频 |
| 首尾帧 | 提示词 + 首帧图 + 尾帧图 | 视频 |
| 多模态参考 | 提示词 + 多图/视频/音频 | 视频 |

## 快速开始

```bash
# 1. 装 Node.js 20+
node --version

# 2. 安装依赖
npm install

# 3. 配 Key
cp .env.example .env
```

编辑 `.env`：

```env
# Seedance 通道
VOLC_ARK_API_KEY=ark_xxxxxxxxxxxxx
```

```bash
# 4. 验证接口（先跑一次单任务到完成）
npm run smoke            # Seedance 2.0 (Ark)

# 5. 开发模式
npm run dev

# 6. 打包 exe
npm run build            # 产物: dist/SeedLandV-0.1.0-Setup.exe
```

## 架构

```
┌─────────────────────────────────────────────┐
│           Renderer (React / Zustand)        │
└──────────────────┬──────────────────────────┘
                   │  IPC: submitTask(input)
┌──────────────────▼──────────────────────────┐
│         Main Process                        │
│         electron/ark/                       │
│         - Bearer token                      │
│         - /v1/contents/...                  │
│         - doubao-seedance-2-0-*             │
└─────────────────────────────────────────────┘
```

Key 只在主进程；渲染进程通过白名单 IPC 访问，拿不到凭据。

## 目录

```
electron/
  main.ts              # IPC + 任务路由
  preload.ts           # contextBridge
  ark/                 # Seedance 2.0 通道
    client.ts          # Bearer 认证
    tasks.ts           # content[] 构造 + 4 模式校验
    poller.ts  encode.ts
  shared/types.ts      # ModelId / GenerationMode / MODELS metadata

src/
  modes/               # 4 个模式页面
    TextToVideo / ImageToVideo / FirstLastFrame / MultiReference
  components/
    layout/            # Sidebar / Topbar
    asset/             # 本地 + URL 双入口
    params/            # 分辨率/比例/时长/高级
    tasks/             # 队列 + 卡片 + 预览
```

## 参考

- 火山方舟 Seedance 2.0: https://www.volcengine.com/docs/82379/2291680
