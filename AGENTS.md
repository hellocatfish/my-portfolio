# 王道战国志项目速读文档（AI Agent 优先阅读）

这份文档用于让后续 Agent 快速理解仓库，不必全量遍历源码。进入任务后先读本文件，再按任务只打开相关源码片段。

## 1. 项目速览

**王道战国志** 是王道爵士的个人视觉设计博客，展示战国七雄原创角色立绘、角色设定和人物简历。

| 项 | 当前状态 |
|---|---|
| 技术栈 | React 19 + Vite 5 + Tailwind CSS v4 |
| 页面模式 | React SPA；不用 React Router；History API + `src/utils/routes.js` |
| 包管理 | npm |
| 主要部署 | Cloudflare Pages |
| 兼容部署 | 保留 GitHub Pages `deploy` 脚本 |
| 角色规模 | 266 个角色 |
| 点亮状态 | 77 个已点亮，189 个未点亮 |
| 图片资源 | `public/images/heroes/` 532 个 webp；`public/images/portraits/` 266 个 webp |
| 图片加载 | 前端包本地优先 + 腾讯云 COS CDN 兜底；支持运行时切换 local/cdn 优先级 |

常用命令：

```bash
npm run dev
npm run build
npm run preview
npm run deploy
```

主要验收命令是 `npm run build`。`npm run lint` 可能暴露既有 ESLint 债务；除非任务要求修 lint，不要混入无关 lint 修复。

## 2. 页面与路由

项目不使用 `.html` 多页面，也不使用路由库。页面切换集中在 `src/pages/PortfolioPage.jsx`，URL 解析集中在 `src/utils/routes.js`。

```text
/                         首页：飞船舷窗 + 太空 + 球形卡牌云
/appreciations            立绘赏析：介绍区 + 指标 + 8 个精选立绘
/resumes                  角色简历索引：阵营筛选 + 266 个角色卡牌
/resumes/:pinyin          单个角色简历详情，例如 /resumes/baiqi
/resumes/print            全角色 A4 打印预览
/arpg                     占位页
/slg                      占位页
```

路由规则：

- `TAB_PATHS` 在 `src/utils/routes.js` 中维护。
- 角色详情 slug 来自 `src/data/characterSlugs.js`，不要运行时引入拼音库。
- `/resumes/print` 是保留路由，不得作为角色 slug。
- 同名/同音冲突用 `code-pinyin`，例如 `/resumes/031-hanming` 和 `/resumes/065-hanming`。
- `public/_redirects` 必须保留：`/* /index.html 200`，用于 Cloudflare Pages 深链接刷新。
- 如果迁移到 GitHub Pages，普通路径刷新可能需要 404 fallback 或 hash 路由；当前配置优先服务 Cloudflare Pages。

导航行为：

- 底部固定栏包含导航按钮、基础信息、社交链接和主题切换。
- 首页没有返回按钮；普通子页有返回首页按钮；角色详情页有返回简历列表按钮。
- 单个简历详情页不提供网页端 PDF 打印按钮；批量 PDF 入口统一是 `/resumes/print`。

## 3. 关键文件地图

