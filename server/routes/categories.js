import { Router } from 'express';
import db from '../db.js';

const router = Router();

/** 获取所有品类 */
router.get('/', (_req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY created_at DESC').all();
    res.json({ code: 0, message: 'success', data: categories });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 新建品类 */
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ code: 10001, message: '品类名称不能为空', data: null });
    }
    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name.trim());
    if (existing) {
      return res.status(400).json({ code: 10001, message: '品类名称已存在', data: null });
    }
    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name.trim(), description || '');
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.json({ code: 0, message: 'success', data: category });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 编辑品类 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 10001, message: '品类不存在', data: null });
    }
    db.prepare('UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name?.trim() || existing.name, description ?? existing.description, id);
    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json({ code: 0, message: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 删除品类 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 10001, message: '品类不存在', data: null });
    }
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ code: 0, message: 'success', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

export default router;
