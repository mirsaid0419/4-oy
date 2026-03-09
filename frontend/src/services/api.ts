import axios from 'axios';
import { encryptData, decryptData } from '../utils/crypto';

export const API_BASE_URL = 'https://kino-time.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to add the bearer token and encrypt payload
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Agar ma'lumot fayl (FormData) yoki multipart bo'lmasa, shifrlaymiz
        if (config.data && !(config.data instanceof FormData)) {
            config.data = { encrypted: encryptData(config.data) };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle unauthorized errors and decrypt data
api.interceptors.response.use(
    (response) => {
        if (response.data && typeof response.data === 'string') {
            const dec = decryptData(response.data);
            // Agar result obyekt bo'lsa uni response.data ga yuklaymiz
            if (dec && typeof dec === 'object') {
                response.data = dec;
            }
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Avoid infinite redirect loop if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
