import { useEffect, useState } from 'react';
import api from '../../api/client';
import { getMockCategories, getMockProducts } from '../../api/mock';
import FileUpload from '../../components/FileUpload';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category_id: '', name: '', description: '' });
  const [error, setError] = useState('');
  const [filesModal, setFilesModal] = useState(null);
  const [productFiles, setProductFiles] = useState([]);
  const [isDemo, setIsDemo] = useState(false);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setIsDemo(false);
    } catch {
      // 降级到模拟数据
      const mockProd = getMockProducts();
      const mockCat = getMockCategories();
      setProducts(mockProd.data || []);
      setCategories(mockCat.data || []);
      setIsDemo(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    if (isDemo) {
      alert('演示模式下不支持此操作，请启动后端服务');
      return;
    }
    setEditingId(null);
    setForm({ category_id: categories[0]?.id || '', name: '', description: '' });
    setShowModal(true);
    setError('');
  };

  const openEdit = (prod) => {
    if (isDemo) return;
    setEditingId(prod.id);
    setForm({ category_id: prod.category_id, name: prod.name, description: prod.description || '' });
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该产品吗？')) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
    } catch (err) {
      setError(err.message || '删除失败');
    }
  };

  const openFiles = async (productId) => {
    if (isDemo) {
      alert('演示模式下不支持此操作');
      return;
    }
    setFilesModal(productId);
    try {
      const res = await api.get(`/products/${productId}/files`);
      setProductFiles(res.data || []);
    } catch {
      setProductFiles([]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!filesModal) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/products/${filesModal}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      openFiles(filesModal);
    } catch (err) {
      setError(err.message || '上传失败');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!filesModal) return;
    try {
      await api.delete(`/products/${filesModal}/files/${fileId}`);
      openFiles(filesModal);
    } catch (err) {
      setError(err.message || '删除失败');
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.name || '-';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">产品管理</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + 新建产品
        </button>
      </div>

      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
          💡 演示模式 — 数据为模拟数据，启动后端后可进行真实操作
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">品类</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">产品名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  暂无产品，请点击上方按钮新建
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{prod.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{getCategoryName(prod.category_id)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{prod.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{prod.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{prod.created_at}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openFiles(prod.id)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      资料
                    </button>
                    <button
                      onClick={() => openEdit(prod)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑产品弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? '编辑产品' : '新建产品'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品类</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                >
                  <option value="">请选择品类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                  {editingId ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 产品资料弹窗 */}
      {filesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">产品资料</h3>
              <button onClick={() => setFilesModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                &times;
              </button>
            </div>
            <FileUpload onUpload={handleFileUpload} />
            <div className="mt-4 space-y-2">
              {productFiles.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">暂无资料</p>
              ) : (
                productFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📄</span>
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.original_name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
