# Toastmasters 电子许愿墙 - Vercel 部署说明

本压缩包包含：

- Next.js 前端与 API 源码
- 飞书 Base 接入逻辑
- `.env.example` 环境变量模板
- 多维表格初始化脚本 `scripts/bootstrap-feishu-base.mjs`

注意：

- 压缩包 **不包含** `.env.local`
- 请在另一台电脑上，把当前电脑 `.env.local` 里的值同步到 Vercel 环境变量

## 一、部署前准备

需要准备这些环境变量：

```bash
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_BASE_TOKEN=
FEISHU_TABLE_ID=
FEISHU_OWNER_OPEN_ID=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
SENSITIVE_WORDS=赌博,色情,暴力,辱骂,敏感政治,广告引流
```

说明：

- `FEISHU_APP_ID` / `FEISHU_APP_SECRET`：飞书应用凭据
- `FEISHU_BASE_TOKEN` / `FEISHU_TABLE_ID`：当前电子许愿墙所用多维表格
- `FEISHU_OWNER_OPEN_ID`：可选。用于后续脚本授权或迁移
- `ADMIN_PASSWORD`：审核台共享密码
- `ADMIN_SESSION_SECRET`：建议重新生成一个 32~64 位随机字符串
- `SENSITIVE_WORDS`：可选，逗号分隔

如果你想新建一套飞书 Base，而不是复用当前 Base：

1. 在本地复制 `.env.example` 为 `.env.local`
2. 填入 `FEISHU_APP_ID`、`FEISHU_APP_SECRET`
3. 运行：

```bash
node scripts/bootstrap-feishu-base.mjs
```

脚本会输出新的 `FEISHU_BASE_TOKEN` 与 `FEISHU_TABLE_ID`

## 二、方案 A：用 Vercel CLI 从压缩包直接部署

适合你拿到 zip 后，在另一台电脑上直接解压部署。

### 1. 安装环境

- Node.js 20 或更高版本
- 一个 Vercel 账号

### 2. 解压后安装依赖

```bash
npm install
```

### 3. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 4. 登录 Vercel

```bash
vercel login
```

### 5. 初始化项目

在项目根目录运行：

```bash
vercel
```

推荐选择：

- Scope：你的个人账号或团队
- Link to existing project：`No`
- Project name：自定义，例如 `toastmasters-wish-wall`

### 6. 配置环境变量

推荐在 Vercel 控制台配置：

1. 打开项目
2. 进入 `Settings` -> `Environment Variables`
3. 把上面的 8 个变量补齐
4. 对 `Production / Preview / Development` 三个环境都加上

也可以用 CLI 逐个添加：

```bash
vercel env add FEISHU_APP_ID
vercel env add FEISHU_APP_SECRET
vercel env add FEISHU_BASE_TOKEN
vercel env add FEISHU_TABLE_ID
vercel env add FEISHU_OWNER_OPEN_ID
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_SESSION_SECRET
vercel env add SENSITIVE_WORDS
```

### 7. 生产部署

```bash
vercel --prod
```

部署完成后会返回一个线上域名。

## 三、方案 B：上传 Git 仓库后通过 Vercel 控制台部署

如果你更习惯图形界面：

1. 先把解压后的项目推到 GitHub / GitLab / Bitbucket
2. 登录 `vercel.com`
3. 选择 `Add New Project`
4. 导入仓库
5. Framework Preset 选择 `Next.js`
6. Build Command 保持默认
7. Output Directory 留空
8. 在 Environment Variables 中填入上面 8 个变量
9. 点击 Deploy

## 四、部署后验证

部署成功后，检查这几个地址：

- `/submit`：用户提交页
- `/admin`：审核台
- `/screen`：大屏页

建议按这个顺序验证：

1. 打开 `/submit` 提交一条测试愿望
2. 打开 `/admin` 用 `ADMIN_PASSWORD` 登录并审核通过
3. 打开 `/screen` 确认 5 秒内出现

## 五、当前项目关键说明

### 路由

- `app/submit`：提交页
- `app/admin`：审核台
- `app/screen`：大屏页

### API

- `app/api/wishes/route.ts`：提交愿望
- `app/api/public/meta/route.ts`：提交元信息
- `app/api/admin/session/route.ts`：后台登录
- `app/api/admin/wishes/route.ts`：后台列表
- `app/api/admin/wishes/[recordId]/route.ts`：审核/删除
- `app/api/screen/wishes/route.ts`：大屏轮询数据

### 飞书接入

- `lib/feishu-base.ts`：飞书 Base 读写
- `lib/feishu-config.ts`：环境变量读取
- `scripts/bootstrap-feishu-base.mjs`：初始化多维表格

## 六、建议

正式活动建议优先使用 Vercel 正式域名，不要长期依赖临时 tunnel。

如果现场还需要二维码：

- 提交二维码：`https://你的域名/submit`
- 大屏地址：`https://你的域名/screen`
- 审核台地址：`https://你的域名/admin`
