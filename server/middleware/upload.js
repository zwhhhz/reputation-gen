import multer from 'multer';
import { mkdirSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/** 确保上传目录存在 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
mkdirSync(path.join(UPLOAD_DIR, 'products'), { recursive: true });
mkdirSync(path.join(UPLOAD_DIR, 'methodologies'), { recursive: true });

/** 存储配置 */
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // 根据路由参数判断上传目录
    const basePath = req.baseUrl?.includes('methodologies')
      ? path.join(UPLOAD_DIR, 'methodologies')
      : path.join(UPLOAD_DIR, 'products');
    cb(null, basePath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/** 文件过滤器：仅允许 PDF 和常见文档格式 */
const fileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件格式，仅允许 PDF、Word 和文本文件'), false);
  }
};

/** multer 实例，限制 10MB */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