```text
src/App.jsx
  只渲染 <PortfolioPage />。

src/pages/PortfolioPage.jsx
  主页面组件。包含 History API 同步、主题状态、CharacterImage、PortraitImage、
  RadarChart、CharacterResumeContent、CharacterResumeDetail、CharacterResumePrintPage。
  启动时调用 loadImagePriorityConfig()。

src/App.css
  主要样式。包含页面壳、底部导航、主题、舷窗、画廊、简历、打印预览、
  @media print 和响应式断点。

src/components/SphereCardCloud.jsx
  首页球形卡牌云。斐波那契球面采样 + requestAnimationFrame 旋转，最终用 2D left/top 投影。

src/data/portfolioData.js
  SITE_COPY、STATES、FEATURED_CHARACTER_NAMES。STATES 是首页/赏析/索引基础名单。

src/data/characterResumes.js
  266 个角色简历的唯一集中数据源。改简介、能力、履历、portrait、lit 优先改这里。

src/data/characterSlugs.js
  角色姓名到稳定 URL slug 的映射。

src/data/whitelist.toml
  全身立绘点亮白名单（TOML 格式，支持 # 注释）。影响 CharacterImage 是否加载真实立绘。
  所有 266 人按阵营逐行列出，未点亮者以 # 注释保留，取消注释即可点亮。

src/utils/portfolio.js
  全身立绘本地/CDN URL、候选链、白名单判断、角色扁平化、指标统计。

src/utils/characterResume.js
  简历头像本地/CDN URL、候选链、五维字段定义、简历数据包装。

src/utils/imagePriority.js
  图片加载优先级状态。useSyncExternalStore + public/images/image-priority.json。

src/utils/routes.js
  URL 解析、tab path、角色详情 path、打印路由。

public/
  Cloudflare redirects、图片资源、占位图、favicon/icons。

print.md
  人工浏览器导出 PDF 的操作指南。
```

历史/辅助目录：

- `assets/heroes-*.js` 是早期人物简介来源，运行时不直接依赖；可用于校对。
- `assets/images/`、`assets_heroes/images/` 是历史遗留资源目录，当前运行主路径是 `public/images/`。
- `vite.config.js` 仍保留 `localStaticImages()` 历史兼容插件；新增/替换运行时图片时仍放 `public/images/`，不要依赖旧目录。
- 不要读取或修改 `dist/`、`node_modules/`，除非任务明确要求。

## 4. 数据模型

### 4.1 角色基础名单

`src/data/portfolioData.js` 的 `STATES` 包含七国角色名单：

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

`buildCharacters(STATES)` 会扁平化为 `{ id, code, name, stateKey, stateLabel, tone, note }`。

### 4.2 角色简历

`src/data/characterResumes.js` 是简历唯一可维护数据源。单条记录核心字段：

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
  stats: { wuli: 51, tongshuai: 68, zhili: 91, zhengzhi: 88, meili: 82 },
  statsReason: { wuli: '...', tongshuai: '...', zhili: '...', zhengzhi: '...', meili: '...' },
  timeline: [{ year: '前355年', event: '...' }]
}
```

未点亮角色规则：

- `lit: false`
- `portrait: 'default_general-head.webp'`；旧数据里的 `default_general-portrait.webp` 仍被运行时兼容映射到新文件
- `stats: null`
- `statsReason: null`
- 仍保留完整 `bio`，仍可进入详情页。
- `timeline`：数据源中仍保留真实履历，但运行时简历详情页和 `/resumes/print` 打印页会改用占位时间线 `UNLIT_PLACEHOLDER_TIMELINE`（见 `PortfolioPage.jsx` 的 `CharacterResumeContent`），不展示真实履历。
- `year` 字段格式：具体年份统一带"年"（如 `前355年`）；时段标签 `战国中后期` 不带"年"。

五维顺序来自 `src/utils/characterResume.js`：武力、统率、智力、政治、魅力。

## 5. 图片系统

项目有两套图片：全身立绘（heroes）和简历头像（portraits）。两者都使用“本地前端包 + CDN 兜底”，并受 `public/images/image-priority.json` 控制。

### 5.1 全身立绘 heroes

用途：首页球形卡牌云、立绘赏析、角色简历索引卡牌。

```text
本地目录：public/images/heroes/
真实图 CDN base： https://zhanguo-imgs-1379320306.cos.accelerate.myqcloud.com/zhanguo_imgs/
占位图 CDN base： https://zhanguo-imgs-1379320306.cos.ap-shanghai.myqcloud.com/zhanguo_imgs/
普通图：  {code}_{name}.webp
缩略图：  {code}_{name}-small.webp
CDN png： {code}_{name}.png（仅 CDN 兜底）
默认占位：public/placeholder-general.webp
缩略占位：public/placeholder-general-small.webp
```

`CharacterImage` 位于 `PortfolioPage.jsx`：

- 先用 `isCharacterLit(name)` 判断 `whitelist.toml`。
- 已点亮：`buildImageCandidates(code, name, variant, priority)` 生成候选链，`onError` 逐个兜底。
- 未点亮：`buildPlaceholderImageCandidates(variant, priority)` 生成占位图候选链，球形云使用 small 占位图，其他位置使用默认占位图。
- 通过 `useImagePriority()` 订阅优先级变化，变化后从候选链第 0 项重试。

候选链：

```text
local 优先：
  sphere:  本地-small -> CDN-small -> 本地-webp -> CDN-webp -> CDN-png -> 本地-small占位 -> CDN-small占位
  default: 本地-webp  -> CDN-webp  -> CDN-png -> 本地占位 -> CDN占位

