import { useEffect, useState } from 'react';
import api from '../../api/client';
import FileUpload from '../../components/FileUpload';

function Methodologies() {
  const [methodologies, setMethodologies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadMethodologies = async () => {
    try {
      const res = await api.get('/methodologies');
      setMethodologies(res.data || []);
    } catch {
      setError('加载方法论失败');
    }
  };

  useEffect(() => {
    loadMethodologies();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', content: '' });
    setShowModal(true);
    setError('');
  };

  const openEdit = (meth) => {
    setEditingId(meth.id);
    setForm({ title: meth.title, content: meth.content || '' });
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/methodologies/${editingId}`, form);
      } else {
        await api.post('/methodologies', form);
      }
      setShowModal(false);
      loadMethodologies();
    } catch (err) {
      setError(err.message || '操作失败');
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    try {
      await api.post('/methodologies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadMethodologies();
    } catch (err) {
      setError(err.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该方法论吗？')) return;
    try {
      await api.delete(`/methodologies/${id}`);
      loadMethodologies();
    } catch (err) {
      setError(err.message || '删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">方法论管理</h2>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + 新建方法论
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* 上传区域 */}
      <div className="mb-6">
        <FileUpload onUpload={handleUpload} loading={uploading} />
      </div>

      {/* 方法论列表 */}
      <div className="space-y-4">
        {methodologies.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            暂无方法论，请上传文档或新建
          </div>
        ) : (
          methodologies.map((meth) => (
            <div key={meth.id} className="bg-white rounded-xl border border-gray-200 p-5 card-hover">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{meth.title}</h3>
                  <span className="text-xs text-gray-400">v{meth.version} · {meth.created_at}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openEdit(meth)}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(meth.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{meth.content || '暂无内容'}</p>
            </div>
          ))
        )}
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? '编辑方法论' : '新建方法论'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
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
    </div>
  );
}

export default Methodologies;
