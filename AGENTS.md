# 王道战国志项目速读文档（供 AI Agent 使用）

这份文档是后续 Agent 进入仓库后的优先阅读材料。目标是让 Agent 不必逐个遍历源码，也能理解项目结构、关键数据流、路由规则、主题规则、角色简历规则、批量打印规则、图片系统架构和修改边界。

## 1. 项目身份

**王道战国志** 是一个个人视觉设计博客，用于展示战国七雄原创角色立绘、角色设定和人物简历。

| 项 | 当前情况 |
|---|---|
| 作者 | 王道爵士 |
| 技术栈 | React 19 + Vite 5 + Tailwind CSS v4 |
| 页面模式 | React 单页应用，不使用 React Router；用 History API + 本地路由工具同步 URL |
| 角色规模 | 当前主数据为 266 个战国人物 |
| 已点亮角色 | 简历数据中当前约 77 个点亮角色，其他角色仍可进入完整简历页 |
| 图片托管 | **前端包本地优先 + 腾讯云 COS CDN 兜底**（详见第 6 章） |
| 图片总量 | 约 26 MB，798 个 webp 文件，随前端包发布到 Cloudflare Pages |
| 包管理 | npm |
| 主要部署 | Cloudflare Pages |
| 兼容部署 | 仍保留 GitHub Pages deploy 脚本，但当前路由重写更适合 Cloudflare Pages |

常用命令：

```bash
npm run dev
npm run build
npm run preview
npm run deploy
```

`npm run build` 是当前主要验收命令。`npm run lint` 可能会遇到既有 ESLint 债务，例如 `assets/heroes-*.js` 的 CommonJS 写法、部分已有 Hook 依赖提示等；除非任务明确要求修 lint，否则不要把这些既有问题和当前改动混在一起。

## 2. 当前页面结构与 URL

项目是 React 单页应用，不引入 React Router。页面切换集中在 `src/pages/PortfolioPage.jsx`，URL 解析集中在 `src/utils/routes.js`。

当前主要页面：

```text
/                         首页 home
  飞船舷窗舱室 + 舷窗外太空 + 球形卡牌云

/appreciations            立绘赏析 art
  介绍区 + 指标卡片 + 8 个精选立绘卡牌

/resumes                  角色简历 resume
  阵营筛选 + 266 个角色卡牌索引

/resumes/:pinyin          单个角色简历详情
  例如 /resumes/baiqi

/resumes/print            全角色 A4 打印预览
  266 个角色简历按 PDF 页面效果逐页渲染，供浏览器另存 PDF

/arpg                     ARPG 占位页

/slg                      SLG 占位页
```

底部固定栏包含导航按钮、基础信息和深浅主题切换按钮。首页没有返回按钮；普通子页面有返回首页按钮；单个角色简历详情页有返回简历列表按钮。网页端单个简历详情页已经移除 PDF 打印图标按钮，PDF 导出集中走 `/resumes/print`。

## 3. 路由与深链接

项目不使用 `.html` 多页面文件，也不使用路由库。当前用 `window.history.pushState`、`popstate` 和 `src/utils/routes.js` 实现 SPA 深链接。

关键文件：

```text
src/utils/routes.js
  TAB_PATHS
  buildResumeRouteMaps()
  resolveRoute()
  getTabPath()
  getResumePath()

src/data/characterSlugs.js
  266 个角色 name -> pinyin slug 的稳定映射

public/_redirects
  Cloudflare Pages 重写规则：/* /index.html 200
```

重要规则：

- 四个子页面 URL 是 `/appreciations`、`/resumes`、`/arpg`、`/slg`。
- 角色详情 URL 是 `/resumes/<pinyin>`，例如白起为 `/resumes/baiqi`。
- 同音冲突使用 `code-pinyin` 兜底，例如：

```text
/resumes/031-hanming  汗明
/resumes/065-hanming  韩明
```

- `/resumes/print` 是保留路由，不应被当成角色 slug。
- 新增角色时，如果要支持详情深链接，必须同步更新 `src/data/characterSlugs.js`。
- `public/_redirects` 对 Cloudflare Pages 很重要：它保证刷新 `/resumes/baiqi`、`/resumes/print` 等深链接时仍回到 `index.html`，再由 React 渲染正确视图。不要删除它。
- 如果未来迁移到 GitHub Pages，普通路径刷新可能需要额外 404 fallback 或改用 hash 路由；当前配置优先服务 Cloudflare Pages。