cdn 优先：
  sphere:  CDN-small -> 本地-small -> CDN-webp -> 本地-webp -> CDN-png -> CDN-small占位 -> 本地-small占位
  default: CDN-webp  -> 本地-webp  -> CDN-png -> CDN占位 -> 本地占位

未点亮角色：
  sphere:  按 priority 在 small 占位图的 CDN/本地之间切换
  default: 按 priority 在默认占位图的 CDN/本地之间切换
```

### 5.2 简历头像 portraits

用途：角色详情页和 `/resumes/print` 右上角头像。

```text
本地目录：public/images/portraits/
CDN base： https://zhanguo-portraits-1379320306.cos.ap-shanghai.myqcloud.com/
本地默认占位：public/default_general-head.webp
CDN 默认占位：https://zhanguo-portraits-1379320306.cos.ap-shanghai.myqcloud.com/default_general-head.webp
弃用旧名：default_general-portrait.webp（仅作为旧数据兼容哨兵，不再请求旧 CDN 文件）
```

`PortraitImage` 位于 `PortfolioPage.jsx`，候选链由 `buildPortraitCandidates(portrait, priority)` 构造：

```text
local 优先：本地 portrait -> CDN portrait -> 本地默认头像 -> CDN 默认头像
cdn 优先：  CDN portrait -> 本地 portrait -> CDN 默认头像 -> 本地默认头像
默认头像：  按 priority 在 /default_general-head.webp 和 CDN default_general-head.webp 间切换
```

### 5.3 图片优先级

配置文件：

```json
{
  "priority": "local"
}
```

只允许 `"local"` 或 `"cdn"`。`PortfolioPage` 启动时调用 `loadImagePriorityConfig()`，`imagePriority.js` 用 `useSyncExternalStore` 通知图片组件重新渲染。不要删除这个配置、不要扩大取值范围、不要绕过 Hook。

新增或替换图片时：

- 全身立绘放 `public/images/heroes/{code}_{name}.webp` 和 `{code}_{name}-small.webp`。
- 简历头像放 `public/images/portraits/{portrait 文件名}`，文件名必须与 `characterResumes.js` 一致。
- 不要把运行时图片放到 `src/assets/` 用 import 引入，避免 Vite 把资源打进 JS 或导致包体失控。

### 5.4 CDN 防盗链

所有托管到腾讯云 COS CDN 的图片（heroes 真实图、heroes 占位图、portraits 头像、portraits 默认占位）都已开启防盗链（Referer 校验）：

```text
Referer 白名单：*.pages.dev, *.cnb.run, 127.0.0.1, localhost
空 Referer：    拒绝
```

含义与影响：

- 仅允许上述域名/主机通过浏览器直接加载 CDN 图片。Cloudflare Pages 部署域名（`*.pages.dev`）和 CNB 预览域名（`*.cnb.run`）在白名单内；本地开发（`127.0.0.1`、`localhost`）也在白名单内。
- 空 Referer（直接打开图片 URL、非浏览器客户端、或被剥离 Referer 的请求）会被拒绝，返回 403。
- 如果新增部署域名（例如自定义域名、其他预览平台），必须先在腾讯云 COS 防盗链白名单加入该域名，否则 CDN 图片会加载失败并一路兜底到本地资源。
- 本地优先（`priority: local`）模式下不依赖 CDN Referer，可绕过防盗链；CDN 优先或本地资源缺失触发 CDN 兜底时才受防盗链约束。

## 6. 页面专项约束

### 6.1 首页球形卡牌云

关键文件：`src/components/SphereCardCloud.jsx`、`src/App.css` 的 `.sphere-cloud...`。

- 采样最多 28 个角色。
- 使用斐波那契球面点位 + `requestAnimationFrame` 自动旋转。
- 渲染方式是 2D 投影：CSS 变量控制 `left/top + calc(50% + dx/dy)`。
- 不要重新引入 CSS 3D transform / `preserve-3d` / `translate3d` 球体方案；这是为规避 iOS Safari CSS 3D 问题。
- 浅色主题只改变舷窗外的舱室区域；舷窗内太空仍保持深色。
- 舷窗内人名在浅色主题下仍应是白色，国家名保留阵营色。

### 6.2 立绘赏析页

关键位置：`PortfolioPage.jsx` 中 `activeTab === 'art'` 分支。

- 精选角色来自 `FEATURED_CHARACTER_NAMES`。
- 精选卡牌文字只显示国家和姓名；不要无需求恢复第三行 `item.note`。
- 浅色主题下卡牌底部有暖光渐变，小标签和文字要保持足够对比。

### 6.3 角色简历页

关键位置：`PortfolioPage.jsx` 中 `activeTab === 'resume'` 分支。

三个视图：

- `/resumes`：阵营筛选 + 角色卡牌网格，数据来自 `CHARACTER_RESUMES`。
- `/resumes/:pinyin`：单个角色详情。
- `/resumes/print`：批量 A4 打印预览。

详情内容复用组件是 `CharacterResumeContent`。三个板块标题不要随意改：

```text
人物简介
人物能力
人物履历
```

能力区：

- 左侧 `RadarChart`，右侧五维理由。
- 点亮角色显示具体数值、雷达多边形和理由。
- 未点亮角色显示问号雷达图；理由区域为空态。
- 雷达图五个顶点有白色圆点。
- 改 `RadarChart` 或 `.radar-axis` 时必须关注打印预览轴线粗细。

履历区：

- 点亮角色展示数据源中的真实 `timeline`。
- 未点亮角色（`lit: false`）改用占位时间线 `UNLIT_PLACEHOLDER_TIMELINE`（出生 / 史书留名 / 死亡，年份均为占位 `前xxx年`），不展示真实履历。
- 占位逻辑在 `CharacterResumeContent` 内，详情页和 `/resumes/print` 共用，改一处即两处生效。
- `year` 字段：具体年份带"年"（如 `前355年`），时段标签 `战国中后期` 不带"年"。

### 6.4 `/resumes/print` 批量打印

用途：一次渲染 266 个角色简历，由用户在浏览器打印并另存 PDF。不使用 Playwright、Puppeteer、Chromium 或仓库脚本导出。

关键文件：

```text
PortfolioPage.jsx
  CharacterResumePrintPage
  CharacterResumeContent

