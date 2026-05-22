import { Router } from 'express';
import db from '../db.js';
import upload from '../middleware/upload.js';
import { parsePdf } from '../services/pdf-parser.js';
import { unlinkSync } from 'fs';

const router = Router();

/** 获取产品列表（可按品类筛选） */
router.get('/', (req, res) => {
  try {
    const { category_id } = req.query;
    let products;
    if (category_id) {
      products = db.prepare('SELECT * FROM products WHERE category_id = ? ORDER BY created_at DESC').all(category_id);
    } else {
      products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    }
    res.json({ code: 0, message: 'success', data: products });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 新建产品 */
router.post('/', (req, res) => {
  try {
    const { category_id, name, description } = req.body;
    if (!category_id || !name?.trim()) {
      return res.status(400).json({ code: 10002, message: '品类ID和产品名称不能为空', data: null });
    }
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(404).json({ code: 10001, message: '品类不存在', data: null });
    }
    const result = db.prepare('INSERT INTO products (category_id, name, description) VALUES (?, ?, ?)')
      .run(category_id, name.trim(), description || '');
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.json({ code: 0, message: 'success', data: product });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 编辑产品 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description } = req.body;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 10002, message: '产品不存在', data: null });
    }
    db.prepare('UPDATE products SET category_id = ?, name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(category_id ?? existing.category_id, name?.trim() || existing.name, description ?? existing.description, id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ code: 0, message: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 删除产品 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ code: 10002, message: '产品不存在', data: null });
    }
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ code: 0, message: 'success', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 上传产品 PDF 资料 */
router.post('/:id/files', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ code: 10002, message: '产品不存在', data: null });
    }
    if (!req.file) {
      return res.status(400).json({ code: 30002, message: '请上传文件', data: null });
    }

    let parsedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        parsedText = await parsePdf(req.file.path);
      } catch (parseErr) {
        console.error('[PDF Parse Error]', parseErr.message);
        parsedText = '';
      }
    }

    const result = db.prepare(
      'INSERT INTO product_files (product_id, filename, original_name, file_path, parsed_text) VALUES (?, ?, ?, ?, ?)'
    ).run(id, req.file.filename, req.file.originalname, req.file.path, parsedText);

    const fileRecord = db.prepare('SELECT * FROM product_files WHERE id = ?').get(result.lastInsertRowid);
    res.json({ code: 0, message: 'success', data: fileRecord });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 获取产品资料列表 */
router.get('/:id/files', (req, res) => {
  try {
    const { id } = req.params;
    const files = db.prepare('SELECT * FROM product_files WHERE product_id = ? ORDER BY uploaded_at DESC').all(id);
    res.json({ code: 0, message: 'success', data: files });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

/** 删除产品资料 */
router.delete('/:id/files/:fileId', (req, res) => {
  try {
    const { id, fileId } = req.params;
    const file = db.prepare('SELECT * FROM product_files WHERE id = ? AND product_id = ?').get(fileId, id);
    if (!file) {
      return res.status(404).json({ code: 30002, message: '文件不存在', data: null });
    }
    try { unlinkSync(file.file_path); } catch (_) { /* ignore */ }
    db.prepare('DELETE FROM product_files WHERE id = ?').run(fileId);
    res.json({ code: 0, message: 'success', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

export default router;