## 4. 文件职责速查

```text
src/
├── main.jsx
│   React 入口，引入全局样式。
│
├── App.jsx
│   只渲染 <PortfolioPage />。
│
├── index.css
│   Tailwind 引入、字体、全局 body、selection 等基础样式。
│
├── App.css
│   主要组件样式文件。包含页面壳、底部导航、舷窗、主题、画廊、简历、批量打印预览、打印媒体样式和响应式断点。
│
├── pages/
│   └── PortfolioPage.jsx
│       主页面组件。包含 History API 页面切换、主题状态、CharacterImage、PortraitImage、RadarChart、
│       CharacterResumeDetail、CharacterResumePrintPage 等主要 UI 逻辑。
│       启动时会调用 loadImagePriorityConfig() 加载图片优先级配置。
│
├── components/
│   └── SphereCardCloud.jsx
│       首页球形卡牌云。使用斐波那契球面采样 + requestAnimationFrame 自动旋转，但渲染是 2D 定位。
│
├── data/
│   ├── portfolioData.js
│   │   站点文案 SITE_COPY、七国角色基础名单 STATES、8 个精选角色 FEATURED_CHARACTER_NAMES。
│   │
│   ├── whitelist.json
│   │   点亮白名单。影响立绘展示是否加载真实全身图，也间接对应简历是否展示真实头像和能力值。
│   │
│   ├── characterResumes.js
│   │   266 个角色简历的单一可维护数据源。后期人工校正文案、五维、履历主要改这里。
│   │
│   └── characterSlugs.js
│       角色姓名到 URL 拼音 slug 的稳定映射。新增角色或修正拼音 URL 时改这里。
│
├── utils/
│   ├── portfolio.js
│   │   全身立绘 URL 构造（本地 + CDN 双路径）、候选链构造、白名单判断、角色扁平化、指标统计。
│   │   buildImageCandidates(code, name, variant, priority) 根据 priority 排列本地/CDN 顺序。
│   │
│   ├── characterResume.js
│   │   简历头像 URL 构造（本地 + CDN 双路径）、候选链构造、五维字段定义、简历数据包装。
│   │   buildPortraitCandidates(portrait, priority) 根据 priority 排列本地/CDN 顺序。
│   │
│   ├── imagePriority.js
│   │   图片加载优先级状态管理。基于 useSyncExternalStore 实现。
│   │   useImagePriority() Hook、loadImagePriorityConfig() 异步加载、setImagePriority() 编程切换。
│   │   配置文件：public/images/image-priority.json
│   │
│   ├── routes.js
│   │   URL 路由解析、tab 路径、角色详情路径、打印页路径。
│   │
│   └── useReveal.js
│       IntersectionObserver 渐显动画 Hook。

assets/
├── heroes-chu.js ... heroes-zhao.js
│   早期按阵营整理的人物简介来源。当前运行时不直接依赖它们，但它们是生成/校对简历数据的重要参考。
│
└── images/
    portrait 文件名参考目录（历史遗留）。当前运行时实际使用的 portrait 图片在 public/images/portraits/。

assets_heroes/
└── images/
    历史遗留的全身立绘目录（历史遗留）。当前运行时实际使用的全身立绘在 public/images/heroes/。

public/
├── _redirects
│   Cloudflare Pages SPA 深链接重写规则。不要删除。
│
├── images/
│   ├── heroes/
│   │   全身立绘图片（532 个 webp）。包含 {code}_{name}.webp 和 {code}_{name}-small.webp 两种。
│   │   用于首页球形卡牌云、立绘赏析、角色简历索引卡牌。
│   │
│   ├── portraits/
│   │   简历头像图片（266 个 webp）。文件名为 {name}{year}.webp 格式。
│   │   用于简历详情页和 /resumes/print 右上角半身像。
│   │
│   └── image-priority.json
│       图片加载优先级配置开关。priority 字段值为 "local" 或 "cdn"。
│       修改后刷新浏览器即生效（dev 模式）；线上需重新部署。
│
├── placeholder-general.webp
│   全身立绘未点亮时使用的本地占位图。
│
├── default_general-head.webp
│   简历头像未点亮时使用的本地默认占位头像。
│
└── favicon.png / icons.svg

print.md
  浏览器导出角色简历 PDF 的操作指南。
```

