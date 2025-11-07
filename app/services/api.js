import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

// --- AXIOS INSTANCE ---
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- TOKEN MANAGEMENT ---
let AUTH_TOKEN = null;
let onUnauthorizedCallback = null;

export const setAuthToken = async (token) => {
  AUTH_TOKEN = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    await AsyncStorage.removeItem('authToken');
  }
};

export const loadAuthToken = async () => {
  const token = await AsyncStorage.getItem('authToken');
  AUTH_TOKEN = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
};

// ✅ set global callback (to redirect to login)
export const setOnUnauthorized = (callback) => {
  onUnauthorizedCallback = callback;
};

// --- INTERCEPTORS ---
api.interceptors.request.use((config) => {
  if (AUTH_TOKEN) config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Something went wrong';

    if (status === 401) {
      console.warn('[API] Unauthorized — clearing token');
      await setAuthToken(null);

      // Notify app to redirect to login
      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback();
      }
    }

    return Promise.reject(new Error(message));
  }
);

// --- AUTH ROUTES ---
export const UserAPI = {
  register: async (fullname, email, password) => {
    const res = await api.post('/auth/register', { fullname, email, password });
    const { token, user } = res.data;
    if (token) await setAuthToken(token);
    return { token, user };
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    if (token) await setAuthToken(token);
    return { token, user };
  },

  logout: async () => {
    await setAuthToken(null);
  },
  me: async (expoPushToken, platform) => {
    const res = await api.post('/auth/profile', { expoPushToken, platform });
    return res.data.user;
  },
};

export default api;
