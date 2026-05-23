import { useState } from 'react';
import CategorySelect from '../components/CategorySelect';
import ProductSelect from '../components/ProductSelect';
import PlatformSelect from '../components/PlatformSelect';
import CopyCard from '../components/CopyCard';
import LinkInput from '../components/LinkInput';
import api from '../api/client';
import { getMockCopies } from '../api/mock';

function Home() {
  const [categoryId, setCategoryId] = useState(null);
  const [productId, setProductId] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  /** 自动生成文案 */
  const handleGenerate = async () => {
    if (!productId || !platform) {
      setError('请先选择品类、产品和平台');
      return;
    }
    setError('');
    setLoading(true);
    setCopies([]);
    setIsDemo(false);
    try {
      const res = await api.post('/generate', { product_id: productId, platform });
      setCopies(res.data || []);
    } catch (err) {
      // 后端不可用时降级到模拟数据
      if (err.message === 'NETWORK_ERROR' || err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        const mock = getMockCopies(platform);
        setCopies(mock.data || []);
        setIsDemo(true);
      } else {
        setError(err.message || '生成失败');
      }
    } finally {
      setLoading(false);
    }
  };

  /** 链接解析生成文案 */
  const handleLinkResolve = async (link, linkPlatform) => {
    setError('');
    setLinkLoading(true);
    setCopies([]);
    setIsDemo(false);
    try {
      const res = await api.post('/generate/by-link', { link, platform: linkPlatform });
      if (res.code === 20002) {
        setError(res.message);
        return;
      }
      setCopies(res.data?.copies || []);
    } catch (err) {
      // 后端不可用时降级到模拟数据
      if (err.message === 'NETWORK_ERROR' || err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        const mock = getMockCopies(linkPlatform);
        setCopies(mock.data || []);
        setIsDemo(true);
      } else {
        setError(err.message || '链接解析失败');
      }
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">口碑评论自动生成</h1>
        <p className="text-gray-500">选择产品与平台，一键生成 5 条真实自然的口碑文案</p>
      </div>

      {/* 演示模式提示 */}
      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
          💡 当前为演示模式（后端未连接），展示的是模拟文案。启动后端后可生成真实 AI 文案。
        </div>
      )}

      {/* 选择区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <CategorySelect value={categoryId} onChange={setCategoryId} />
          <ProductSelect categoryId={categoryId} value={productId} onChange={setProductId} />
          <PlatformSelect value={platform} onChange={setPlatform} />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading || !productId || !platform}
          className="w-full py-3 bg-primary-600 text-white rounded-xl text-lg font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </span>
          ) : '🚀 自动生成'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* 生成结果 */}
      {copies.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">生成结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {copies.map((copy, index) => (
              <CopyCard key={copy.id} copy={copy} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* 分隔线 */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-gray-500">或者</span>
        </div>
      </div>

      {/* 链接解析区 */}
      <LinkInput onResolve={handleLinkResolve} loading={linkLoading} />
    </div>
  );
}

export default Home;