## 5. 角色基础数据流

### 5.1 立绘展示用数据

`src/data/portfolioData.js` 里的 `STATES` 是首页、立绘赏析、画廊索引的基础名单。

```js
STATES = [
  { key: 'all', label: '全部' },
  { key: 'chu', label: '楚', tone, names: [{ code, name }] },
  ...
]
```

当前七国数量：

| 阵营 | key | 数量 |
|---|---|---:|
| 楚 | `chu` | 34 |
| 韩 | `han` | 29 |
| 齐 | `qi` | 31 |
| 秦 | `qin` | 65 |
| 魏 | `wei` | 27 |
| 燕 | `yan` | 31 |
| 赵 | `zhao` | 49 |
| 合计 | - | 266 |

`src/utils/portfolio.js` 的 `buildCharacters(STATES)` 会扁平化为：

```js
{
  id: `${code}_${name}`,
  code,
  name,
  stateKey,
  stateLabel,
  tone,
  note
}
```

`PortfolioPage.jsx` 顶部会构造：

```js
const CHARACTERS = buildCharacters(STATES);
```

### 5.2 角色简历数据

`src/data/characterResumes.js` 是 **266 个角色简历的唯一集中数据文件**。后续人工校正文案、五维能力、理由、时间轴时，优先改这个文件。

单条数据结构大致如下：

```js
{
  id: '001_楚怀王',
  code: '001',
  name: '楚怀王',
  country: '楚',
  stateKey: 'chu',
  stateLabel: '楚国',
  title: '楚，前355年-前296年',
  stateColor: '#db6d6d',
  portrait: '楚怀王2025.webp',
  sourcePortrait: '楚怀王2025.webp',
  lit: true,
  bio: '...',
  quote: '...',
  stats: {
    wuli: 51,
    tongshuai: 68,
    zhili: 91,
    zhengzhi: 88,
    meili: 82
  },
  statsReason: {
    wuli: '...',
    tongshuai: '...',
    zhili: '...',
    zhengzhi: '...',
    meili: '...'
  },
  timeline: [
    { year: '前355', event: '...' }
  ]
}
```

`src/utils/characterResume.js` 做三件事：

- 定义本地 portrait 目录和 CDN 兜底 base URL。
- 给每条简历补 `portraitCandidates`（候选链数组）和 `portraitUrl`（首选 URL，向后兼容）。
- 输出五维字段顺序：武力、统率、智力、政治、魅力。

`PortfolioPage.jsx` 顶部会构造：

```js
const CHARACTER_RESUMES = buildCharacterResumes();
const STAT_KEYS = getStatKeys();
```

### 5.3 角色 URL slug

`src/data/characterSlugs.js` 是角色详情 URL 的稳定映射：

```js
export const CHARACTER_NAME_SLUGS = {
  '白起': 'baiqi',
  '乐毅': 'yueyi',
  ...
};
```

`src/utils/routes.js` 会基于 `CHARACTER_RESUMES` 和 `CHARACTER_NAME_SLUGS` 构造：

```js
idToSlug: Map<resume.id, slug>
slugToId: Map<slug, resume.id>
```

不要在运行时引入拼音库来生成 slug；当前仓库选择固化 266 个 slug，避免前端包体被拼音库拖大。新增或修正角色 URL 时，直接改 `characterSlugs.js`。

## 6. 图片系统与白名单规则

项目有两套图片系统：全身立绘和简历头像。不要混淆。**两者都采用「前端包本地优先 + 腾讯云 CDN 兜底」的双路径架构**，且都支持运行时优先级切换（详见第 6.3 节）。

### 6.1 全身立绘

全身立绘用于首页球形卡牌云、立绘赏析和角色简历索引卡牌。

本地图片目录：`public/images/heroes/`（随前端包发布到 Cloudflare Pages，带宽和请求数免费无限）

CDN 兜底地址（配置在 `src/utils/portfolio.js`）：

```js
CDN_BASE_IMAGE_URL = 'https://zhanguo-imgs-1379320306.cos.accelerate.myqcloud.com/zhanguo_imgs/'
```

文件命名规则：

```text
普通图：{code}_{name}.webp          本地路径：/images/heroes/{code}_{name}.webp
缩略图：{code}_{name}-small.webp    本地路径：/images/heroes/{code}_{name}-small.webp
CDN png 回退：{code}_{name}.png     仅 CDN 有，本地无 png
最终占位图：/placeholder-general.webp  始终走本地 public/
```

