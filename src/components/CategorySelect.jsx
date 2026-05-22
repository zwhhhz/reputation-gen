import { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * 品类选择器组件
 * @param {{ value: number|null, onChange: (id: number|null) => void }} props
 */
function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data || []);
    }).catch(() => {
      setCategories([]);
    });
  }, []);

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">选择品类</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
      >
        <option value="">请选择品类</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategorySelect;
