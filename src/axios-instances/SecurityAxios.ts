import axios from 'axios';

const securityAxios = axios.create({
  baseURL: '/api/bff',
  timeout: 50000,
  headers: { 'X-Estore-CSRF': '1' },
});
securityAxios.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && typeof window !== 'undefined'
      && !error.config?.url?.includes('/login') && !error.config?.url?.includes('/staff-login')) {
    window.dispatchEvent(new Event('estore:session-expired'));
  }
  return Promise.reject(error);
});
export default securityAxios;
