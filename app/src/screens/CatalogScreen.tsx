import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function CatalogScreen({ navigation }: any) {
  const { token, logout } = useAuth();
  const { items } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await api.catalog(token);
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const cartCount = items.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catalogo</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
            <Text style={styles.cartButtonText}>Carrito ({cartCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.ordersButton}>
            <Text style={styles.ordersButtonText}>Mis pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Salir</Text>
          </TouchableOpacity>
        </View>
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
          renderItem={({ item }) => <ProductCard product={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { padding: 16, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cartButton: { backgroundColor: '#2f6b45', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  cartButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  ordersButton: { paddingHorizontal: 4 },
  ordersButtonText: { color: '#2f6b45', fontWeight: '600', fontSize: 13 },
  logout: { color: '#999', fontSize: 13 },
  error: { color: 'red', textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
});
