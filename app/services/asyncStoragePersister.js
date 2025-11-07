// utils/persister.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

function localStorageAvailable() {
  try {
    if (typeof window === 'undefined') return false;
    return !!window.localStorage;
  } catch {
    return false;
  }
}

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

const nativeAsyncStorage = {
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

const chosenStorage = Platform.OS === 'web' ? webStorage : nativeAsyncStorage;

export const queryPersister = createSyncStoragePersister({
  storage: chosenStorage,
  // optional: prefix the key to avoid collisions
  key: 'rqe-cache-v1', // bump this when you change serialization format
});
