import fs from 'fs';
import path from 'path';

/**
 * 解析 PDF 文件，提取文本内容
 * @param {string} filePath - PDF 文件的绝对路径
 * @returns {Promise<string>} 提取的文本内容
 */
export async function parsePdf(filePath) {
  // 动态导入 pdf-parse，避免顶层加载问题
  const pdfParse = (await import('pdf-parse')).default;

  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  return data.text || '';
}
