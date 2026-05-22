import { Router } from 'express';
import db from '../db.js';
import { buildPrompt } from '../services/prompt-builder.js';
import { generateCopies } from '../services/ai-service.js';

const router = Router();

/** 获取反馈列表 */
router.get('/', (_req, res) => {
  try {
    const feedbacks = db.prepare(`
      SELECT cf.*, gc.content AS copy_content, gc.platform, gc.product_id, p.name AS product_name
      FROM copy_feedbacks cf
      JOIN generated_copies gc ON cf.copy_id = gc.id
      JOIN products p ON gc.product_id = p.id
      ORDER BY cf.created_at DESC
    `).all();
    res.json({ code: 0, message: 'success', data: feedbacks });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 提交文案反馈 */
router.post('/', (req, res) => {
  try {
    const { copy_id, feedback_text } = req.body;
    if (!copy_id || !feedback_text?.trim()) {
      return res.status(400).json({ code: 10001, message: '缺少 copy_id 或 feedback_text', data: null });
    }
    const copy = db.prepare('SELECT * FROM generated_copies WHERE id = ?').get(copy_id);
    if (!copy) {
      return res.status(404).json({ code: 10002, message: '文案不存在', data: null });
    }
    const result = db.prepare('INSERT INTO copy_feedbacks (copy_id, feedback_text) VALUES (?, ?)').run(copy_id, feedback_text.trim());
    const feedback = db.prepare('SELECT * FROM copy_feedbacks WHERE id = ?').get(result.lastInsertRowid);
    res.json({ code: 0, message: 'success', data: feedback });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 应用反馈，触发 AI 重新学习并重新生成 */
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = db.prepare('SELECT * FROM copy_feedbacks WHERE id = ?').get(id);
    if (!feedback) {
      return res.status(404).json({ code: 10001, message: '反馈不存在', data: null });
    }

    const copy = db.prepare('SELECT * FROM generated_copies WHERE id = ?').get(feedback.copy_id);
    if (!copy) {
      return res.status(404).json({ code: 10002, message: '关联文案不存在', data: null });
    }

    // 标记反馈为已应用
    db.prepare('UPDATE copy_feedbacks SET applied = 1 WHERE id = ?').run(id);

    // 重新构建 Prompt 并生成文案
    const prompt = buildPrompt({ product_id: copy.product_id, platform: copy.platform });
    const newCopies = await generateCopies(prompt, copy.platform);

    // 存入数据库
    const insertStmt = db.prepare('INSERT INTO generated_copies (product_id, platform, content) VALUES (?, ?, ?)');
    const savedCopies = [];
    for (const c of newCopies) {
      const result = insertStmt.run(copy.product_id, copy.platform, c.content);
      savedCopies.push({ id: Number(result.lastInsertRowid), product_id: copy.product_id, platform: copy.platform, content: c.content });
    }

    res.json({ code: 0, message: 'success', data: savedCopies });
  } catch (err) {
    console.error('[Apply Feedback Error]', err.message);
    res.status(500).json({ code: 20001, message: '应用反馈失败：' + err.message, data: null });
  }
});

export default router;
