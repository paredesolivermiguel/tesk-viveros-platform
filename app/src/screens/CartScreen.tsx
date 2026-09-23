import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }: any) {
  const { items, remove } = useCart();

  const total = items.reduce((sum, i) => {
    const totalUnits = i.units + i.trays * i.unitsPerTray;
    return sum + totalUnits * i.price;
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>El carrito esta vacio.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.productId)}
          renderItem={({ item }) => {
            const totalUnits = item.units + item.trays * item.unitsPerTray;
            return (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>
                    {item.trayEnabled ? `${item.trays} bandejas + ${item.units} sueltas = ` : ''}
                    {totalUnits} ud. × {item.price.toFixed(2)} € = {(totalUnits * item.price).toFixed(2)} €
                  </Text>
                </View>
                <TouchableOpacity onPress={() => remove(item.productId)}>
                  <Text style={styles.remove}>Quitar</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.total}>Total: {total.toFixed(2)} €</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, items.length === 0 && styles.disabled]}
          disabled={items.length === 0}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutText}>Finalizar pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  empty: { color: '#999', marginTop: 40, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 15, fontWeight: '600' },
  detail: { fontSize: 12, color: '#666', marginTop: 2 },
  remove: { color: '#d9480f', fontSize: 13 },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  checkoutButton: { backgroundColor: '#2f6b45', padding: 14, borderRadius: 8, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  checkoutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
