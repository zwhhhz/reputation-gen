import { useState } from 'react';

/**
 * 链接输入组件
 * @param {{ onResolve: (link: string, platform: string) => void, loading: boolean }} props
 */
function LinkInput({ onResolve, loading }) {
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState('xiaohongshu');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (link.trim()) {
      onResolve(link.trim(), platform);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-3">🔗 链接解析</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="粘贴产品链接（如淘宝、京东、小红书等）"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
        />
        <div className="flex items-center space-x-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          >
            <option value="xiaohongshu">小红书</option>
            <option value="bilibili">B站</option>
            <option value="douyin">抖音</option>
          </select>
          <button
            type="submit"
            disabled={loading || !link.trim()}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? '解析中...' : '解析并生成'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LinkInput;