`CharacterImage` 组件在 `PortfolioPage.jsx` 中，负责：

- 先通过 `isCharacterLit(name)` 判断是否在 `whitelist.json`。
- 已点亮：调用 `buildImageCandidates(code, name, variant, priority)` 构造候选链，按顺序尝试加载，失败后 `onError` 切换下一个候选，最终回退占位图。
- 未点亮：直接用 `public/placeholder-general.webp`。
- 组件内部通过 `useImagePriority()` Hook 订阅优先级变化，优先级切换时自动重新构造候选链。

候选链顺序（`priority` 参数控制）：

```text
local 优先（默认）：
  sphere 变体：本地-small → CDN-small → 本地-webp → CDN-webp → CDN-png → 占位图
  default 变体：本地-webp → CDN-webp → CDN-png → 占位图

cdn 优先：
  sphere 变体：CDN-small → 本地-small → CDN-webp → 本地-webp → CDN-png → 占位图
  default 变体：CDN-webp → 本地-webp → CDN-png → 占位图
```

不要删除或绕过这个加载回退链。

### 6.2 简历头像 portrait

简历详情页和 `/resumes/print` 中右上角的半身像。

本地图片目录：`public/images/portraits/`（文件名为 `{name}{year}.webp` 格式）

CDN 兜底地址（配置在 `src/utils/characterResume.js`）：

```js
PORTRAIT_BASE_URL = 'https://zhanguo-portraits-1379320306.cos.ap-shanghai.myqcloud.com/'
DEFAULT_PORTRAIT_FILE = 'default_general-portrait.webp'
```

本地默认占位头像：`/default_general-head.webp`（位于 `public/`，文件名与 CDN 的 `default_general-portrait.webp` 不同）

规则：

- 白名单/点亮角色：`characterResumes.js` 中的 `portrait` 使用真实 `.webp` 文件名（如 `楚怀王2025.webp`）。
- 未点亮角色：`portrait` 必须是 `default_general-portrait.webp`。
- 未点亮角色仍然能点击进入简历详情页，且必须保留完整简介和时间轴。
- 未点亮角色的 `stats` 为 `null`，雷达图显示问号；`statsReason` 为 `null`，右侧理由区域为空态。
- `sourcePortrait` 可保留原始候选文件名，方便后续人工校正，但运行时展示看 `portrait`。

`PortraitImage` 组件在 `PortfolioPage.jsx` 中，负责：

- 调用 `buildPortraitCandidates(portrait, priority)` 构造候选链。
- 默认占位头像（`default_general-portrait.webp`）直接走本地 `default_general-head.webp`，不重复走 CDN。
- 组件内部通过 `useImagePriority()` Hook 订阅优先级变化。

候选链顺序：

```text
local 优先（默认）：本地 portrait → CDN portrait → 本地默认占位头像
cdn 优先：CDN portrait → 本地 portrait → 本地默认占位头像
默认占位头像：直接走本地 /default_general-head.webp（不区分优先级）
```

### 6.3 图片加载优先级开关

项目支持运行时切换图片加载优先级，方便做加载试验（例如对比本地 vs CDN 的加载速度）。

配置文件：`public/images/image-priority.json`

```json
{
  "priority": "local"
}
```

- `"local"`（默认）：优先加载前端包本地图片，失败后回退 CDN。
- `"cdn"`：优先加载腾讯云 CDN 图片，失败后回退本地。

工作机制：

1. `PortfolioPage` 启动时调用 `loadImagePriorityConfig()` fetch 该 JSON。
2. 通过 `setImagePriority()` 更新 `src/utils/imagePriority.js` 中的全局状态。
3. `useSyncExternalStore` 通知所有订阅组件（`CharacterImage`、`PortraitImage`）重新渲染。
4. 组件重新构造候选链，`sourceIndex` 重置为 0，从头尝试加载。

修改方式：

- dev 模式：直接改 JSON 文件，刷新浏览器即生效。
- 线上：修改后需重新部署（Cloudflare Pages 会随构建发布该 JSON）。

不要删除这个配置文件，也不要改变 `priority` 字段的取值范围（只允许 `"local"` 或 `"cdn"`）。

