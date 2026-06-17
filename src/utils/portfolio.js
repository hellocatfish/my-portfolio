const BASE_IMAGE_URL = 'https://zhanguo-imgs-1379320306.cos.accelerate.myqcloud.com/zhanguo_imgs/';
const IMAGE_EXTENSIONS = ['webp', 'png'];

export function getImageExtensions() {
  return IMAGE_EXTENSIONS;
}

export function buildImageUrl(code, name, extension = IMAGE_EXTENSIONS[0]) {
  return `${BASE_IMAGE_URL}${code}_${encodeURIComponent(name)}.${extension}`;
}

export function buildSmallImageUrl(code, name) {
  return `${BASE_IMAGE_URL}${code}_${encodeURIComponent(name)}-small.webp`;
}

export function buildImageCandidates(code, name, variant = 'default') {
  if (variant === 'sphere') {
    return [
      buildSmallImageUrl(code, name),
      buildImageUrl(code, name, 'webp'),
      buildImageUrl(code, name, 'png'),
    ];
  }

  return IMAGE_EXTENSIONS.map((extension) => buildImageUrl(code, name, extension));
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
