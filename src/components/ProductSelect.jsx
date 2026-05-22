import { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * 产品选择器组件，根据品类联动
 * @param {{ categoryId: number|null, value: number|null, onChange: (id: number|null) => void }} props
 */
function ProductSelect({ categoryId, value, onChange }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      onChange(null);
      return;
    }
    api.get('/products', { params: { category_id: categoryId } }).then((res) => {
      setProducts(res.data || []);
      onChange(null);
    }).catch(() => {
      setProducts([]);
      onChange(null);
    });
  }, [categoryId]);

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">选择产品</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={!categoryId}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{categoryId ? '请选择产品' : '请先选择品类'}</option>
        {products.map((prod) => (
          <option key={prod.id} value={prod.id}>
            {prod.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProductSelect;