### 6.4 Vite 本地图片插件

`vite.config.js` 中有一个 `localStaticImages()` 插件，用于在 dev 模式下通过中间件把 `/images/heroes/*` 和 `/images/portraits/*` 映射到本地文件系统。

**注意**：当前图片已经全部移动到 `public/images/heroes/` 和 `public/images/portraits/` 下，Vite 会自动服务 `public/` 目录下的文件。因此这个插件在当前状态下实际上是冗余的（中间件找不到文件会 `next()` 交给 Vite 默认处理），但保留它不会造成问题。如果未来清理代码，可以移除该插件。

历史背景：该插件最初设计用于图片还在 `assets_heroes/images/` 和 `assets/images/` 目录时，通过中间件在 dev 模式服务、在 build 模式复制到 `dist/`。图片移动到 `public/` 后，Vite 原生的 `public/` 目录机制接管了这个职责。

## 7. 阵营颜色

五维雷达图和部分视觉强调使用七国阵营色。当前颜色为：

```js
const STATE_COLOR_MAP = {
  chu: '#db6d6d',
  han: '#70db74',
  qi: '#9653a2',
  qin: '#8a8282',
  wei: '#449be3',
  yan: '#ffffff',
  zhao: '#ba9d1a',
};
```

`characterResumes.js` 中每条数据也保存了 `stateColor`。如果需要批量调整阵营色，要同步检查雷达图、简历数据和相关 CSS 视觉对比。

## 8. 首页球形卡牌云

组件：`src/components/SphereCardCloud.jsx`

视觉设定：

- 外层是飞船舱室/舷窗区域。
- 舷窗内部是深色太空模拟环境。
- 太空中漂浮球形卡牌云。
- 浅色主题只改变舷窗矩形外部的舱室区域，不应该改变舷窗内部太空的深色基调。

核心实现：

1. `sampleCharacters(characters, 28)` 等距采样最多 28 个角色。
2. `buildSphereLayout()` 用斐波那契球面算法分配 `{ x, y, z }`。
3. `requestAnimationFrame` 自动旋转。
4. 每帧计算 3D 点位，但最终使用 2D `left/top + calc(50% + dx/dy)` 投影。
5. 深度用透明度、模糊和层级表达。

重要约束：

- **不要重新引入 CSS 3D transform / preserve-3d / translate3d 球体方案。**
- 之前是为了规避 iOS Safari CSS 3D 渲染问题，才改成现在的 2D 投影方案。
- 首页浅色主题下，舷窗内部人名仍应保持白色；国家名保留阵营色。
- 首页舷窗上方的筛选按钮在浅色主题下已有专门 active 样式，选中态是深色底浅色字。

## 9. 立绘赏析页

URL：`/appreciations`

位置：`PortfolioPage.jsx` 中 `activeTab === 'art'` 分支。

组成：

- 顶部介绍区。
- 三个指标卡：原创角色、阵营档案、精选展陈。
- 8 个精选立绘卡牌。

精选角色来自：

```js
FEATURED_CHARACTER_NAMES
```

当前精选卡牌文字只展示：

```text
国家
姓名
```

已经移除了原先第三行 `item.note`（例如颜色主题"白"）。不要在没有明确需求时把第三行恢复。

浅色主题下：

- 精选卡牌底部使用浅色暖光渐变照射效果。
- "原创角色 / 阵营档案 / 精选展陈"等小标签需要深色显示，保证可读性。
- 精选卡牌文字整体位置经过微调，略微靠下。

## 10. 角色简历页

URL：

```text
/resumes
/resumes/:pinyin
```

位置：`PortfolioPage.jsx` 中 `activeTab === 'resume'` 分支。

角色简历有三个相关视图：

1. 简历索引页：阵营筛选 + 角色卡牌网格。
2. 单个简历详情页：点击任意角色卡牌进入。
3. 批量打印页：`/resumes/print`，见下一章。

索引页数据来自 `CHARACTER_RESUMES`，不是 `CHARACTERS`。这保证 266 个角色的简历信息集中由 `characterResumes.js` 控制。

详情页相关组件：

```js
CharacterResumeContent
CharacterResumeDetail
PortraitImage
RadarChart
```

`CharacterResumeContent` 是单个简历内容的复用组件，详情页和批量打印页都使用它。详情页固定三大板块，标题文字不要随意改：

