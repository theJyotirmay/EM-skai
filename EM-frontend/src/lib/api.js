import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://em-skai-1.onrender.com/api',
});

export default api;