App.css
  .resume-print-mode
  .resume-print-view
  .resume-print-shell
  .resume-print-page
  .resume-print-theme-toggle
  @media print

print.md
```

屏幕预览：

- 根节点加 `resume-print-mode`。
- 底部导航、返回按钮、页面噪点隐藏。
- 每个角色是独立 `.resume-print-page`，看起来像 A4 纸张。
- 右上角 `resume-print-theme-toggle` 只用于预览，打印时隐藏。

打印规则：

- `@page { size: A4 portrait; margin: 10mm; }`
- `html`、`body`、`#root`、`.page-shell`、`.resume-print-mode`、`.main-area` 在 `@media print` 中必须放开 `height` 和 `overflow`，否则 Chrome/Edge 可能只识别 `total: 1 page`。
- `.resume-print-page` 使用 `break-after: page` / `page-break-after: always`，最后一页取消强制分页。
- 打印时隐藏底部导航、返回按钮、普通主题按钮、打印主题按钮、详情页操作区。
- 深色/浅色主题都应进入打印输出；需要浏览器开启 background graphics。

改打印布局后必须检查：预览页数不是 1 page、分页正常、背景保留、雷达轴线一致、隐藏按钮不入 PDF。

### 6.5 深浅主题

主题状态在 `PortfolioPage.jsx`：