```text
人物简介
人物能力
人物履历
```

人物简介：

- 直接展示 `resume.bio`。

人物能力：

- 左侧是 `RadarChart`。
- 右侧是五维理由。
- 点亮角色展示具体数值、雷达多边形和理由。
- 未点亮角色展示问号雷达图；右侧理由留空态。
- 雷达图实际能力五边形的五个顶点有白色圆点强调。
- 打印模式下雷达图轴线有专门样式，避免浏览器打印预览里某条轴线发虚；修改 `RadarChart` 或 `.radar-axis` 时要检查打印预览。

人物履历：

- 使用 `resume.timeline`。
- 视觉为时间轴，不使用折叠/展开按钮。

浅色主题下：

- 简历索引卡牌也有浅色暖光渐变照射效果。
- 详情页三个内容板块和详情背景都要适配浅色主题。
- 详情页背景在浅色主题和 PDF 打印中都使用圆角矩形容器，并保留内边距留白。

## 11. `/resumes/print` 批量打印页

URL：

```text
/resumes/print
```

用途：

- 以 A4/PDF 页面预览方式一次性渲染 266 个角色简历。
- 用户在浏览器里右键 Print 或使用浏览器菜单打印，然后另存为 PDF。
- 不使用 Playwright、Chromium、Puppeteer 或仓库脚本批量导出。

相关组件与样式：

```text
PortfolioPage.jsx
  CharacterResumePrintPage
  CharacterResumeContent
  ThemeToggleIcon

App.css
  .resume-print-mode
  .resume-print-view
  .resume-print-shell
  .resume-print-page
  .resume-print-theme-toggle
  @media print

print.md
  面向人工操作的 PDF 导出指南
```

屏幕预览规则：

- `/resumes/print` 下根节点会加 `resume-print-mode`。
- 底部导航栏、首页返回按钮、页面噪点在打印预览模式下隐藏。
- 每个角色是一个独立 `.resume-print-page`，屏幕上呈现为 A4 纸张块。
- 右上角有 `resume-print-theme-toggle`，可切换深色 / 浅色打印预览。
- 这个主题按钮仅用于预览，打印时必须隐藏。

打印规则：

- `@media print` 中强制放开 `html`、`body`、`#root`、`.page-shell`、`.resume-print-mode`、`.main-area` 的 `height` 和 `overflow`，否则 Edge/Chrome 可能只识别 `total: 1 page`。
- `.resume-print-page` 使用 `break-after: page` / `page-break-after: always`，最后一页取消强制分页。
- A4 portrait，`@page { size: A4 portrait; margin: 10mm; }`。
- 打印时隐藏：底部导航、返回按钮、普通主题按钮、`resume-print-theme-toggle`、详情页操作区。
- 深色与浅色主题都应进入打印输出；浏览器打印设置里需要开启 background graphics。
- 如果修改 `/resumes/print` 布局，一定要用浏览器打印预览检查页数不是 `total: 1 page`。

操作指南记录在：

```text
print.md
```

## 12. 深浅主题

主题状态在 `PortfolioPage.jsx`：

```js
const [theme, setTheme] = useState('dark');
```

根节点类名：

```text
page-shell theme-dark
page-shell theme-light
```

在 `/resumes/print` 下根节点额外有：

```text
resume-print-mode
```

主题切换：

- 普通页面：底部基础信息栏中间的 `theme-toggle-btn`。
- `/resumes/print` 页面：右上角浮动的 `resume-print-theme-toggle`。
- 图标由 `ThemeToggleIcon` 渲染，是一个内联 SVG 的日/月切换符号。

主题规则：

- 默认深色主题。
- 浅色主题通过 `.theme-light ...` 覆盖。
- 不要把浅色主题样式写成全局覆盖，避免破坏深色主题。
- 首页舷窗内部太空环境不随浅色主题改亮。
- 首页舷窗外部的舱室区域会随浅色主题改成浅色。
- 首页舷窗内部人名在浅色主题下仍保持白色，国家名仍保留原阵营色。
- 浅色主题下的筛选 active 按钮、标签、卡牌文字都已有专门对比度修正，修改时注意不要回退成浅黄字配浅黄底。
- `/resumes/print` 的浅色与深色主题都要在浏览器打印预览里检查。

## 13. 样式组织和响应式

主要样式都在 `src/App.css`，按功能区块组织。

