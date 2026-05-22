import db from '../db.js';

/** 平台风格参数配置 */
const PLATFORM_CONFIG = {
  xiaohongshu: {
    name: '小红书',
    emoji_rules: '丰富，3-5 个 emoji，如 ✨🔥💕👏🥰',
    length_range: '50-200 字',
    style: '种草感强、感叹号多、"绝绝子"风格，像闺蜜推荐',
  },
  bilibili: {
    name: 'B站',
    emoji_rules: '适中，1-2 个 emoji，如 😂👍',
    length_range: '30-150 字',
    style: '技术流、梗多、吐槽风，有弹幕感',
  },
  douyin: {
    name: '抖音',
    emoji_rules: '适中，2-3 个 emoji，如 🔥😎✅',
    length_range: '20-100 字',
    style: '短平快、跟风、挑战感，口语化',
  },
};

/**
 * 根据产品ID和平台构建完整的 AI Prompt
 * @param {{ product_id: number, platform: string }} params
 * @returns {string} 完整的 Prompt 字符串
 */
export function buildPrompt({ product_id, platform }) {
  // 查询产品信息
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) {
    throw new Error('产品不存在');
  }

  // 查询产品的所有 PDF 解析文本
  const productFiles = db.prepare('SELECT parsed_text FROM product_files WHERE product_id = ?').all(product_id);
  const parsedPdfText = productFiles
    .map(f => f.parsed_text)
    .filter(t => t && t.trim() !== '')
    .join('\n---\n') || '暂无产品资料';

  // 查询最新的方法论内容
  const latestMethodology = db.prepare('SELECT content FROM methodologies ORDER BY updated_at DESC LIMIT 1').get();
  const methodologyContent = latestMethodology?.content || '暂无方法论';

  // 从 bili_comments 随机取 5 条优质评论作为样本
  const biliComments = db.prepare('SELECT content, likes FROM bili_comments ORDER BY RANDOM() LIMIT 5').all();
  const biliCommentSamples = biliComments.length > 0
    ? biliComments.map((c, i) => `${i + 1}. ${c.content}（👍${c.likes}）`).join('\n')
    : '暂无样本评论';

  // 查询该产品相关的未应用反馈修正
  const feedbacks = db.prepare(`
    SELECT cf.feedback_text
    FROM copy_feedbacks cf
    JOIN generated_copies gc ON cf.copy_id = gc.id
    WHERE gc.product_id = ? AND cf.applied = 0
    ORDER BY cf.created_at DESC
    LIMIT 10
  `).all(product_id);
  const feedbackCorrections = feedbacks.length > 0
    ? feedbacks.map((f, i) => `${i + 1}. ${f.feedback_text}`).join('\n')
    : '暂无反馈修正';

  // 获取平台配置
  const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.xiaohongshu;

  // 组装完整 Prompt
  const prompt = `【系统指令】
你是一位资深的社交媒体内容创作者，擅长撰写真实自然的产品口碑评论。

【口碑方法论】
${methodologyContent}

【产品信息】
产品名称：${product.name}
产品描述：${product.description || '暂无描述'}
产品资料摘要：
${parsedPdfText}

【平台风格指南】
平台：${platformConfig.name}
语气风格：${platformConfig.style}
Emoji 规则：${platformConfig.emoji_rules}
文案长度：${platformConfig.length_range}

【B站优质评论样本】
${biliCommentSamples}

【用户反馈修正】
${feedbackCorrections}

【生成要求】
请生成 5 条${platformConfig.name}风格的口碑评论文案。要求：
1. 语气真实自然，像真人写的，不要有明显的 AI 痕迹
2. 可以包含适当的 emoji 表情（${platformConfig.emoji_rules}）
3. 文案长度控制在${platformConfig.length_range}
4. 内容要基于产品资料中的真实卖点，不要编造功能
5. 每条评论风格要有差异化，不要千篇一律

输出格式：JSON 数组，每项包含 content 字段，如：
[{"content": "第一条文案"}, {"content": "第二条文案"}, {"content": "第三条文案"}, {"content": "第四条文案"}, {"content": "第五条文案"}]`;

  return prompt;
}
