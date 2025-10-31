import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { asyncStoragePersister } from './asyncStoragePersister';

// 1. Create the main Query Client
// We set a default "cache time" of 24 hours.
// Data will be considered "stale" after 1 hour.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  },
});

// 2. Persist the client to our AsyncStorage
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  /**
   * We tell it to restore even if we're offline.
   * This is key for offline mode.
   */
  dehydrateOptions: {
    shouldDehydrateQuery: () => true,
  },
});
