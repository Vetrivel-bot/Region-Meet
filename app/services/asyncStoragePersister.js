import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 1. Import the ASYNC persister
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * Checks if window.localStorage is available.
 * This is only for the web implementation.
 */
function localStorageAvailable() {
  try {
    if (typeof window === 'undefined') return false;
    return !!window.localStorage;
  } catch {
    return false;
  }
}

/**
 * A storage wrapper for web's localStorage.
 * It mimics the async API of AsyncStorage.
 */
const webStorage = {
  setItem: (key, value) => {
    if (!localStorageAvailable()) return Promise.resolve();
    try {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  getItem: (key) => {
    if (!localStorageAvailable()) return Promise.resolve(null);
    try {
      const v = window.localStorage.getItem(key);
      return Promise.resolve(v);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  removeItem: (key) => {
    if (!localStorageAvailable()) return Promise.resolve();
    try {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};

/**
 * A storage wrapper for React Native's AsyncStorage.
 * It already has the correct async API.
 */
const nativeAsyncStorage = {
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

// Choose the correct storage engine based on the platform
const chosenStorage = Platform.OS === 'web' ? webStorage : nativeAsyncStorage;

// 2. Use the ASYNC creator and 3. EXPORT the correct name
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: chosenStorage,
  // optional: prefix the key to avoid collisions
  key: 'rqe-cache-v1', // bump this when you change serialization format
});
