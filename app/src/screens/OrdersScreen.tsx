import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .myOrders(token)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#2f6b45" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis pedidos</Text>
      {orders.length === 0 ? (
        <Text style={styles.empty}>Todavia no has hecho ningun pedido.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderId}>Pedido #{item.id}</Text>
              <Text style={styles.status}>{item.status}</Text>
              {item.items.map((li: any) => (
                <Text key={li.id} style={styles.line}>
                  {li.product?.name ?? `Producto ${li.productId}`} — {li.trays > 0 ? `${li.trays} bandejas / ` : ''}
                  {li.looseUnits} sueltas = {li.totalUnits} ud.
                </Text>
              ))}
              <Text style={styles.total}>Total: {Number(item.totalAmount).toFixed(2)} €</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  empty: { color: '#999', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#f7f7f7', borderRadius: 8, padding: 14, marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: '700' },
  status: { fontSize: 12, color: '#2f6b45', fontWeight: '600', marginBottom: 6 },
  line: { fontSize: 12, color: '#555' },
  total: { fontSize: 14, fontWeight: '700', marginTop: 8 },
});
