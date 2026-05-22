import { useRef, useState } from 'react';

/**
 * 文件上传组件
 * @param {{ onUpload: (file: File) => void, accept?: string, loading?: boolean }} props
 */
function FileUpload({ onUpload, accept = '.pdf,.doc,.docx,.txt', loading = false }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // 重置 input 以便再次选择同一文件
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-gray-400 text-3xl mb-2">📁</div>
      <p className="text-sm text-gray-500">
        {loading ? '上传中...' : '点击或拖拽文件到此处上传'}
      </p>
      <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、文本文件，最大 10MB</p>
    </div>
  );
}

export default FileUpload;
