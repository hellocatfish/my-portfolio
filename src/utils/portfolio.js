import whitelist from '../data/whitelist.json';

// 本地前端包内的全身立绘目录（通过 vite.config.js 的 localStaticImages 插件在 dev/build 时服务）
const LOCAL_BASE_IMAGE_URL = `${import.meta.env.BASE_URL}images/heroes/`;
// 腾讯云 COS 兜底地址
const CDN_BASE_IMAGE_URL = 'https://zhanguo-imgs-1379320306.cos.accelerate.myqcloud.com/zhanguo_imgs/';
const IMAGE_EXTENSIONS = ['webp', 'png'];

/** 缺省占位形象（金色线描武将 webp），随构建发布于 public/ 下，首屏后即缓存复用。 */
export const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}placeholder-general.webp`;

/** 由 whitelist.json 汇总出的「已点亮」人名集合（忽略以 _ 开头的注释字段）。 */
const LIT_NAMES = new Set(
  Object.entries(whitelist)
    .filter(([key]) => !key.startsWith('_'))
    .flatMap(([, names]) => names),
);

/** 人名是否已点亮：点亮则展示真实立绘，否则使用缺省占位 SVG。 */
export function isCharacterLit(name) {
  return LIT_NAMES.has(name);
}

export function getImageExtensions() {
  return IMAGE_EXTENSIONS;
}

/** 构造本地全身立绘 URL（主路径）。 */
export function buildImageUrl(code, name, extension = 'webp') {
  return `${LOCAL_BASE_IMAGE_URL}${code}_${encodeURIComponent(name)}.${extension}`;
}

/** 构造本地缩略图 URL（主路径，用于球形卡牌云）。 */
export function buildSmallImageUrl(code, name) {
  return `${LOCAL_BASE_IMAGE_URL}${code}_${encodeURIComponent(name)}-small.webp`;
}

/** 构造 COS CDN 全身立绘 URL（兜底路径）。 */
function buildCdnImageUrl(code, name, extension = 'webp') {
  return `${CDN_BASE_IMAGE_URL}${code}_${encodeURIComponent(name)}.${extension}`;
}

/** 构造 COS CDN 缩略图 URL（兜底路径）。 */
function buildCdnSmallImageUrl(code, name) {
  return `${CDN_BASE_IMAGE_URL}${code}_${encodeURIComponent(name)}-small.webp`;
}

/**
 * 构造图片候选链：根据 priority 排列本地 / CDN 顺序，最终回退到占位图。
 * 本地只有 webp 格式，png 仅走 CDN。
 *
 * @param {'local'|'cdn'} priority - 'local' 本地优先（默认），'cdn' CDN 优先
 */
export function buildImageCandidates(code, name, variant = 'default', priority = 'local') {
  const localSmall = buildSmallImageUrl(code, name);
  const cdnSmall = buildCdnSmallImageUrl(code, name);
  const localWebp = buildImageUrl(code, name, 'webp');
  const cdnWebp = buildCdnImageUrl(code, name, 'webp');
  const cdnPng = buildCdnImageUrl(code, name, 'png');

  if (variant === 'sphere') {
    return priority === 'cdn'
      ? [cdnSmall, localSmall, cdnWebp, localWebp, cdnPng, PLACEHOLDER_IMAGE]
      : [localSmall, cdnSmall, localWebp, cdnWebp, cdnPng, PLACEHOLDER_IMAGE];
  }

  return priority === 'cdn'
    ? [cdnWebp, localWebp, cdnPng, PLACEHOLDER_IMAGE]
    : [localWebp, cdnWebp, cdnPng, PLACEHOLDER_IMAGE];
}

export function buildCharacters(states) {
  return states.slice(1).flatMap((state) =>
    state.names.map(({ code, name }) => ({
      id: `${code}_${name}`,
      code,
      name,
      stateKey: state.key,
      stateLabel: `${state.label}国`,
      tone: state.tone,
      note: `${state.tone}`,
    })),
  );
}

export function buildMetrics(states, featuredCount) {
  const totalCharacters = states.slice(1).reduce((sum, state) => sum + state.names.length, 0);
  const totalStates = states.length - 1;

  return [
    { label: '原创角色', value: String(totalCharacters), note: '覆盖君王、文臣、武将' },
    { label: '阵营档案', value: String(totalStates), note: '按七国的阵营色归档' },
    { label: '精选展陈', value: String(featuredCount), note: '七国人物风采切片' },
  ];
}

export function getStateCharacterCount(states, stateKey) {
  if (stateKey === 'all') {
    return states.slice(1).reduce((sum, state) => sum + state.names.length, 0);
  }

  return states.find((state) => state.key === stateKey)?.names.length ?? 0;
}
