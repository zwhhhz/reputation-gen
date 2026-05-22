import * as cheerio from 'cheerio';

/**
 * 抓取链接页面内容，解析 HTML 提取文本
 * @param {string} url - 目标链接
 * @returns {Promise<string>} 提取的文本内容
 */
export async function resolveLink(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    timeout: 15000,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 移除不需要的标签
  $('script, style, noscript, iframe, nav, footer, header').remove();

  // 提取文本内容
  const text = $('body').text() || $('main').text() || $.root().text();

  // 清理空白字符
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return cleanedText;
}