```js
const [theme, setTheme] = useState('dark');
```

根节点类名：

```text
page-shell theme-dark
page-shell theme-light
resume-print-mode（仅 /resumes/print）
```

规则：

- 默认深色。
- 浅色覆盖必须写在 `.theme-light ...` 下，不要做全局浅色覆盖。
- 首页舷窗内部太空不随浅色主题变亮。
- 浅色主题下筛选 active、标签、卡牌文字要保持对比，避免浅黄字配浅黄底。
- `/resumes/print` 深色和浅色预览都要可用。

### 6.6 样式与响应式

主样式在 `src/App.css`，断点大致是 `1180px`、`860px`、`560px`。

改 UI 后至少考虑：

- 桌面宽屏、平板、中等宽度、手机。
- 深色主题和浅色主题。
- 角色详情和 `/resumes/print` 的打印样式。

设计边界：

- 不要引入路由库，除非用户明确要求。
- 不要把页面做成过度嵌套卡片。
- 不要用大段说明性文字解释功能，页面应直接展示内容。
- 图标优先用 `lucide-react`，已有自定义 SVG（如主题切换、社交图标）可保留。
- `/resumes/print` 屏幕预览应像逐页 PDF，而不是普通长网页。

## 7. 常见任务修改清单

### 7.1 修改某个角色简历

优先改 `src/data/characterResumes.js`，按 `name` 或 `id` 搜索目标角色。

常改字段：

```text
bio
stats
statsReason
timeline
portrait
lit
```

只修履历、简介、能力理由时，通常不需要改组件。

### 7.2 点亮一个角色

确认资源：

- `public/images/heroes/{code}_{name}.webp`
- `public/images/heroes/{code}_{name}-small.webp`
- `public/images/portraits/{portrait 文件名}`

修改：

```text
src/data/whitelist.toml
src/data/characterResumes.js
```

简历中点亮状态应为：

```js
lit: true,
portrait: '真实文件名.webp',
stats: { ... },
statsReason: { ... }
```

未点亮角色保持默认头像和 `stats: null`，不要删除简介和履历（履历虽在数据源中保留，但运行时不展示，改用占位时间线，见 4.2 / 6.3）。

点亮白名单编辑方式（`src/data/whitelist.toml`）：

- 文件为 TOML 格式，分两个区域：顶部「快速全开区」+ 下方「各阵营详细列表」。
- 顶部「快速全开区」：7 行被注释的紧凑数组，每行一个阵营的全部人名。默认注释，不影响点亮。
- 下方「各阵营详细列表」：所有 266 人按阵营逐行列出，已点亮角色正常列在数组内，未点亮角色以 `#  "人名",` 注释形式保留。
- 精细控制（默认）：启用下方详细列表，顶部全开区保持注释。点亮某角色：删去该行行首 `#  `。
- 一键全开：取消顶部 7 行注释（删去行首 `# `），并把下方各阵营详细列表整段注释掉。两组互斥使用，切换时各自的点亮状态都被保留。
- 加载逻辑在 `src/utils/portfolio.js`：用 `smol-toml` 解析，`#` 注释会被 TOML 解析器自动忽略，扁平化所有非注释数组值进点亮集合。注意同一 key 不能同时出现两次，故两组必须互斥（一组启用、另一组注释）。
- 不要把白名单改回 JSON：TOML 的注释能力是该项目刻意选择的，JSON 无法支持注释。

### 7.3 新增角色

通常同步：

