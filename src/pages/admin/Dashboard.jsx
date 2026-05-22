import { useEffect, useState } from 'react';
import api from '../../api/client';

function Dashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    methodologies: 0,
    copies: 0,
    feedbacks: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [catRes, prodRes, methRes, fbRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
          api.get('/methodologies'),
          api.get('/feedbacks'),
        ]);
        setStats({
          categories: (catRes.data || []).length,
          products: (prodRes.data || []).length,
          methodologies: (methRes.data || []).length,
          copies: (fbRes.data || []).reduce((acc, fb) => acc + 1, 0),
          feedbacks: (fbRes.data || []).length,
        });
      } catch {
        // 静默处理
      }
    }
    loadStats();
  }, []);

  const cards = [
    { label: '品类数量', value: stats.categories, icon: '📁', color: 'bg-blue-50 text-blue-700' },
    { label: '产品数量', value: stats.products, icon: '📦', color: 'bg-green-50 text-green-700' },
    { label: '方法论数量', value: stats.methodologies, icon: '📖', color: 'bg-purple-50 text-purple-700' },
    { label: '文案反馈', value: stats.feedbacks, icon: '💬', color: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">仪表盘</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${card.color}`}>
                统计
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">快速开始</h3>
        <div className="text-gray-600 text-sm space-y-2">
          <p>1. 在「品类管理」中创建产品品类</p>
          <p>2. 在「产品管理」中添加产品并上传 PDF 资料</p>
          <p>3. 在「方法论管理」中配置口碑方法论</p>
          <p>4. 回到前台选择产品和平台，一键生成文案</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
