import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';

export default function CheckoutScreen({ navigation }: any) {
  const { token } = useAuth();
  const { items, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'factura' | 'contado'>('contado');
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + (i.units + i.trays * i.unitsPerTray) * i.price, 0);
  const vat = paymentMethod === 'factura' ? subtotal * 0.21 : 0;
  const total = subtotal + vat;

  async function confirm() {
    if (!token) return;
    setLoading(true);
    try {
      await api.createOrder(
        token,
        paymentMethod,
        items.map((i) => ({ productId: i.productId, units: i.units, trays: i.trays })),
      );
      clear();
      Alert.alert('Pedido enviado', 'Tu pedido se ha recibido correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Catalog') },
      ]);
    } catch (e: any) {
      Alert.alert('No se pudo enviar el pedido', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finalizar pedido</Text>

      <Text style={styles.label}>Metodo de pago</Text>
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, paymentMethod === 'contado' && styles.optionActive]}
          onPress={() => setPaymentMethod('contado')}
        >
          <Text style={paymentMethod === 'contado' ? styles.optionTextActive : styles.optionText}>Al contado</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, paymentMethod === 'factura' && styles.optionActive]}
          onPress={() => setPaymentMethod('factura')}
        >
          <Text style={paymentMethod === 'factura' ? styles.optionTextActive : styles.optionText}>Con factura (+IVA)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLine}>Subtotal: {subtotal.toFixed(2)} €</Text>
        <Text style={styles.summaryLine}>IVA (21%): {vat.toFixed(2)} €</Text>
        <Text style={styles.summaryTotal}>Total: {total.toFixed(2)} €</Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={confirm} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirmar pedido</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  options: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  option: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, alignItems: 'center' },
  optionActive: { backgroundColor: '#2f6b45', borderColor: '#2f6b45' },
  optionText: { color: '#333' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  summary: { backgroundColor: '#f7f7f7', borderRadius: 8, padding: 16, marginBottom: 24 },
  summaryLine: { fontSize: 14, color: '#666', marginBottom: 4 },
  summaryTotal: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  confirmButton: { backgroundColor: '#2f6b45', padding: 16, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
