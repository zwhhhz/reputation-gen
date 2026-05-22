import { Router } from 'express';
import db from '../db.js';
import upload from '../middleware/upload.js';
import { unlinkSync } from 'fs';

const router = Router();

/** 获取方法论列表 */
router.get('/', (_req, res) => {
  try {
    const methodologies = db.prepare('SELECT * FROM methodologies ORDER BY created_at DESC').all();
    res.json({ code: 0, message: 'success', data: methodologies });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 新建/上传方法论 */
router.post('/', upload.single('file'), (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ code: 10001, message: '方法论标题不能为空', data: null });
    }
    const filePath = req.file ? req.file.path : null;
    const result = db.prepare('INSERT INTO methodologies (title, content, file_path) VALUES (?, ?, ?)')
      .run(title.trim(), content || '', filePath);
    const methodology = db.prepare('SELECT * FROM methodologies WHERE id = ?').get(result.lastInsertRowid);
    res.json({ code: 0, message: 'success', data: methodology });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 编辑方法论 */
router.put('/:id', upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const existing = db.prepare('SELECT * FROM methodologies WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 10001, message: '方法论不存在', data: null });
    }
    const filePath = req.file ? req.file.path : existing.file_path;
    db.prepare('UPDATE methodologies SET title = ?, content = ?, file_path = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(title?.trim() || existing.title, content ?? existing.content, filePath, id);
    const updated = db.prepare('SELECT * FROM methodologies WHERE id = ?').get(id);
    res.json({ code: 0, message: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 删除方法论 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM methodologies WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 10001, message: '方法论不存在', data: null });
    }
    if (existing.file_path) {
      try { unlinkSync(existing.file_path); } catch (_) { /* ignore */ }
    }
    db.prepare('DELETE FROM methodologies WHERE id = ?').run(id);
    res.json({ code: 0, message: 'success', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

export default router;
