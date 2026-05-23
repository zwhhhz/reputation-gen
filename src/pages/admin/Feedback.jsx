import { useEffect, useState } from 'react';
import api from '../../api/client';
import { getMockFeedbacks, getMockCategories } from '../../api/mock';
import { PLATFORM_LABELS, formatDate } from '../../lib/utils';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCopyId, setSelectedCopyId] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const loadFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data || []);
      setIsDemo(false);
    } catch {
      const mock = getMockFeedbacks();
      setFeedbacks(mock.data || []);
      setIsDemo(true);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmitFeedback = async (copyId) => {
    if (!feedbackText.trim()) return;
    try {
      await api.post('/feedbacks', { copy_id: copyId, feedback_text: feedbackText.trim() });
      setFeedbackText('');
      setSelectedCopyId(null);
      loadFeedbacks();
    } catch (err) {
      setError(err.message || '提交反馈失败');
    }
  };

  const handleApplyFeedback = async (id) => {
    if (!window.confirm('应用此反馈将触发 AI 重新学习并生成新文案，是否继续？')) return;
    setApplyingId(id);
    try {
      await api.post(`/feedbacks/${id}/apply`);
      loadFeedbacks();
    } catch (err) {
      setError(err.message || '应用反馈失败');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">文案反馈</h2>

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

      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          暂无反馈记录
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white rounded-xl border border-gray-200 p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {PLATFORM_LABELS[fb.platform] || fb.platform}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{fb.product_name}</span>
                    <span className="text-xs text-gray-400">{formatDate(fb.created_at)}</span>
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 mb-2">
                    {fb.copy_content}
                  </div>
                  <div className="text-sm text-orange-700 bg-orange-50 rounded-lg p-3">
                    <span className="font-medium">反馈：</span>{fb.feedback_text}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs px-2 py-0.5 rounded ${fb.applied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {fb.applied ? '已应用' : '待应用'}
                </span>
                {!fb.applied && !isDemo && (
                  <button
                    onClick={() => handleApplyFeedback(fb.id)}
                    disabled={applyingId === fb.id}
                    className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {applyingId === fb.id ? '应用中...' : '应用反馈'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feedback;
