import "dotenv/config";

import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  CollaborationCategory,
  CollaborationLocation,
  CollaborationStatus,
  CollaborationType,
  CollaborationWorkMode,
  PostType,
  PrismaClient,
  Role,
  ToolPricing,
  WorkCategory,
  WorkMode,
  WorkModel,
} from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to web/.env first.");
  process.exit(1);
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

// 与 src/lib/auth/password.ts 保持一致：bcrypt 加盐哈希
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

const USERS = [
  {
    username: "neon_director",
    email: "neo@seedland.dev",
    name: "霓虹导演",
    bio: "AI 短片爱好者 · Seedance 2.0 重度用户",
    role: Role.ADMIN,
  },
  {
    username: "pixel_poet",
    email: "pixel@seedland.dev",
    name: "像素诗人",
    bio: "写诗的人，让模型负责画面。",
    role: Role.MOD,
  },
  {
    username: "rui_film",
    email: "rui@seedland.dev",
    name: "锐 · Film",
    bio: "独立电影人，正在用 AI 拍我的第一部长片。",
    role: Role.USER,
  },
  {
    username: "studio_lumen",
    email: "lumen@seedland.dev",
    name: "Lumen Studio",
    bio: "广告创意 → AI 视频流水线。",
    role: Role.USER,
  },
  {
    username: "mei_anim",
    email: "mei@seedland.dev",
    name: "美图 · Anim",
    bio: "二次元 / Anime 风格专研。",
    role: Role.USER,
  },
  {
    username: "scifi_atelier",
    email: "scifi@seedland.dev",
    name: "Sci-Fi 工作室",
    bio: "硬科幻视觉，长期招合作。",
    role: Role.USER,
  },
  {
    username: "doc_voyager",
    email: "voyager@seedland.dev",
    name: "纪录漫游者",
    bio: "纪录片视角的 AI 重建。",
    role: Role.USER,
  },
  {
    username: "vfx_inkwell",
    email: "inkwell@seedland.dev",
    name: "墨井 VFX",
    bio: "水墨 · 抽象 · 实验影像。",
    role: Role.USER,
  },
] as const;

const CHANNELS = [
  { slug: "showcase", name: "作品秀场", description: "晒你的 AI 视频作品", icon: "🎬", color: "#22d3ee" },
  { slug: "prompts", name: "Prompt 工坊", description: "提示词分享 & 互评", icon: "✨", color: "#a78bfa" },
  { slug: "seedance", name: "Seedance 2.0", description: "官方模型讨论", icon: "🌱", color: "#34d399" },
  { slug: "first-last-frame", name: "首尾帧实验", description: "首/尾帧控制运镜", icon: "🎞️", color: "#fb923c" },
  { slug: "anime", name: "Anime 频道", description: "二次元风格美学", icon: "🌸", color: "#f472b6" },
  { slug: "sci-fi", name: "Sci-Fi 频道", description: "赛博 / 太空 / 未来", icon: "🛸", color: "#60a5fa" },
  { slug: "documentary", name: "纪录视角", description: "真实感与历史重建", icon: "📜", color: "#fbbf24" },
  { slug: "vfx-experiment", name: "VFX 实验室", description: "特效 · 合成 · 后期", icon: "🧪", color: "#10b981" },
  { slug: "music-video", name: "MV 创作", description: "音乐与画面的同步", icon: "🎵", color: "#f43f5e" },
  { slug: "ads-creative", name: "广告创意", description: "商业短片与广告流水线", icon: "📺", color: "#facc15" },
  { slug: "tooling", name: "工具与流水线", description: "提效脚本 / 自动化 / API", icon: "🛠️", color: "#94a3b8" },
  { slug: "newbie", name: "新手入门", description: "踩坑、提问、互助", icon: "🌱", color: "#86efac" },
] as const;

