import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function AdminPanelScreen({ navigation }: any) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.myOrders(token), api.catalog(token)])
      .then(([orders, products]) => {
        setOrderCount(orders.length);
        setProductCount(products.length);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: 50 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Panel de Gestión</Text>

      {loading ? (
        <ActivityIndicator color="#2f6b45" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{orderCount}</Text>
            <Text style={styles.statLabel}>Pedidos totales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{productCount}</Text>
            <Text style={styles.statLabel}>Productos activos</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.itemTitle}>📦 Todos los pedidos</Text>
        <Text style={styles.itemDesc}>Ver los pedidos de todos los clientes, con su desglose de bandejas/unidades.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Catalog')}>
        <Text style={styles.itemTitle}>🌿 Catálogo completo</Text>
        <Text style={styles.itemDesc}>Ver todos los productos con los tres precios (Bazar/Garden/Mayorista).</Text>
      </TouchableOpacity>

      <View style={[styles.item, styles.itemDisabled]}>
        <Text style={styles.itemTitle}>✏️ Editar productos y precios</Text>
        <Text style={styles.itemDesc}>Próximamente — todavía se gestiona desde el panel antiguo.</Text>
      </View>

      <View style={[styles.item, styles.itemDisabled]}>
        <Text style={styles.itemTitle}>👥 Gestión de clientes y zonas</Text>
        <Text style={styles.itemDesc}>Próximamente — todavía se gestiona desde el panel antiguo.</Text>
      </View>

      <View style={[styles.item, styles.itemDisabled]}>
        <Text style={styles.itemTitle}>🔄 Cambiar estado de un pedido</Text>
        <Text style={styles.itemDesc}>Próximamente.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { color: '#2f6b45', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 26, fontWeight: '700', color: '#2f6b45' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  item: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 12 },
  itemDisabled: { opacity: 0.5 },
  itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  itemDesc: { fontSize: 12, color: '#888' },
});
