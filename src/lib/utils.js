/** 平台标签映射 */
export const PLATFORM_LABELS = {
  xiaohongshu: '小红书',
  bilibili: 'B站',
  douyin: '抖音',
};

/** 平台列表 */
export const PLATFORMS = ['xiaohongshu', 'bilibili', 'douyin'];

/** 平台颜色映射 */
export const PLATFORM_COLORS = {
  xiaohongshu: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-300', active: 'bg-red-500 text-white' },
  bilibili: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-300', active: 'bg-blue-500 text-white' },
  douyin: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300', active: 'bg-gray-800 text-white' },
};

/** 一键复制到剪贴板 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  }
}

/** 格式化日期 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
