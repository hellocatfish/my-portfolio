import { CHARACTER_RESUMES } from '../data/characterResumes.js';

// 腾讯云 COS 兜底地址
export const PORTRAIT_BASE_URL = 'https://zhanguo-portraits-1379320306.cos.ap-shanghai.myqcloud.com/';
export const DEFAULT_PORTRAIT_FILE = 'default_general-head.webp';
export const LEGACY_DEFAULT_PORTRAIT_FILE = 'default_general-portrait.webp';
export const DEFAULT_PORTRAIT_FILES = new Set([DEFAULT_PORTRAIT_FILE, LEGACY_DEFAULT_PORTRAIT_FILE]);

// 本地前端包内的简历头像目录（通过 vite.config.js 的 localStaticImages 插件在 dev/build 时服务）
const LOCAL_PORTRAIT_DIR = `${import.meta.env.BASE_URL}images/portraits/`;
// 本地默认占位头像（位于 public/，文件名为 default_general-head.webp）
export const LOCAL_DEFAULT_PORTRAIT = `${import.meta.env.BASE_URL}default_general-head.webp`;
export const CDN_DEFAULT_PORTRAIT = `${PORTRAIT_BASE_URL}${DEFAULT_PORTRAIT_FILE}`;

const STAT_KEYS = [
  { key: 'wuli', label: '武力' },
  { key: 'tongshuai', label: '统率' },
  { key: 'zhili', label: '智力' },
  { key: 'zhengzhi', label: '政治' },
  { key: 'meili', label: '魅力' },
];

/**
 * 构造简历头像候选链：根据 priority 排列本地 / CDN 顺序，最终回退到本地默认占位头像。
 * 旧数据里的 default_general-portrait.webp 会映射到新的 default_general-head.webp。
 *
 * @param {'local'|'cdn'} priority - 'local' 本地优先（默认），'cdn' CDN 优先
 */
export function buildPortraitCandidates(portrait = DEFAULT_PORTRAIT_FILE, priority = 'local') {
  const fileName = portrait || DEFAULT_PORTRAIT_FILE;
  const defaultCandidates = priority === 'cdn'
    ? [CDN_DEFAULT_PORTRAIT, LOCAL_DEFAULT_PORTRAIT]
    : [LOCAL_DEFAULT_PORTRAIT, CDN_DEFAULT_PORTRAIT];

  if (DEFAULT_PORTRAIT_FILES.has(fileName)) {
    return defaultCandidates;
  }

  const local = `${LOCAL_PORTRAIT_DIR}${encodeURIComponent(fileName)}`;
  const cdn = `${PORTRAIT_BASE_URL}${encodeURIComponent(fileName)}`;
  return priority === 'cdn'
    ? [cdn, local, ...defaultCandidates]
    : [local, cdn, ...defaultCandidates];
}

export function buildCharacterResumes() {
  return CHARACTER_RESUMES.map((record) => {
    const candidates = buildPortraitCandidates(record.portrait);
    return {
      ...record,
      portraitCandidates: candidates,
      portraitUrl: candidates[0], // 向后兼容：首选（本地）URL
    };
  });
}

export function getStatKeys() {
  return STAT_KEYS;
}