// category 取自 src/lib/tools/categories.ts 的 11 个 enum-like 字符串。
// 与该文件保持一致；新增分类时两边一起改。
const TOOLS = [
  // 文生视频
  { slug: "seedance-2-0", name: "Seedance 2.0", category: "TEXT_TO_VIDEO", url: "https://www.volcengine.com/product/seedance", pricing: ToolPricing.PAID, tags: ["文生视频", "火山方舟", "首尾帧"], official: true, desc: "火山方舟出品的高质量视频生成模型，支持文生/图生/首尾帧/多模态参考。", useCase: "中长片 / 广告 / 短剧首选，对运镜与一致性敏感的项目" },
  { slug: "seedance-fast", name: "Seedance Fast", category: "TEXT_TO_VIDEO", url: "https://www.volcengine.com/product/seedance", pricing: ToolPricing.PAID, tags: ["文生视频", "快速出片"], official: true, desc: "Seedance 系列轻量版，速度优先，单镜头几十秒出片。", useCase: "电商批量短视频、海量素材打样" },
  { slug: "veo3", name: "Veo 3", category: "TEXT_TO_VIDEO", url: "https://deepmind.google/technologies/veo/", pricing: ToolPricing.PAID, tags: ["文生视频", "Google"], official: false, desc: "Google DeepMind 的高保真视频模型，物理真实度行业领先。", useCase: "对物理一致性要求高的场景：流体、布料、动物" },
  { slug: "pika-2", name: "Pika 2.0", category: "TEXT_TO_VIDEO", url: "https://pika.art", pricing: ToolPricing.FREEMIUM, tags: ["文生视频"], official: false, desc: "Pika Labs 出品，风格化与快速迭代友好。", useCase: "二创、Meme 视频、社媒爆款" },

  // 图生视频
  { slug: "runway-gen3", name: "Runway Gen-3", category: "IMAGE_TO_VIDEO", url: "https://runwayml.com", pricing: ToolPricing.FREEMIUM, tags: ["图生视频", "电影感"], official: false, desc: "Runway 的旗舰生成模型，电影化运镜出彩。", useCase: "MV / 短片 / 角色一致性场景" },
  { slug: "kling", name: "Kling AI", category: "IMAGE_TO_VIDEO", url: "https://klingai.com", pricing: ToolPricing.FREEMIUM, tags: ["图生视频", "人像"], official: false, desc: "可灵 AI，人像与物理一致性表现不错。", useCase: "真实人像驱动、短剧主角镜头" },
  { slug: "luma-dream-machine", name: "Luma Dream Machine", category: "IMAGE_TO_VIDEO", url: "https://lumalabs.ai/dream-machine", pricing: ToolPricing.FREEMIUM, tags: ["图生视频"], official: false, desc: "Luma 旗下的视频生成模型，自然运镜流畅。", useCase: "自然风景、慢节奏镜头" },

  // 视频转视频
  { slug: "runway-act-one", name: "Runway Act-One", category: "VIDEO_TO_VIDEO", url: "https://runwayml.com", pricing: ToolPricing.PAID, tags: ["视频转视频", "动作迁移"], official: false, desc: "用一段表演视频驱动另一个角色的表情和动作。", useCase: "数字替身表演 / 角色驱动" },
  { slug: "topaz-video-ai", name: "Topaz Video AI", category: "VIDEO_TO_VIDEO", url: "https://www.topazlabs.com/topaz-video-ai", pricing: ToolPricing.PAID, tags: ["超分", "稳定"], official: false, desc: "AI 视频超分、补帧、稳定。", useCase: "老素材修复、4K 上抽" },

  // 数字人
  { slug: "heygen", name: "HeyGen", category: "DIGITAL_HUMAN", url: "https://heygen.com", pricing: ToolPricing.PAID, tags: ["数字人", "口型"], official: false, desc: "数字人形象 + 口型驱动，多语言支持。", useCase: "口播 / 培训 / 电商短视频" },
  { slug: "synthesia", name: "Synthesia", category: "DIGITAL_HUMAN", url: "https://www.synthesia.io", pricing: ToolPricing.PAID, tags: ["数字人", "企业级"], official: false, desc: "企业培训和营销视频的数字人平台。", useCase: "海外 B 端培训视频" },
  { slug: "seedland-digital-human", name: "数字人定制（私域）", category: "DIGITAL_HUMAN", url: "/tools/character", pricing: ToolPricing.PAID, tags: ["数字人", "私域"], official: true, desc: "上传素材生成专属数字人形象，邀测中。", useCase: "私域口播、品牌专属主播" },

  // 配音
  { slug: "elevenlabs", name: "ElevenLabs", category: "VOICE", url: "https://elevenlabs.io", pricing: ToolPricing.FREEMIUM, tags: ["TTS", "声音克隆"], official: false, desc: "高质量语音合成 + 多语言声音克隆。", useCase: "口播 / 角色配音 / 多语言版本" },
  { slug: "openai-tts", name: "OpenAI TTS", category: "VOICE", url: "https://platform.openai.com/docs/guides/text-to-speech", pricing: ToolPricing.PAID, tags: ["TTS"], official: false, desc: "OpenAI 出品的语音合成模型。", useCase: "海外内容、低成本量产" },

  // 字幕
  { slug: "captionai", name: "Caption.ai", category: "SUBTITLE", url: "https://www.captions.ai", pricing: ToolPricing.FREEMIUM, tags: ["字幕", "AI 剪辑"], official: false, desc: "自动识别字幕 + 自动剪辑组合工具。", useCase: "短视频字幕、爆款节奏" },
  { slug: "submagic", name: "Submagic", category: "SUBTITLE", url: "https://submagic.co", pricing: ToolPricing.FREEMIUM, tags: ["字幕", "短视频"], official: false, desc: "短视频专用字幕样式与动效。", useCase: "TikTok / Reels 字幕动效" },

  // 剪辑
  { slug: "capcut", name: "剪映专业版", category: "EDIT", url: "https://www.capcut.cn/", pricing: ToolPricing.FREEMIUM, tags: ["剪辑", "字节"], official: false, desc: "字节出品，时间线 + AI 配乐 + 自动字幕。", useCase: "短视频 / 一人剪辑流水线" },
  { slug: "davinci-resolve", name: "DaVinci Resolve", category: "EDIT", url: "https://www.blackmagicdesign.com/products/davinciresolve", pricing: ToolPricing.FREEMIUM, tags: ["剪辑", "调色"], official: false, desc: "免费版已足够大多数 AI 视频剪辑，调色行业标准。", useCase: "调色 / 长片剪辑 / 商业出片" },
  { slug: "premiere-pro", name: "Premiere Pro", category: "EDIT", url: "https://www.adobe.com/products/premiere.html", pricing: ToolPricing.PAID, tags: ["剪辑", "Adobe"], official: false, desc: "Adobe 经典剪辑软件，团队协作友好。", useCase: "团队协作剪辑 / 长片" },

  // 工作流
  { slug: "comfyui", name: "ComfyUI", category: "WORKFLOW", url: "https://www.comfy.org/", pricing: ToolPricing.FREE, tags: ["工作流", "开源", "节点图"], official: false, desc: "节点式 AI 工作流编辑器，社区生态丰富。", useCase: "自动化批量生产 / 图像/视频流水线" },
  { slug: "seedland-lora-train", name: "LoRA 训练（官方）", category: "WORKFLOW", url: "/tools/lora", pricing: ToolPricing.PAID, tags: ["LoRA", "微调"], official: true, desc: "上传素材，云端微调专属模型。", useCase: "品牌专属风格 / 角色微调" },

  // 图像生成
  { slug: "midjourney", name: "Midjourney v7", category: "IMAGE_GEN", url: "https://midjourney.com", pricing: ToolPricing.PAID, tags: ["图像", "艺术风格"], official: false, desc: "高质量风格化图像生成，常用于首尾帧素材。", useCase: "概念图 / 首尾帧 / 艺术风格图" },
  { slug: "flux", name: "FLUX.1 Pro", category: "IMAGE_GEN", url: "https://blackforestlabs.ai", pricing: ToolPricing.FREEMIUM, tags: ["图像", "开源"], official: false, desc: "Black Forest Labs 出品，高保真且可控性强。", useCase: "ControlNet / LoRA 高保真出图" },
  { slug: "stable-diffusion-xl", name: "Stable Diffusion XL", category: "IMAGE_GEN", url: "https://stability.ai", pricing: ToolPricing.FREE, tags: ["图像", "开源"], official: false, desc: "开源 SD 系列，可本地部署 + 自定义。", useCase: "本地化部署 / 自训练 / 二次开发" },

  // 3D 生成
  { slug: "tripo-3d", name: "Tripo 3D", category: "THREE_D", url: "https://www.tripo3d.ai", pricing: ToolPricing.FREEMIUM, tags: ["3D", "图生模型"], official: false, desc: "图片/文本 → 3D 模型，可衔接动画工作流。", useCase: "AI 视频中的 3D 资产、UE5/Blender 素材" },
  { slug: "meshy", name: "Meshy", category: "THREE_D", url: "https://www.meshy.ai", pricing: ToolPricing.FREEMIUM, tags: ["3D", "纹理"], official: false, desc: "3D 模型生成 + 纹理迭代，速度快。", useCase: "游戏 / 数字资产快速原型" },

  // 音乐音效
  { slug: "suno", name: "Suno v4", category: "MUSIC", url: "https://suno.com", pricing: ToolPricing.FREEMIUM, tags: ["音乐", "演唱"], official: false, desc: "AI 编曲 + 演唱，MV 配乐利器。", useCase: "MV / 短剧 OST / 抖音配乐" },
  { slug: "udio", name: "Udio", category: "MUSIC", url: "https://udio.com", pricing: ToolPricing.FREEMIUM, tags: ["音乐"], official: false, desc: "高质量 AI 音乐生成，结构感强。", useCase: "完整曲目结构 / Demo 创作" },
  { slug: "elevenlabs-sfx", name: "ElevenLabs SFX", category: "MUSIC", url: "https://elevenlabs.io/sound-effects", pricing: ToolPricing.FREEMIUM, tags: ["音效", "SFX"], official: false, desc: "文本生成音效，秒级出 SFX。", useCase: "短视频音效 / 游戏 SFX" },
] as const;

