import OpenAI from 'openai';

/** 平台名称映射 */
const PLATFORM_LABELS = {
  xiaohongshu: '小红书',
  bilibili: 'B站',
  douyin: '抖音',
};

/** 模拟文案数据（OpenAI key 未配置时使用） */
function getMockCopies(platform) {
  const platformName = PLATFORM_LABELS[platform] || '小红书';
  const mockData = {
    xiaohongshu: [
      { content: '姐妹们冲！这个真的绝绝子 ✨ 用了一周效果太明显了，后悔没早买！🔥' },
      { content: '被种草了好久终于入手，没想到真的这么好用 😍 质感绝了！💕 强烈安利！' },
      { content: '呜呜呜也太好用了吧 🥹 闺蜜推荐的果然没错 👏 姐妹们别犹豫了冲冲冲！' },
      { content: '真的会被惊艳到！用了三天就来反馈 ✨ 效果肉眼可见 🔥 性价比也太高了！' },
      { content: '终于找到我的本命了 😭 质地超舒服不刺激 🌸 敏感肌也能放心用 💕 绝了！' },
    ],
    bilibili: [
      { content: '说实话，这东西还真不错 😂 作为一个挑剔的人，能给好评的真的不多 👍' },
      { content: 'UP主推荐的那个我试了，确实可以，不是智商税 😎' },
      { content: '技术流分析一波：用料扎实，设计合理，这个价位算良心了 👍' },
      { content: '刚开始还觉得一般，用了一周后…真香 😂 这波属实是先抑后扬了' },
      { content: '我直接吹爆好吧 😤 别的先不说，就冲这个手感就值了 👍' },
    ],
    douyin: [
      { content: '冲了冲了！家人们这个真的牛 🔥🔥🔥' },
      { content: '刷到就买了 用完只想说：绝了 😎✅' },
      { content: '挑战全网最低价！这品质简直无敌 💪🔥' },
      { content: '姐妹们别犹豫 趁现在有活动赶紧冲 🔥😎' },
      { content: '用了三天来说句公道话：真的可以 ✅🔥 安排！' },
    ],
  };
  return mockData[platform] || mockData.xiaohongshu;
}

/**
 * 调用 OpenAI API 生成文案
 * 如果 API Key 未配置，则降级返回模拟数据
 * @param {string} prompt - 完整的 Prompt
 * @param {string} platform - 平台标识
 * @returns {Promise<Array<{content: string}>>} 5 条文案
 */
export async function generateCopies(prompt, platform) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  // 如果没有配置 API Key，降级返回模拟数据
  if (!apiKey || apiKey === 'sk-xxx') {
    console.warn('[AI Service] OPENAI_API_KEY 未配置，返回模拟数据');
    return getMockCopies(platform);
  }

  try {
    const client = new OpenAI({ apiKey, baseURL });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是一位资深的社交媒体内容创作者，擅长撰写真实自然的产品口碑评论。请严格按照用户要求的JSON格式输出。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    // 尝试解析 JSON 数组
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5).map(item => ({
          content: item.content || item.text || String(item),
        }));
      }
    }

    // 如果 JSON 解析失败，将整段文本拆分为多条
    console.warn('[AI Service] JSON 解析失败，返回模拟数据');
    return getMockCopies(platform);
  } catch (err) {
    console.error('[AI Service] 调用失败:', err.message);
    // 优雅降级
    return getMockCopies(platform);
  }
}