关键类名区域：

```text
.page-shell
.bottom-bar
.nav-btn
.theme-light ...
.sphere-cloud...
.hero...
.featured...
.gallery...
.resume...
.resume-print...
.radar...
@media print
```

断点：

```text
1180px
860px
560px
```

修改 UI 后要考虑：

- 桌面宽屏。
- 平板/中等宽度。
- 手机宽度。
- 深色主题。
- 浅色主题。
- 打印样式，尤其是 `/resumes/print` 和角色简历详情页。

设计约束：

- 不要把页面切换迁移到路由库，除非用户明确要求。
- 不要把内容区做成过度嵌套卡片。
- 不要用说明性大段文字解释功能，页面应该直接展示可用内容。
- 图标优先用 `lucide-react`，除非是已有自定义 SVG（例如主题切换图标）。
- 卡牌圆角和阴影要与当前风格一致。
- `/resumes/print` 屏幕预览应像 PDF 页，而不是普通长网页；每个角色应有独立纸张感。

## 14. 常见修改流程

### 14.1 修改某个角色简历

优先打开：

```text
src/data/characterResumes.js
```

按 `name` 或 `id` 搜索，修改：

```text
bio
stats
statsReason
timeline
portrait
lit
```

如果只是修人物履历或能力理由，不需要改页面组件。

### 14.2 点亮一个角色

需要同时确认两类图：

1. 全身立绘是否已经按 `{code}_{name}.webp` 和 `{code}_{name}-small.webp` 放入 `public/images/heroes/`（同时也可上传到 CDN 作为兜底）。
2. 简历 portrait 是否已经按 `portrait` 文件名放入 `public/images/portraits/`（同时也可上传到 CDN 作为兜底）。

然后修改：

```text
src/data/whitelist.json
src/data/characterResumes.js
```

简历数据中：

```js
lit: true
portrait: '真实文件名.webp'
stats: { ... }
statsReason: { ... }
```

未点亮角色应保持：

```js
lit: false
portrait: 'default_general-portrait.webp'
stats: null
statsReason: null
```

### 14.3 新增角色

通常需要同步四个地方：

```text
src/data/portfolioData.js
src/data/characterResumes.js
src/data/characterSlugs.js
src/data/whitelist.json（如果已点亮）
```

如果有旧来源资料，也可更新：

```text
assets/heroes-*.js
```

但当前运行时主要依赖 `portfolioData.js`、`characterResumes.js`、`characterSlugs.js`。

如果角色已点亮，还需把图片放入：

```text
public/images/heroes/{code}_{name}.webp
public/images/heroes/{code}_{name}-small.webp
public/images/portraits/{portrait 文件名}
```

### 14.4 修改角色 URL

优先看：

```text
src/data/characterSlugs.js
src/utils/routes.js
```

注意：

- `/resumes/print` 是保留路径，不要用作角色 slug。
- slug 应稳定，不要因为拼音库版本变化而运行时改变。
- 修改 slug 后，旧链接可能失效；如需兼容旧链接，要在 `resolveRoute()` 增加兼容逻辑。

### 14.5 修改首页球形云

优先看：

```text
src/components/SphereCardCloud.jsx
src/App.css 中 .sphere-cloud... 区块
```

只改采样、布局、视觉层，不要改回 CSS 3D。

### 14.6 修改主题

优先看：

```text
PortfolioPage.jsx 中 theme / ThemeToggleIcon
App.css 中 .theme-light 区块
```

浅色主题只通过 `.theme-light` 覆盖。修改后重点检查：

- 首页舷窗外部是否变浅。
- 舷窗内部太空是否仍深色。
- 舷窗内部人名是否仍白色。
- 筛选按钮 active 状态是否有足够对比。
- 立绘赏析和角色简历卡牌底部光照是否自然。
- `/resumes/print` 深色 / 浅色预览是否都正常。
- `/resumes/print` 打印输出是否隐藏主题按钮。

### 14.7 修改 PDF 输出

当前 PDF 输出的主要入口是：

```text
/resumes/print
```

优先看：

```text
CharacterResumePrintPage
CharacterResumeContent
App.css 的 .resume-print... 和 @media print
print.md
```

不要重新把网页端单个角色详情页的打印按钮加回来，除非用户明确要求。

修改后重点检查：

