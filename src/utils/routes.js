import { CHARACTER_NAME_SLUGS } from '../data/characterSlugs.js';

export const TAB_PATHS = {
  home: '/',
  art: '/appreciations',
  resume: '/resumes',
  resumePrint: '/resumes/print',
  arpg: '/arpg',
  slg: '/slg',
};

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
    return { tab: 'home', selectedResumeId: null };
  }

  const segments = path.split('/').filter(Boolean);
  const [section, detailSlug] = segments;
  const tab = PATH_TABS[section] ?? 'home';

  if (tab !== 'resume') {
    return { tab, selectedResumeId: null, printMode: false };
  }

  if (detailSlug === 'print') {
    return { tab: 'resume', selectedResumeId: null, printMode: true };
  }

  return {
    tab: 'resume',
    selectedResumeId: detailSlug ? resumeSlugToId.get(detailSlug) ?? null : null,
    printMode: false,
  };
}

export function getTabPath(tabKey) {
  return TAB_PATHS[tabKey] ?? TAB_PATHS.home;
}

export function getResumePath(resume, resumeIdToSlug) {
  const slug = resumeIdToSlug.get(resume.id);
  return slug ? `${TAB_PATHS.resume}/${slug}` : TAB_PATHS.resume;
}
