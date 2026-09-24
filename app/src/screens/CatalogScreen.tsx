import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function CatalogScreen({ navigation }: any) {
  const { token, user, logout } = useAuth();
  const { items } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(
    async (q?: string) => {
      if (!token) return;
      try {
        setError(null);
        const data = await api.catalog(token, q);
        setProducts(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const cartCount = items.length;
  const roleLabel = user?.role === 'gestor' ? 'Gestor' : 'Cliente';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo</Text>
        <Text style={styles.account}>
          {user?.email} · {roleLabel}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.ordersButton}>
            <Text style={styles.ordersButtonText}>{user?.role === 'gestor' ? 'Todos los pedidos' : 'Mis pedidos'}</Text>
          </TouchableOpacity>
          {user?.role === 'gestor' && (
            <TouchableOpacity onPress={() => navigation.navigate('AdminPanel')} style={styles.panelButton}>
              <Text style={styles.panelButtonText}>Panel de Gestión</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Account')}>
            <Text style={styles.accountLink}>Mi cuenta</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Buscar producto..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2f6b45" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 12 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { product: item })} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search || undefined); }} />
          }
          ListEmptyComponent={<Text style={styles.empty}>No se encontraron productos.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.fabText}>🛒 Carrito ({cartCount})</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  account: { fontSize: 12, color: '#888', marginBottom: 10 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 },
  cartButton: { backgroundColor: '#2f6b45', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  cartButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  ordersButton: { paddingHorizontal: 4 },
  ordersButtonText: { color: '#2f6b45', fontWeight: '600', fontSize: 13 },
  logout: { color: '#999', fontSize: 13 },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 14 },
  error: { color: 'red', textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
  empty: { color: '#999', textAlign: 'center', marginTop: 40 },
  panelButton: { backgroundColor: '#1d4ed8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  panelButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  accountLink: { color: '#333', fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: '#2f6b45',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