- `/resumes/print` 屏幕上是否仍是逐页 A4 预览。
- 深色主题和浅色主题是否都能切换。
- 打印时是否隐藏导航、返回按钮、主题按钮。
- Edge/Chrome 打印预览页数是否不是 `total: 1 page`。
- 雷达图五条轴线在打印预览里是否粗细一致。
- 背景色是否保留；必要时提醒开启 browser print 的 background graphics。

### 14.8 切换图片加载优先级

优先看：

```text
public/images/image-priority.json
src/utils/imagePriority.js
```

修改方式：

- dev 模式：直接改 `public/images/image-priority.json` 的 `priority` 字段为 `"local"` 或 `"cdn"`，刷新浏览器即生效。
- 线上：修改后需重新部署。

涉及候选链构造的代码在：

```text
src/utils/portfolio.js 的 buildImageCandidates()
src/utils/characterResume.js 的 buildPortraitCandidates()
```

不要改变 `priority` 字段的取值范围（只允许 `"local"` 或 `"cdn"`），也不要删除 `useImagePriority()` Hook 的订阅逻辑，否则优先级切换不会触发重新渲染。

### 14.9 修改图片资源

如果需要替换或新增图片文件：

- 全身立绘：放入 `public/images/heroes/`，遵循 `{code}_{name}.webp` 和 `{code}_{name}-small.webp` 命名。
- 简历头像：放入 `public/images/portraits/`，文件名需与 `characterResumes.js` 中 `portrait` 字段一致。
- 默认占位图：`public/placeholder-general.webp`（全身立绘）和 `public/default_general-head.webp`（简历头像）。

如果同时上传到 CDN 作为兜底，确保 CDN 上的文件名与本地一致。

不要把图片放到 `src/assets/` 下用 import 引入，那会导致 Vite 把图片转 base64 嵌入 JS，造成包体爆炸。

## 15. 外部依赖

| 依赖 | 用途 |
|---|---|
| `react` / `react-dom` | UI |
| `vite` | 开发和构建 |
| `tailwindcss` / `@tailwindcss/vite` | Tailwind v4 集成 |
| `lucide-react` | UI 图标 |
| `gh-pages` | GitHub Pages 部署脚本 |
| 腾讯云 COS | **CDN 兜底**（图片主路径已改为前端包本地，COS 仅在本地加载失败时兜底） |
| Cloudflare Pages | 主要部署平台（带宽和请求数免费无限） |
| Google Fonts | `Cormorant Garamond` 标题字体、`Noto Sans SC` 正文字体 |

当前没有 Playwright、Puppeteer、Chromium 依赖。PDF 导出走浏览器人工打印，不走仓库脚本。

## 16. Agent 工作建议

进入项目后建议先读：

```text
AGENTS.md
src/pages/PortfolioPage.jsx 的相关组件片段
src/App.css 的相关样式片段
src/utils/routes.js（涉及 URL / 深链接时）
src/utils/imagePriority.js（涉及图片优先级时）
src/data/characterSlugs.js（涉及角色详情 URL 时）
src/data/characterResumes.js 中目标角色附近数据（涉及人物内容时）
print.md（涉及 PDF 导出操作时）
```

不要一开始全量读取：

```text
src/data/characterResumes.js（266 条全量数据，除非任务要求批量处理）
public/images/（798 个图片文件，无需读取）
assets/images/、assets_heroes/images/（历史遗留目录，运行时不直接依赖）
assets/heroes-*.js（早期人物简介来源，运行时不依赖）
dist/
node_modules/
```

除非任务明确要求批量校对、批量生成或统计。

修改后至少运行：

```bash
npm run build
```

如果任务涉及视觉效果，最好启动或沿用：

```bash
npm run dev
```

然后检查：

- 对应 URL 深链接刷新是否正确。
- 深色主题和浅色主题。
- 桌面、平板、手机宽度。
- 图片是否正常加载（本地优先 + CDN 兜底）。
- `/resumes/print` 屏幕预览。
- 浏览器打印预览，尤其是页数、分页、背景、雷达图轴线和隐藏按钮。

如果任务涉及图片系统，额外检查：

- 修改 `public/images/image-priority.json` 后刷新浏览器，优先级是否切换生效。
- `CharacterImage` 和 `PortraitImage` 的候选链兜底是否正常（可断网测试本地加载、可屏蔽本地路径测试 CDN 兜底）。
