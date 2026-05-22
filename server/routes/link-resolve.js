import { Router } from 'express';
import db from '../db.js';
import { resolveLink } from '../services/link-resolver.js';
import { buildPrompt } from '../services/prompt-builder.js';
import { generateCopies } from '../services/ai-service.js';

const router = Router();

/** 通过链接生成文案 */
router.post('/by-link', async (req, res) => {
  try {
    const { link, platform } = req.body;
    if (!link?.trim()) {
      return res.status(400).json({ code: 20002, message: '请提供链接', data: null });
    }
    const validPlatforms = ['xiaohongshu', 'bilibili', 'douyin'];
    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({ code: 20001, message: '不支持的平台类型', data: null });
    }

    // 解析链接，提取文本内容
    const pageText = await resolveLink(link.trim());

    // 尝试根据关键词匹配品类/产品
    const categories = db.prepare('SELECT * FROM categories').all();
    const products = db.prepare('SELECT * FROM products').all();

    let matchedProduct = null;
    let matchedCategory = null;

    // 先匹配产品名
    for (const product of products) {
      if (pageText.includes(product.name)) {
        matchedProduct = product;
        matchedCategory = categories.find(c => c.id === product.category_id);
        break;
      }
    }

    // 如果没匹配到产品，尝试匹配品类
    if (!matchedProduct) {
      for (const category of categories) {
        if (pageText.includes(category.name)) {
          matchedCategory = category;
          matchedProduct = products.find(p => p.category_id === category.id);
          break;
        }
      }
    }

    if (!matchedProduct) {
      return res.json({
        code: 20002,
        message: '未能自动匹配到产品，请手动选择品类和产品',
        data: { page_text: pageText.substring(0, 500) },
      });
    }

    // 构建 Prompt 并生成文案
    const prompt = buildPrompt({ product_id: matchedProduct.id, platform });
    const copies = await generateCopies(prompt, platform);

    // 存入数据库
    const insertStmt = db.prepare('INSERT INTO generated_copies (product_id, platform, content) VALUES (?, ?, ?)');
    const savedCopies = [];
    for (const copy of copies) {
      const result = insertStmt.run(matchedProduct.id, platform, copy.content);
      savedCopies.push({ id: Number(result.lastInsertRowid), product_id: matchedProduct.id, platform, content: copy.content });
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        matched_product: matchedProduct,
        matched_category: matchedCategory,
        copies: savedCopies,
      },
    });
  } catch (err) {
    console.error('[Link Resolve Error]', err.message);
    res.status(500).json({ code: 20002, message: '链接解析失败：' + err.message, data: null });
  }
});

export default router;
