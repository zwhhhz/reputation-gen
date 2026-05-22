import { useState } from 'react';
import { copyToClipboard, PLATFORM_LABELS } from '../lib/utils';

/**
 * 文案卡片组件，含一键复制功能
 * @param {{ copy: { id: number, content: string, platform: string }, index: number }} props
 */
function CopyCard({ copy, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(copy.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 card-hover relative group">
      {/* 序号与平台标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
          {index + 1}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          {PLATFORM_LABELS[copy.platform] || copy.platform}
        </span>
      </div>

      {/* 文案内容 */}
      <p className="text-gray-800 leading-relaxed text-sm mb-4 whitespace-pre-wrap">
        {copy.content}
      </p>

      {/* 一键复制按钮 */}
      <button
        onClick={handleCopy}
        className={`copy-btn w-full py-2 rounded-lg text-sm font-medium border transition-all ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300'
        }`}
      >
        {copied ? '✓ 已复制' : '📋 一键复制'}
      </button>
    </div>
  );
}

export default CopyCard;
