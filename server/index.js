import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, default as db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

async function startServer() {
  // 初始化数据库
  await initDatabase();

  // 数据库初始化后，再动态导入路由（确保 db 已就绪）
  const { default: categoriesRouter } = await import('./routes/categories.js');
  const { default: productsRouter } = await import('./routes/products.js');
  const { default: methodologiesRouter } = await import('./routes/methodologies.js');
  const { default: generateRouter } = await import('./routes/generate.js');
  const { default: feedbackRouter } = await import('./routes/feedback.js');
  const { default: linkResolveRouter } = await import('./routes/link-resolve.js');

  const app = express();

  /** 中间件 */
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /** 静态文件：上传目录 */
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  /** API 路由 */
  app.use('/api/categories', categoriesRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/methodologies', methodologiesRouter);
  app.use('/api/generate', generateRouter);
  app.use('/api/feedbacks', feedbackRouter);
  app.use('/api/generate', linkResolveRouter);

  /** 前端构建后的静态文件服务（生产模式） */
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  /** SPA fallback：所有非 API 路由返回 index.html */
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  /** 启动服务 */
  app.listen(PORT, () => {
    console.log(`[ReputationGen] Server running at http://localhost:${PORT}`);
  });

  /** 优雅关闭：保存数据库 */
  process.on('SIGINT', () => {
    db.close();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    db.close();
    process.exit(0);
  });
}

startServer().catch((err) => {
  console.error('[ReputationGen] 启动失败:', err);
  process.exit(1);
});
