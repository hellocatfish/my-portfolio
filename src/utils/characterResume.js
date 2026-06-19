import { CHARACTER_RESUMES } from '../data/characterResumes.js';

export const PORTRAIT_BASE_URL = 'https://zhanguo-portraits-1379320306.cos.ap-shanghai.myqcloud.com/';
export const DEFAULT_PORTRAIT_FILE = 'default_general-portrait.webp';

const STAT_KEYS = [
  { key: 'wuli', label: '武力' },
  { key: 'tongshuai', label: '统率' },
  { key: 'zhili', label: '智力' },
  { key: 'zhengzhi', label: '政治' },
  { key: 'meili', label: '魅力' },
];

export function getPortraitUrl(portrait = DEFAULT_PORTRAIT_FILE) {
  return `${PORTRAIT_BASE_URL}${encodeURIComponent(portrait || DEFAULT_PORTRAIT_FILE)}`;
}

export function buildCharacterResumes() {
  return CHARACTER_RESUMES.map((record) => ({
    ...record,
    portraitUrl: getPortraitUrl(record.portrait),
  }));
}

export function getStatKeys() {
  return STAT_KEYS;
}
