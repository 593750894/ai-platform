# SeedLandV Server

FastAPI + Celery + Postgres + 火山 TOS 后端，承接 Electron / Web 客户端的视频生成订单。

## 开发环境启动

```bash
# 1. 启基础设施（Postgres + Redis）
cd ..              # repo root
docker compose -f docker-compose.dev.yml up -d

# 2. 装 Python 依赖（推荐 Python 3.11 / 3.12，3.14 部分 C 扩展可能缺 wheel）
cd server
python -m venv .venv
source .venv/Scripts/activate    # Windows Git Bash
pip install -e ".[dev]"

# 3. 复制环境变量并填 TOS 凭据
cp ../.env.example ../.env
# 编辑 ../.env，至少填 VOLC_TOS_AK/SK/BUCKET、JWT_SECRET、ARK_KEY_FERNET_SECRET

# 4. Phase 0 验证：所有基础设施可达
python scripts/verify_phase0.py
# 期待输出：
# [OK  ] Postgres: PostgreSQL 16.x ...
# [OK  ] Redis: PONG
# [OK  ] 火山 TOS: bucket=seedlandv-dev reachable
```

## 阶段进度

- ✅ Phase 0：仓库结构 + docker-compose + env 样板 + 基础设施验证脚本
- ⏳ Phase 1：FastAPI 骨架 + Postgres schema + JWT 认证
- ⏳ Phase 2：Ark Python 端口 + Celery worker
- ⏳ Phase 3：WebSocket 推送 + Electron 瘦身
- ⏳ Phase 4：资产上传 → TOS
- ⏳ Phase 5：产物 TOS 镜像 + 签名 URL 续签

详见 `C:\Users\Administrator\.claude\plans\plan-drifting-sonnet.md`。

## 前置准备（首次必做）

1. **安装 Docker Desktop**（Windows）：https://www.docker.com/products/docker-desktop
2. **开 TOS 测试桶**：火山控制台 → 对象存储 TOS → 创建 bucket（建议名 `seedlandv-dev`，区域 cn-beijing）
3. **创建 TOS 子账号**：访问控制 → 用户 → 新建子用户 → 授权 `TOSFullAccess` 限定到该 bucket → 拿到 AK/SK
4. **生成 Fernet 密钥**：
   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```
   填入 `.env` 的 `ARK_KEY_FERNET_SECRET`
5. **生成 JWT secret**：
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   填入 `.env` 的 `JWT_SECRET`
