import { useSyncExternalStore } from 'react';

const CONFIG_URL = `${import.meta.env.BASE_URL}nav-visibility.json`;

// 默认全部可见；配置加载失败或缺少字段时回退到此默认值
const DEFAULT_VISIBILITY = {
  art: true,
  resume: true,
  slg: true,
  arpg: true,
};

let currentVisibility = { ...DEFAULT_VISIBILITY };
const listeners = new Set();

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot() {
  return currentVisibility;
}

/** 获取当前导航可见性映射（非 Hook 场景使用）。 */
export function getNavVisibility() {
  return currentVisibility;
}

/** 判断某个 tab 是否在底部导航可见。缺省视为可见。 */
export function isNavTabVisible(tabKey) {
  return currentVisibility[tabKey] !== false;
}

/** 直接设置可见性（编程方式切换，主要用于测试）。 */
export function setNavVisibility(visibility) {
  const next = {
    art: visibility.art !== false,
    resume: visibility.resume !== false,
    slg: visibility.slg !== false,
    arpg: visibility.arpg !== false,
  };
  if (
    next.art === currentVisibility.art &&
    next.resume === currentVisibility.resume &&
    next.slg === currentVisibility.slg &&
    next.arpg === currentVisibility.arpg
  ) {
    return;
  }
  currentVisibility = next;
  listeners.forEach((fn) => fn(currentVisibility));
}

/** React Hook：订阅导航可见性变化，配置切换时自动重新渲染。 */
export function useNavVisibility() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_VISIBILITY);
}

/** 从 public/nav-visibility.json 异步加载可见性配置。 */
export async function loadNavVisibilityConfig() {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (res.ok) {
      const config = await res.json();
      setNavVisibility({
        art: config.art !== false,
        resume: config.resume !== false,
        slg: config.slg !== false,
        arpg: config.arpg !== false,
      });
    }
  } catch {
    // 配置加载失败，保持默认全部可见
  }
}
