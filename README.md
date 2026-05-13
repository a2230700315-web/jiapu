# 数字家谱 — 部署到 Cloudflare Pages

## 快速开始（本地开发）

```bash
cd jiapusite
npm install
npm run dev
# 访问 http://localhost:5173
```

## 部署到 Cloudflare Pages

### 方法一：GitHub + 自动部署（推荐）

1. 将 `jiapusite` 文件夹推送到 GitHub 仓库
2. 登录 Cloudflare Dashboard
3. 进入 **Pages → Create a project → Connect to Git**
4. 选择你的仓库，配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 **Save and Deploy**

### 方法二：直接上传 dist

```bash
npm run build
npx wrangler pages deploy dist --project-name jiapu
```

### 配置 Claude AI OCR（可选，大幅提升识别效果）

在 Cloudflare Pages → Settings → Environment Variables 添加：

| 变量名 | 值 |
|---|---|
| `CLAUDE_API_KEY` | 你的 Anthropic API Key |

> 未配置时，OCR 会自动降级到浏览器端 Tesseract.js（支持中文但精度较低）

---

## 功能清单

| 功能 | 说明 |
|---|---|
| 🏠 多家族管理 | 创建多个家族档案，独立管理 |
| 🌳 家谱树可视化 | D3.js 交互式树形图，支持缩放/导出SVG |
| 👤 手动录入 | 5个标签页完整录入：基本/生卒/地址/关系/联系 |
| 📸 AI拍照识别 | 拍摄/上传老族谱，Claude自动提取信息 |
| 🔍 全文搜索 | 按姓名、籍贯、职业、备注搜索 |
| 📊 统计分析 | 人口统计、世代分布、出生年代、职业分布 |
| 📅 历史时间线 | 可视化每位成员的生命跨度 |
| 💾 本地存储 | 数据保存在浏览器 localStorage，无需服务器 |

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS v4
- **状态管理**: Zustand (持久化到 localStorage)
- **家谱树**: D3.js
- **OCR**: Claude API (haiku) + Tesseract.js 降级
- **部署**: Cloudflare Pages + Functions
