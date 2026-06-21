import { useSyncExternalStore } from 'react';

const CONFIG_URL = `${import.meta.env.BASE_URL}images/image-priority.json`;

let currentPriority = 'local';
const listeners = new Set();

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot() {
  return currentPriority;
}

/** 获取当前图片加载优先级（非 Hook 场景使用）。 */
export function getImagePriority() {
  return currentPriority;
}

/** 直接设置优先级（编程方式切换，主要用于测试）。 */
export function setImagePriority(priority) {
  if (priority !== 'local' && priority !== 'cdn') return;
  if (priority === currentPriority) return;
  currentPriority = priority;
  listeners.forEach((fn) => fn(currentPriority));
}

/** React Hook：订阅图片优先级变化，优先级切换时自动重新渲染。 */
export function useImagePriority() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'local');
}

/** 从 public/images/image-priority.json 异步加载优先级配置。 */
export async function loadImagePriorityConfig() {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (res.ok) {
      const config = await res.json();
      if (config.priority === 'local' || config.priority === 'cdn') {
        setImagePriority(config.priority);
      }
    }
  } catch {
    // 配置加载失败，保持默认 local 优先
  }
}
