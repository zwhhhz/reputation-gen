import { Outlet, Link } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-primary-600">ReputationGen</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                文案生成
              </Link>
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                后台管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 页面内容 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          ReputationGen - 口碑评论自动生成系统
        </div>
      </footer>
    </div>
  );
}

export default Layout;
