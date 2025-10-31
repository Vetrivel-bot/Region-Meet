import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Creates a platform-agnostic persister for TanStack Query.
 * - On web, it uses localStorage.
 * - On mobile, it uses AsyncStorage.
 *
 * This is "sync" because that's what the web's localStorage expects,
 * but the adapter handles the async nature of mobile's AsyncStorage.
 */
export const asyncStoragePersister = createSyncStoragePersister({
  storage: {
    setItem: (key, value) => {
      AsyncStorage.setItem(key, value);
    },
    getItem: (key) => {
      // This is a bit of a trick to make async storage work
      // in a sync-first library. This is the recommended pattern.
      // We return the Promise, and TanStack Query handles it.
      return AsyncStorage.getItem(key);
    },
    removeItem: (key) => {
      AsyncStorage.removeItem(key);
    },
  },
});
