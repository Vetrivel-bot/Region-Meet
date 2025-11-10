import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const fetchAgenda = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 1, title: 'Keynote: The Future of AI', time: '9:00 AM' },
          { id: 2, title: 'Workshop: Building with React Native', time: '10:30 AM' },
          { id: 3, title: 'Exhibitor Showcase Opens', time: '12:00 PM' },
        ]),
      1000
    )
  );

function AgendaList() {
  const { data, isLoading, isFetching, status, refetch } = useQuery({
    queryKey: ['agenda'],
    queryFn: fetchAgenda,
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Agenda</Text>
      <Text style={styles.meta}>status: {status}</Text>
      <Text style={styles.meta}>isLoading: {isLoading ? 'true' : 'false'}</Text>
      <Text style={styles.meta}>isFetching: {isFetching ? 'true' : 'false'}</Text>
      <View style={styles.row}>
        <Button title="Refetch (hook)" onPress={() => refetch()} />
      </View>
      <FlatList
        style={{ marginTop: 12 }}
        data={data ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemTime}>{item.time}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No items</Text>}
      />
    </View>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <ControlPanel mounted={mounted} setMounted={setMounted} />
        {mounted ? (
          <AgendaList />
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>Agenda unmounted</Text>
          </View>
        )}
      </SafeAreaView>
    </QueryClientProvider>
  );
}

function ControlPanel({ mounted, setMounted }) {
  const qc = useQueryClient();

  return (
    <View style={styles.controls}>
      <Button
        title={mounted ? 'Unmount Agenda' : 'Mount Agenda'}
        onPress={() => setMounted(!mounted)}
      />
      <Button title="Clear Cache" onPress={() => qc.removeQueries(['agenda'])} />

      <Button title="Invalidate Queries" onPress={() => qc.invalidateQueries(['agenda'])} />
      <Button title="Refetch Queries" onPress={() => qc.refetchQueries(['agenda'])} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginBottom: 12 },
  card: { backgroundColor: '#0f1724', padding: 12, borderRadius: 10 },
  title: { color: '#e6f7f0', fontSize: 18, fontWeight: '700' },
  meta: { color: '#9aa4ae', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  itemTime: { color: '#9aa4ae', fontSize: 12 },
});
