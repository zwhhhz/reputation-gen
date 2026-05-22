import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import Methodologies from './pages/admin/Methodologies';
import Feedback from './pages/admin/Feedback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 前台路由 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* 后台路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="methodologies" element={<Methodologies />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