```text
src/data/portfolioData.js
src/data/characterResumes.js
src/data/characterSlugs.js
src/data/whitelist.toml（如果已点亮）
```

若已点亮，还要添加 heroes 和 portrait 图片。旧来源资料可同步 `assets/heroes-*.js`，但运行时主要依赖上面四处。

### 7.4 修改角色 URL

优先看：

```text
src/data/characterSlugs.js
src/utils/routes.js
```

注意：

- `/resumes/print` 是保留路径。
- slug 应稳定，不要改成运行时生成。
- 如需兼容旧链接，在 `resolveRoute()` 增加兼容逻辑。

### 7.5 修改首页球形云

优先看：

```text
src/components/SphereCardCloud.jsx
src/App.css 中 .sphere-cloud... 区块
```

只改采样、布局、视觉层；不要回退到 CSS 3D 球体方案。

### 7.6 修改主题

优先看：

```text
PortfolioPage.jsx 中 theme / ThemeToggleIcon
App.css 中 .theme-light 区块
```

检查项：

- 舷窗外部是否变浅。
- 舷窗内部太空是否仍深色。
- 舷窗内部人名是否仍白色。
- 筛选按钮 active 状态是否有足够对比。
- 赏析页和简历卡牌底部光照是否自然。
- `/resumes/print` 深色/浅色预览是否正常。

### 7.7 修改 PDF 输出

优先看：

```text
PortfolioPage.jsx 的 CharacterResumePrintPage / CharacterResumeContent
App.css 的 .resume-print... 和 @media print
print.md
```

不要把网页端单个角色详情页打印按钮加回来，除非用户明确要求。

检查项：

- `/resumes/print` 屏幕预览仍是逐页 A4。
- 深色/浅色主题可切换。
- 打印时导航、返回按钮、主题按钮隐藏。
- Chrome/Edge 打印预览页数不是 `total: 1 page`。
- 雷达图轴线清晰一致。
- 必要时提醒用户开启 background graphics。

### 7.8 切换图片加载优先级

改：

```text
public/images/image-priority.json
```

只允许：

```json
{ "priority": "local" }
```

或：

```json
{ "priority": "cdn" }
```

相关实现：

```text
src/utils/imagePriority.js
src/utils/portfolio.js 的 buildImageCandidates()
src/utils/characterResume.js 的 buildPortraitCandidates()
```

不要删除订阅逻辑，否则优先级切换不会触发图片组件重试。

## 8. 外部依赖

| 依赖 | 用途 |
|---|---|
| `react` / `react-dom` | UI |
| `vite` | 开发和构建 |
| `tailwindcss` / `@tailwindcss/vite` | Tailwind v4 |
| `lucide-react` | UI 图标 |
| `gh-pages` | GitHub Pages deploy 脚本 |
| 腾讯云 COS | 图片 CDN 兜底 |
| Cloudflare Pages | 主要部署平台 |
| Google Fonts | 标题和正文字体 |

当前没有 Playwright、Puppeteer、Chromium 依赖。PDF 导出走浏览器人工打印，不走仓库脚本。

## 9. Agent 工作方式

建议先读：

```text
AGENTS.md
src/pages/PortfolioPage.jsx 的相关组件片段
src/App.css 的相关样式片段
src/utils/routes.js（涉及 URL / 深链接）
src/utils/imagePriority.js（涉及图片优先级）
src/data/characterSlugs.js（涉及角色详情 URL）
src/data/characterResumes.js 中目标角色附近数据（涉及人物内容）
print.md（涉及 PDF 导出）
```

不要一开始全量读取：

```text
src/data/characterResumes.js（除非任务要求批量处理）
public/images/
assets/images/
assets_heroes/images/
assets/heroes-*.js
dist/
node_modules/
```

修改后至少运行：

```bash
npm run build
```

视觉任务最好启动或沿用：

```bash
npm run dev
```

并检查对应 URL、深浅主题、响应式宽度、图片加载、本地/CDN 兜底、`/resumes/print` 预览和浏览器打印预览。