const POST_TEMPLATES: Array<{
  channel: string;
  title: string;
  content: string;
  type: PostType;
  videoUrl?: string;
  imageUrl?: string;
}> = [
  { channel: "showcase", title: "首部 AI 短片《潮汐都市》上线", content: "用 Seedance 2.0 跑了 24 个镜头，3 天内出片，欢迎来吐槽。", type: PostType.SHOWCASE, videoUrl: "https://seedland.dev/sample/tide-city.mp4", imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=tide-city" },
  { channel: "showcase", title: "霓虹雨夜街景测试", content: "1080p × 5s × 16:9，提示词放评论区。", type: PostType.SHOWCASE, videoUrl: "https://seedland.dev/sample/neon-rain.mp4" },
  { channel: "showcase", title: "Anime 风《樱花列车》",  content: "首尾帧控制 + Suno 配乐，长度 1:20。", type: PostType.SHOWCASE, videoUrl: "https://seedland.dev/sample/sakura.mp4" },
  { channel: "prompts", title: "我的万能起手 Prompt 模板", content: "结构：风格 / 场景 / 主体 / 镜头 / 灯光 / 色调，按这个顺序你试试。", type: PostType.TUTORIAL },
  { channel: "prompts", title: "如何用关键词控制摄影机推拉", content: "关键词清单 + 失败 case 对照。", type: PostType.TUTORIAL, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=camera-prompt" },
  { channel: "prompts", title: "中文 vs 英文提示词的实测差异", content: "同一场景两版输入跑 5 次取平均。", type: PostType.DISCUSSION },
  { channel: "seedance", title: "Seedance 2.0 vs Fast 出片对比", content: "成本、速度、细节三个维度的表格。", type: PostType.DISCUSSION, imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=seedance-cmp" },
  { channel: "seedance", title: "Ark API 限流避坑", content: "并发 > 4 会被节流，建议本地排队。", type: PostType.NEWS },
  { channel: "first-last-frame", title: "首尾帧一定要保持一致颜色吗", content: "实测：色温差 200K 内基本不抖。", type: PostType.QUESTION },
  { channel: "anime", title: "和风线条的 LoRA 推荐", content: "三个我用得最顺的 LoRA。", type: PostType.TOOL_RECOMMEND },
  { channel: "sci-fi", title: "赛博朋克城市镜头合集", content: "10 个镜头，分享给同好。", type: PostType.SHOWCASE, videoUrl: "https://seedland.dev/sample/cyberpunk.mp4" },
  { channel: "sci-fi", title: "太空舱内部的光照难点", content: "实测让模型理解 'rim light' 真的有用。", type: PostType.TUTORIAL },
  { channel: "documentary", title: "用 AI 重建 1980s 上海街景", content: "档案照 → 首帧 → 多镜头生成。", type: PostType.SHOWCASE, videoUrl: "https://seedland.dev/sample/shanghai-1980.mp4" },
  { channel: "vfx-experiment", title: "用首尾帧做粒子转场", content: "效果意外的好，附 prompt。", type: PostType.TUTORIAL, videoUrl: "https://seedland.dev/sample/particle.mp4" },
  { channel: "music-video", title: "Suno + Seedance 一条龙做 MV", content: "30 分钟出片的流水线分享。", type: PostType.TUTORIAL },
  { channel: "ads-creative", title: "电商 5 秒短视频流水线", content: "从产品图 → 图生 → 自动剪。", type: PostType.COLLABORATION },
  { channel: "tooling", title: "Ark API 批量提交脚本", content: "支持失败重试和指数退避，开源链接见正文。", type: PostType.TOOL_RECOMMEND },
  { channel: "tooling", title: "Prompt 模板管理小工具", content: "类似 snippets，按标签调用。", type: PostType.TOOL_RECOMMEND },
  { channel: "newbie", title: "新手必读：参数到底是啥意思", content: "分辨率 / 比例 / 时长 / 种子 一次讲清楚。", type: PostType.TUTORIAL },
  { channel: "newbie", title: "我跑出来的视频闪烁怎么办", content: "排查清单 + 5 个常见原因。", type: PostType.QUESTION },
];

const WORKS = [
  { title: "潮汐都市 · 开场", desc: "霓虹雨夜镜头，慢镜推进，作为我新片的开场。", prompt: "neon-soaked metropolis at dusk, cinematic dolly-in", category: WorkCategory.STORY, tools: ["Seedance 2.0", "DaVinci Resolve"], mode: WorkMode.TEXT_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "16:9", duration: 5 },
  { title: "樱花列车", desc: "动漫风，列车驶过樱花隧道，配 Suno 的纯音乐。", prompt: "anime style, shinkansen passing through sakura tunnel", category: WorkCategory.AI_ANIMATION, tools: ["Seedance 2.0", "Suno", "ComfyUI"], mode: WorkMode.FIRST_LAST_FRAME, model: WorkModel.SEEDANCE_2_0, resolution: "720p", ratio: "16:9", duration: 6 },
  { title: "潜入太空舱", desc: "赛博风 + 太空，单镜推进的实验镜头。", prompt: "interior of a cyberpunk space capsule, dramatic rim light", category: WorkCategory.EXPERIMENT, tools: ["Seedance Fast", "Flux"], mode: WorkMode.IMAGE_TO_VIDEO, model: WorkModel.SEEDANCE_FAST, resolution: "1080p", ratio: "21:9", duration: 5 },
  { title: "墨意 · 山雨", desc: "水墨实验风格，用首尾帧约束节奏。", prompt: "ink wash painting style, distant mountains in rain", category: WorkCategory.EXPERIMENT, tools: ["Seedance 2.0", "ComfyUI"], mode: WorkMode.TEXT_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "1:1", duration: 4 },
  { title: "广告 · 香水", desc: "5 秒电商广告样片，竖屏直接投流。", prompt: "perfume bottle on rotating pedestal, soft pink lighting", category: WorkCategory.ECOMMERCE_AD, tools: ["Seedance Fast", "Midjourney"], mode: WorkMode.IMAGE_TO_VIDEO, model: WorkModel.SEEDANCE_FAST, resolution: "1080p", ratio: "9:16", duration: 5 },
  { title: "纪录 · 老外滩", desc: "1980s 上海风格，从档案照到运动镜头。", prompt: "1980s Shanghai bund, archival film grain, pedestrians", category: WorkCategory.KNOWLEDGE, tools: ["Seedance 2.0", "After Effects"], mode: WorkMode.MULTI_REFERENCE, model: WorkModel.SEEDANCE_2_0, resolution: "720p", ratio: "4:3", duration: 6 },
  { title: "MV · 心跳", desc: "电子节奏的城市夜景，配 BPM 128 的电子曲。", prompt: "city skyline at night, neon pulsing to bpm 128", category: WorkCategory.STORY, tools: ["Seedance 2.0", "Suno", "DaVinci Resolve"], mode: WorkMode.TEXT_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "16:9", duration: 6 },
  { title: "粒子转场测试", desc: "VFX 实验，金 / 蓝粒子溶解转场。", prompt: "abstract particle dissolve transition, gold and teal", category: WorkCategory.EXPERIMENT, tools: ["Seedance Fast", "After Effects"], mode: WorkMode.FIRST_LAST_FRAME, model: WorkModel.SEEDANCE_FAST, resolution: "720p", ratio: "16:9", duration: 3 },
  { title: "森林晨雾", desc: "自然风光小品，作为产品广告底素材。", prompt: "morning fog rolling through pine forest, soft sunbeams", category: WorkCategory.PRODUCT_SHOW, tools: ["Seedance 2.0"], mode: WorkMode.TEXT_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "16:9", duration: 5 },
  { title: "未来发布会", desc: "科幻舞台，用于品牌发布概念片。", prompt: "futuristic keynote stage, holographic UI floating", category: WorkCategory.PRODUCT_SHOW, tools: ["Seedance Fast", "After Effects"], mode: WorkMode.IMAGE_TO_VIDEO, model: WorkModel.SEEDANCE_FAST, resolution: "1080p", ratio: "16:9", duration: 5 },
  { title: "AI 漫剧《雾港》第 1 话", desc: "竖屏漫剧节奏，分镜驱动叙事。", prompt: "vertical comic-style short drama, foggy harbor city", category: WorkCategory.AI_COMIC, tools: ["Seedance 2.0", "Midjourney", "ElevenLabs"], mode: WorkMode.IMAGE_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "9:16", duration: 60 },
  { title: "AI 短剧《地下车库》预告", desc: "30 秒预告，竖屏短剧，悬疑题材。", prompt: "vertical micro-drama trailer, underground parking, suspense", category: WorkCategory.AI_DRAMA, tools: ["Seedance 2.0", "Kling AI", "DaVinci Resolve"], mode: WorkMode.TEXT_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "9:16", duration: 30 },
  { title: "数字人 Lina · 产品口播", desc: "30 秒数字人讲解，可批量复用模板。", prompt: "digital human Lina speaking to camera, soft studio lighting", category: WorkCategory.DIGITAL_HUMAN, tools: ["Seedance 2.0", "ElevenLabs"], mode: WorkMode.IMAGE_TO_VIDEO, model: WorkModel.SEEDANCE_2_0, resolution: "1080p", ratio: "16:9", duration: 30 },
  { title: "三分钟讲清楚扩散模型", desc: "知识讲解，配图文 + 数字人讲述。", prompt: "explainer animation, diffusion model visualized step by step", category: WorkCategory.KNOWLEDGE, tools: ["Seedance Fast", "Midjourney", "ElevenLabs"], mode: WorkMode.TEXT_TO_VIDEO, model: WorkModel.SEEDANCE_FAST, resolution: "1080p", ratio: "16:9", duration: 180 },
] as const;

const COLLABS = [
  {
    title: "招一个会写 Prompt 的搭子，共做 1 分钟短片",
    desc: "我擅长后期合成，正在做一支 1 分钟的赛博风格短片，缺一个能稳出 prompt 的小伙伴。交付物：30 段 5 秒镜头 + prompt 文档。可以分成。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.PROMPT_ENGINEER,
    workMode: CollaborationWorkMode.PROJECT,
    location: CollaborationLocation.REMOTE,
    budget: "成片后分成 30%",
    contact: "微信: prompt_partner_01",
    tags: ["短片", "Prompt", "Seedance 2.0"],
  },
  {
    title: "AI 短剧《潮汐》第二季招团队，预计 12 集",
    desc: "竖屏微短剧，悬疑题材，已有完整剧本和分镜，需要：AI 视觉师 × 2、剪辑 × 1、配音 × 1。3 个月交付，按集结算。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.AI_DRAMA_TEAM,
    workMode: CollaborationWorkMode.PROJECT,
    location: CollaborationLocation.HYBRID,
    budget: "¥18-30k / 集",
    contact: "邮箱: hello@yehang.studio",
    tags: ["短剧", "竖屏", "Seedance 2.0", "长期"],
  },
  {
    title: "找 AI 漫剧创作者，长期合作做平台原创",
    desc: "我们是一家漫剧厂牌，急需擅长分镜叙事、能稳定输出每周 1-2 话节奏的创作者。提供 IP 和编剧支持，作者负责画面落地。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.AI_COMIC_CREATOR,
    workMode: CollaborationWorkMode.PART_TIME,
    location: CollaborationLocation.REMOTE,
    budget: "¥3-8k / 话 + 流量分成",
    contact: "微信: comic_studio_x",
    tags: ["漫剧", "分镜", "长期"],
  },
  {
    title: "电商品牌找数字人主播，30 秒口播模板",
    desc: "电商客户需要 1 个数字人形象 + 30 秒口播模板，可批量复用换文案。要求形象自然、表情流畅。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.DIGITAL_HUMAN,
    workMode: CollaborationWorkMode.ONE_OFF,
    location: CollaborationLocation.REMOTE,
    budget: "¥8000-15000",
    contact: "联系: zhang@ecombrand.com",
    tags: ["数字人", "电商", "口播"],
  },
  {
    title: "纪录片项目找剪辑师，60 分钟成片",
    desc: "AI 重建 1980s 上海街景，已完成 80% 镜头生成。需要资深剪辑师做整体节奏 + 字幕 + 调色。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.EDITOR,
    workMode: CollaborationWorkMode.PROJECT,
    location: CollaborationLocation.REMOTE,
    budget: "¥25000 项目费",
    contact: "微信: doc_voyager_v",
    tags: ["纪录片", "剪辑", "调色"],
  },
  {
    title: "需要 ComfyUI 工程师搭建产品图 → 视频流水线",
    desc: "电商团队，每天有 50+ 产品图需要自动转 5 秒短视频。希望搭建 ComfyUI 工作流：产品图 → 抠图 → 首尾帧 → Seedance Fast。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.COMFYUI_WORKFLOW,
    workMode: CollaborationWorkMode.FREELANCE,
    location: CollaborationLocation.REMOTE,
    budget: "¥20000 一次性 + 后续维护",
    contact: "邮箱: ops@brand-lab.cn",
    tags: ["ComfyUI", "电商", "自动化"],
  },
  {
    title: "AI 视频厂牌招联合创始人，技术 / 内容方向",
    desc: "团队 3 人，已有种子轮意向。寻找一位深度玩过 AI 视频工作流（Seedance / Runway / ComfyUI）的联合创始人，技术或内容方向均可。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.COFOUNDER,
    workMode: CollaborationWorkMode.EQUITY,
    location: CollaborationLocation.HYBRID,
    budget: "股权 + 基本工资",
    contact: "微信: cofounder_seek_2026",
    tags: ["联合创始人", "股权", "厂牌"],
  },
  {
    title: "AI 短剧厂牌寻投资 / 渠道合作",
    desc: "团队已交付 24 集竖屏短剧，月产能 8 集，找投资方或渠道方一起做内容矩阵。可分发抖音 / 快手 / 海外。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.INVEST_BIZ,
    workMode: CollaborationWorkMode.PROJECT,
    location: CollaborationLocation.HYBRID,
    budget: "面议",
    contact: "BD: bd@drama-brand.cn",
    tags: ["投资", "短剧", "分发"],
  },
  {
    title: "MV 项目招 AI 视频制作团队",
    desc: "独立乐队，单曲 3 分 20 秒，希望做一支 AI 风格 MV。已有 demo 和参考片，可面议风格细节。",
    type: CollaborationType.LOOKING_FOR,
    category: CollaborationCategory.AI_VIDEO_TEAM,
    workMode: CollaborationWorkMode.ONE_OFF,
    location: CollaborationLocation.REMOTE,
    budget: "¥12000-18000",
    contact: "微信: lighthouse_band",
    tags: ["MV", "音乐", "AI 视频"],
  },
  {
    title: "提供 Seedance 2.0 + ComfyUI 工作流服务",
    desc: "5 年视频经验，独立完成过 6 支商业短片，可承接 1-2 周交付的 MV / 广告 / 创意短片。",
    type: CollaborationType.OFFERING,
    category: CollaborationCategory.AI_VIDEO_TEAM,
    workMode: CollaborationWorkMode.FREELANCE,
    location: CollaborationLocation.REMOTE,
    budget: "¥10000 / 分钟起",
    contact: "微信: mv_freelancer",
    tags: ["MV", "广告", "Seedance"],
  },
] as const;

async function main() {
  console.log("→ 清空数据…");
  await prisma.$transaction([
    prisma.bookmark.deleteMany(),
    prisma.like.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.work.deleteMany(),
    prisma.collaboration.deleteMany(),
    prisma.post.deleteMany(),
    prisma.channelMember.deleteMany(),
    prisma.channel.deleteMany(),
    prisma.tool.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("→ 写入 users（密码统一为 seedland-dev-2026）…");
  const sharedHash = await hashPassword("seedland-dev-2026");
  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          name: u.name,
          bio: u.bio,
          role: u.role,
          avatar: `https://api.dicebear.com/9.x/glass/svg?seed=${u.username}`,
          passwordHash: sharedHash,
        },
      })
    )
  );
  console.log(`   ✓ ${users.length} users (login with password: seedland-dev-2026)`);

  console.log("→ 写入 channels…");
  const channels = await Promise.all(
    CHANNELS.map((c, i) =>
      prisma.channel.create({
        data: {
          slug: c.slug,
          name: c.name,
          description: c.description,
          icon: c.icon,
          color: c.color,
          ownerId: users[i % users.length].id,
        },
      })
    )
  );
  console.log(`   ✓ ${channels.length} channels`);

  console.log("→ 写入 channel memberships（每人加入 5 个频道）…");
  let memberships = 0;
  for (const user of users) {
    const shuffled = [...channels].sort(() => Math.random() - 0.5).slice(0, 5);
    for (const ch of shuffled) {
      await prisma.channelMember.upsert({
        where: { channelId_userId: { channelId: ch.id, userId: user.id } },
        update: {},
        create: { channelId: ch.id, userId: user.id },
      });
      memberships++;
    }
  }
  console.log(`   ✓ ${memberships} memberships`);

  console.log("→ 写入 tools…");
  const tools = await Promise.all(
    TOOLS.map((t, i) =>
      prisma.tool.create({
        data: {
          slug: t.slug,
          name: t.name,
          description: t.desc,
          url: t.url,
          category: t.category,
          useCase: t.useCase,
          pricing: t.pricing,
          tags: [...t.tags],
          isOfficial: t.official,
          createdById: users[i % users.length].id,
          logoUrl: `https://api.dicebear.com/9.x/icons/svg?seed=${t.slug}`,
        },
      })
    )
  );
  console.log(`   ✓ ${tools.length} tools`);

  console.log("→ 写入 posts…");
  const channelBySlug = new Map(channels.map((c) => [c.slug, c]));
  const posts = await Promise.all(
    POST_TEMPLATES.map((p, i) => {
      const channel = channelBySlug.get(p.channel);
      if (!channel) throw new Error(`channel not found: ${p.channel}`);
      return prisma.post.create({
        data: {
          channelId: channel.id,
          authorId: users[i % users.length].id,
          title: p.title,
          content: p.content,
          type: p.type,
          videoUrl: p.videoUrl ?? null,
          imageUrl: p.imageUrl ?? null,
          views: 50 + Math.floor(Math.random() * 1000),
          pinned: i === 0,
        },
      });
    })
  );
  console.log(`   ✓ ${posts.length} posts`);

  console.log("→ 写入 comments（每帖 1-3 条）…");
  let totalComments = 0;
  for (const post of posts) {
    const n = 1 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) {
      const author = users[(post.authorId.charCodeAt(0) + k) % users.length];
      if (author.id === post.authorId) continue;
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: author.id,
          content: ["+1，能开源吗", "细节很顶", "求 prompt", "学习了", "顶一下", "想看更多镜头"][k % 6],
        },
      });
      totalComments++;
    }
    await prisma.post.update({
      where: { id: post.id },
      data: { commentCount: n },
    });
  }
  console.log(`   ✓ ${totalComments} comments`);

  console.log("→ 写入 works…");
  const works = await Promise.all(
    WORKS.map((w, i) =>
      prisma.work.create({
        data: {
          authorId: users[i % users.length].id,
          title: w.title,
          description: w.desc,
          videoUrl: `https://seedland.dev/sample/${i + 1}.mp4`,
          thumbnailUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=work-${i}`,
          prompt: w.prompt,
          category: w.category,
          tools: [...w.tools],
          mode: w.mode,
          model: w.model,
          resolution: w.resolution,
          ratio: w.ratio,
          durationSec: w.duration,
          views: 100 + Math.floor(Math.random() * 2000),
          likeCount: 20 + Math.floor(Math.random() * 500),
          bookmarkCount: 5 + Math.floor(Math.random() * 80),
        },
      })
    )
  );
  console.log(`   ✓ ${works.length} works`);

  console.log("→ 写入 collaborations…");
  const collabs = await Promise.all(
    COLLABS.map((c, i) => {
      // 给最后两条留出 IN_PROGRESS / CLOSED 状态，其余全部 OPEN
      const status =
        i === COLLABS.length - 1
          ? CollaborationStatus.CLOSED
          : i === COLLABS.length - 2
            ? CollaborationStatus.IN_PROGRESS
            : CollaborationStatus.OPEN;
      return prisma.collaboration.create({
        data: {
          authorId: users[i % users.length].id,
          title: c.title,
          description: c.desc,
          type: c.type,
          category: c.category,
          workMode: c.workMode,
          location: c.location,
          status,
          budget: c.budget,
          contact: c.contact,
          tags: [...c.tags],
        },
      });
    })
  );
  console.log(`   ✓ ${collabs.length} collaborations`);

  console.log("→ 写入 likes + bookmarks…");
  let likes = 0;
  let bookmarks = 0;
  for (const user of users) {
    // 给随机 5 个帖子点赞
    const targets = [...posts].sort(() => Math.random() - 0.5).slice(0, 5);
    for (const p of targets) {
      if (p.authorId === user.id) continue;
      await prisma.like.upsert({
        where: { userId_postId: { userId: user.id, postId: p.id } },
        update: {},
        create: { userId: user.id, postId: p.id },
      });
      likes++;
    }
    // 收藏 2 个作品
    const wTargets = [...works].sort(() => Math.random() - 0.5).slice(0, 2);
    for (const w of wTargets) {
      if (w.authorId === user.id) continue;
      await prisma.bookmark.upsert({
        where: { userId_workId: { userId: user.id, workId: w.id } },
        update: {},
        create: { userId: user.id, workId: w.id },
      });
      bookmarks++;
    }
  }
  console.log(`   ✓ ${likes} likes, ${bookmarks} bookmarks`);

  console.log("→ 写入 conversations + messages…");
  const [u1, u2, u3] = users;
  const conv = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: u1.id }, { userId: u2.id }],
      },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conv.id, senderId: u1.id, content: "你那条 Anime 风格的视频用了哪个 LoRA？" },
      { conversationId: conv.id, senderId: u2.id, content: "晚点发你。你那个 prompt 模板还在用吗？" },
      { conversationId: conv.id, senderId: u1.id, content: "在的，我整理一份你看看。" },
    ],
  });
  const conv2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: u1.id }, { userId: u3.id }],
      },
    },
  });
  await prisma.message.create({
    data: { conversationId: conv2.id, senderId: u3.id, content: "MV 项目的合作我感兴趣，方便聊聊吗" },
  });
  console.log("   ✓ 2 conversations, 4 messages");

  // 汇总
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.channel.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.work.count(),
    prisma.collaboration.count(),
    prisma.tool.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.like.count(),
    prisma.bookmark.count(),
  ]);
  console.log("\n┌─────────────────┬────────┐");
  console.log("│ table           │ rows   │");
  console.log("├─────────────────┼────────┤");
  const labels = [
    "users",
    "channels",
    "posts",
    "comments",
    "works",
    "collaborations",
    "tools",
    "conversations",
    "messages",
    "likes",
    "bookmarks",
  ];
  labels.forEach((label, i) => {
    console.log(`│ ${label.padEnd(15)} │ ${String(counts[i]).padStart(6)} │`);
  });
  console.log("└─────────────────┴────────┘");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
