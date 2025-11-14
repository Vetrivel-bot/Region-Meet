import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'authToken';
const REFRESH_TOKEN_HEADER = 'x-new-token';

// --- FIXED PORT TO 3000 ---
const DEFAULT_LOCAL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_LOCAL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let AUTH_TOKEN = null;
let onUnauthorizedCallback = null;

export const setOnUnauthorized = (cb) => {
  onUnauthorizedCallback = cb;
};

export const getAuthToken = () => AUTH_TOKEN;

export const setAuthToken = async (token) => {
  AUTH_TOKEN = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, token);
    } catch (e) {
      console.warn('[API] Failed to persist token', e?.message ?? e);
    }
  } else {
    delete api.defaults.headers.common.Authorization;
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[API] Failed to remove token', e?.message ?? e);
    }
  }
};

export const loadAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    AUTH_TOKEN = token;
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return token;
  } catch (e) {
    console.warn('[API] Failed to load token', e?.message ?? e);
    return null;
  }
};

let initializing = false;
export const initApi = async (opts = {}) => {
  if (initializing) return;
  initializing = true;
  await loadAuthToken();
  if (opts.onUnauthorized) setOnUnauthorized(opts.onUnauthorized);
  initializing = false;
};

api.interceptors.request.use((config) => {
  if (AUTH_TOKEN) config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  return config;
});

api.interceptors.response.use(
  async (res) => {
    const newToken = res?.headers?.[REFRESH_TOKEN_HEADER];
    if (newToken) {
      try {
        await setAuthToken(newToken);
        console.log('[API] Received and saved refreshed token');
      } catch (e) {
        console.warn('[API] Could not save refreshed token', e?.message ?? e);
      }
    }
    return res;
  },
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || 'Network error';
    const newToken = error?.response?.headers?.[REFRESH_TOKEN_HEADER];
    if (newToken) {
      try {
        await setAuthToken(newToken);
        console.log('[API] Received refreshed token on error response and saved it');
      } catch (e) {
        console.warn('[API] Failed to save refreshed token from error response', e?.message ?? e);
      }
    }
    if (status === 401) {
      try {
        await setAuthToken(null);
      } catch (e) {
        console.warn('[API] Failed to clear token on 401', e?.message ?? e);
      }
      if (typeof onUnauthorizedCallback === 'function') {
        try {
          onUnauthorizedCallback();
        } catch (e) {
          console.warn('[API] onUnauthorized callback threw', e?.message ?? e);
        }
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const UserAPI = {
  // ... (your existing register, login, logout, me functions)
  register: async (fullname, email, password) => {
    const res = await api.post('/auth/register', { fullname, email, password });
    const { token, user } = res.data || {};
    if (token) await setAuthToken(token);
    return { token, user };
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data || {};
    if (token) await setAuthToken(token);
    return { token, user };
  },

  logout: async () => {
    await setAuthToken(null);
  },

  me: async (expoPushToken, platform, location) => {
    const res = await api.post('/auth/profile', {
      expoPushToken,
      platform,
      location,
    });
    return res.data?.user ?? null;
  },
};

export const LocationAPI = {
  /**
   * --- ADDED THIS FUNCTION ---
   * Fetches both all locations and the user's registered schedule.
   * @returns {Promise<{registeredSchedule: Array, allLocations: Array}>}
   */
  getMapInfo: async () => {
    try {
      const res = await api.get('/locations/map-info');
      // The data is nested under res.data.data
      return res.data?.data ?? { registeredSchedule: [], allLocations: [] };
    } catch (error) {
      console.error('[API] Failed to getMapInfo:', error.message);
      throw error;
    }
  },

  /**
   * Fetches the user's registered location schedule.
   * @returns {Promise<Array>} The schedule array
   */
  getRegisteredLocations: async () => {
    try {
      const res = await api.get('/locations/getregisteredlocations');
      return res.data?.schedule ?? [];
    } catch (error) {
      console.error('[API] Failed to getRegisteredLocations:', error.message);
      throw error;
    }
  },
  /**
   * Fetches the user's registered events schedule.
   * @returns {Promise<Array>} The schedule array
   */
  getRegisteredEvents: async () => {
    try {
      const res = await api.get('/events/getregisteredevents');
      return res.data?.events ?? [];
    } catch (error) {
      console.error('[API] Failed to getregisteredevents:', error.message);
      throw error;
    }
  },
  /**
   * Fetches the user's nearby events location.
   * @returns {Promise<Array>} The location array
   */
  getNearbyLocations: async (location) => {
    try {
      const locationinfo = {
        type: 'Point',
        coordinates: location,
      };
      console.log(locationinfo);

      const res = await api.post('/locations/nearby', {
        location: locationinfo,
      });
      return res?.data ?? [];
    } catch (error) {
      // --- FIXED: Typo in error message ---
      console.error('[API] Failed to getNearbyLocations:', error.message);
      throw error;
    }
  },
};

export default api;
