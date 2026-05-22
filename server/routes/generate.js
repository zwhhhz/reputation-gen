import { Router } from 'express';
import db from '../db.js';
import { buildPrompt } from '../services/prompt-builder.js';
import { generateCopies } from '../services/ai-service.js';

const router = Router();

/** 生成文案 */
router.post('/', async (req, res) => {
  try {
    const { product_id, platform } = req.body;
    if (!product_id || !platform) {
      return res.status(400).json({ code: 20001, message: '缺少 product_id 或 platform 参数', data: null });
    }
    const validPlatforms = ['xiaohongshu', 'bilibili', 'douyin'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ code: 20001, message: '不支持的平台类型', data: null });
    }
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ code: 10002, message: '产品不存在', data: null });
    }

    // 构建 Prompt
    const prompt = buildPrompt({ product_id, platform });

    // 调用 AI 生成文案
    const copies = await generateCopies(prompt, platform);

    // 存入数据库
    const insertStmt = db.prepare('INSERT INTO generated_copies (product_id, platform, content) VALUES (?, ?, ?)');
    const savedCopies = [];
    for (const copy of copies) {
      const result = insertStmt.run(product_id, platform, copy.content);
      savedCopies.push({ id: Number(result.lastInsertRowid), product_id, platform, content: copy.content });
    }

    res.json({ code: 0, message: 'success', data: savedCopies });
  } catch (err) {
    console.error('[Generate Error]', err.message);
    res.status(500).json({ code: 20001, message: '文案生成失败：' + err.message, data: null });
  }
});

export default router;
