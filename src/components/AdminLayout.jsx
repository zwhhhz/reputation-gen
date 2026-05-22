import { Outlet, Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/categories', label: '品类管理', icon: '📁' },
  { path: '/admin/products', label: '产品管理', icon: '📦' },
  { path: '/admin/methodologies', label: '方法论管理', icon: '📖' },
  { path: '/admin/feedback', label: '文案反馈', icon: '💬' },
];

function AdminLayout() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-60 bg-gray-900 text-white flex-shrink-0">
        <div className="p-4 border-b border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-lg">ReputationGen</span>
          </Link>
        </div>
        <nav className="mt-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4">
          <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← 返回前台
          </Link>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-800">后台管理</h1>
        </header>
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
