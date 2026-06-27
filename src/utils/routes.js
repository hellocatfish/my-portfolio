import { CHARACTER_NAME_SLUGS } from '../data/characterSlugs.js';

export const TAB_PATHS = {
  home: '/',
  art: '/appreciations',
  resume: '/resumes',
  resumePrint: '/resumes/print',
  arpg: '/arpg',
  slg: '/slg',
};

const RESUME_STATE_KEYS = new Set(['chu', 'han', 'qi', 'qin', 'wei', 'yan', 'zhao']);

const PATH_TABS = {
  appreciations: 'art',
  resumes: 'resume',
  arpg: 'arpg',
  slg: 'slg',
};

function normalizePathname(pathname = '/') {
  const cleanPath = pathname.replace(/\/+$/, '');
  return cleanPath || '/';
}

function toNameSlug(name) {
  return CHARACTER_NAME_SLUGS[name] ?? '';
}

export function buildResumeRouteMaps(resumes) {
  return resumes.reduce(
    (maps, resume) => {
      const slug = toNameSlug(resume.name) || resume.id.toLowerCase();

      maps.idToSlug.set(resume.id, slug);
      maps.slugToId.set(slug, resume.id);

      return maps;
    },
    { idToSlug: new Map(), slugToId: new Map() },
  );
}

export function resolveRoute(pathname, resumeSlugToId) {
  const path = normalizePathname(pathname);

  if (path === '/') {
    return { tab: 'home', selectedResumeId: null, selectedAppreciationCode: null, appreciationStateKey: null };
  }

  const segments = path.split('/').filter(Boolean);
  const [section, detailSlug, subDetail] = segments;
  const tab = PATH_TABS[section] ?? 'home';

  if (tab === 'art') {
    if (detailSlug === 'state') {
      return {
        tab: 'art',
        selectedResumeId: null,
        selectedAppreciationCode: null,
        appreciationStateKey: subDetail ?? 'all',
        printMode: false,
      };
    }

    return {
      tab: 'art',
      selectedResumeId: null,
      selectedAppreciationCode: detailSlug ?? null,
      appreciationStateKey: null,
      printMode: false,
    };
  }

  if (tab !== 'resume') {
    return {
      tab,
      selectedResumeId: null,
      selectedAppreciationCode: null,
      appreciationStateKey: null,
      printMode: false,
    };
  }

  if (detailSlug === 'print') {
    return {
      tab: 'resume',
      selectedResumeId: null,
      selectedAppreciationCode: null,
      appreciationStateKey: null,
      printMode: true,
    };
  }

  // 阵营筛选：/resumes/chu 或 /resumes/chu/chuhuaiwang
  if (detailSlug && RESUME_STATE_KEYS.has(detailSlug)) {
    return {
      tab: 'resume',
      selectedResumeId: subDetail ? resumeSlugToId.get(subDetail) ?? null : null,
      selectedAppreciationCode: null,
      appreciationStateKey: null,
      resumeStateKey: detailSlug,
      printMode: false,
    };
  }

  return {
    tab: 'resume',
    selectedResumeId: detailSlug ? resumeSlugToId.get(detailSlug) ?? null : null,
    selectedAppreciationCode: null,
    appreciationStateKey: null,
    printMode: false,
  };
}

export function getTabPath(tabKey) {
  return TAB_PATHS[tabKey] ?? TAB_PATHS.home;
}

export function getResumePath(resume, resumeIdToSlug, stateKey) {
  const slug = resumeIdToSlug.get(resume.id);
  if (!slug) return TAB_PATHS.resume;
  if (stateKey && stateKey !== 'all') {
    return `${TAB_PATHS.resume}/${stateKey}/${slug}`;
  }
  return `${TAB_PATHS.resume}/${slug}`;
}

export function getResumeStatePath(stateKey) {
  return stateKey && stateKey !== 'all' ? `${TAB_PATHS.resume}/${stateKey}` : TAB_PATHS.resume;
}

export function getAppreciationPath(character) {
  return character?.code ? `${TAB_PATHS.art}/${character.code}` : TAB_PATHS.art;
}

export function getAppreciationStatePath(stateKey) {
  return stateKey && stateKey !== 'all' ? `${TAB_PATHS.art}/state/${stateKey}` : TAB_PATHS.art;
}
