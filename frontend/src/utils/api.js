import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Hanya tambahkan token jika bukan endpoint login
//     if (!config.url.includes('/auth/login')) {
//       const token = localStorage.getItem('token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
    
//     // Debug log
//     console.log('Request:', {
//       url: config.url,
//       method: config.method,
//       data: config.data,
//       headers: config.headers
//     });

//     return config;
//   },
//   (error) => {
//     console.error('Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => {
//     console.log('Response:', {
//       status: response.status,
//       data: response.data
//     });
//     return response;
//   },
//   async (error) => {
//     console.error('Response Error:', {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
    
//     if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default api;