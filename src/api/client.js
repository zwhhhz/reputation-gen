import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 响应拦截器：统一处理错误 */
client.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    // 如果是网络错误（后端未启动 / GitHub Pages 无后端），使用模拟数据
    if (!error.response) {
      return Promise.reject(new Error('NETWORK_ERROR'));
    }
    const message = error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(message));
  }
);

export default client;
