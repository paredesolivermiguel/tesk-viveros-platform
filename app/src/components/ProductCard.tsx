import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { normalizeTrayUnits } from '../trays';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  imageUrl: string | null;
  trayEnabled: boolean;
  unitsPerTray: number;
  isOffer: boolean;
  isNew: boolean;
  price: number | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addOrUpdate, remove, items } = useCart();
  const inCart = items.find((i) => i.productId === product.id);
  const [unitsInput, setUnitsInput] = useState(String(inCart?.units ?? 0));
  const [traysInput, setTraysInput] = useState(String(inCart?.trays ?? 0));

  const norm = normalizeTrayUnits(Number(unitsInput) || 0, Number(traysInput) || 0, product.unitsPerTray);

  function apply() {
    if (norm.totalUnits === 0) {
      remove(product.id);
      return;
    }
    addOrUpdate({
      productId: product.id,
      name: product.name,
      unitsPerTray: product.unitsPerTray,
      trayEnabled: product.trayEnabled,
      price: product.price ?? 0,
      units: product.trayEnabled ? norm.looseUnits : norm.totalUnits,
      trays: product.trayEnabled ? norm.trays : 0,
    });
    setUnitsInput(String(product.trayEnabled ? norm.looseUnits : norm.totalUnits));
    setTraysInput(String(product.trayEnabled ? norm.trays : 0));
  }

  return (
    <View style={styles.card}>
      {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : null}
      <View style={styles.badges}>
        {product.isNew ? <Text style={[styles.badge, styles.badgeNew]}>NOVEDAD</Text> : <View />}
        {product.isOffer ? <Text style={[styles.badge, styles.badgeOffer]}>OFERTA</Text> : <View />}
      </View>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price != null ? `${product.price.toFixed(2)} €/ud.` : 'Sin precio'}</Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Unidades sueltas</Text>
          <TextInput
            style={styles.qtyInput}
            keyboardType="number-pad"
            value={unitsInput}
            onChangeText={setUnitsInput}
          />
        </View>
        {product.trayEnabled ? (
          <View style={styles.field}>
            <Text style={styles.label}>Bandejas ({product.unitsPerTray} ud.)</Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={traysInput}
              onChangeText={setTraysInput}
            />
          </View>
        ) : null}
      </View>

      {product.trayEnabled && norm.totalUnits > 0 ? (
        <Text style={styles.summary}>
          {norm.trays} bandejas × {product.unitsPerTray} = {norm.trays * product.unitsPerTray} ud. +{' '}
          {norm.looseUnits} sueltas = {norm.totalUnits} unidades en total
        </Text>
      ) : null}

      <TouchableOpacity style={styles.addButton} onPress={apply}>
        <Text style={styles.addButtonText}>{norm.totalUnits === 0 ? 'Quitar del carrito' : 'Actualizar carrito'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#eee' },
  image: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8, backgroundColor: '#f2f2f2' },
  badges: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  badge: { fontSize: 11, fontWeight: '700', color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  badgeNew: { backgroundColor: '#1d4ed8' },
  badgeOffer: { backgroundColor: '#d9480f' },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  price: { fontSize: 14, color: '#2f6b45', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  label: { fontSize: 11, color: '#666', marginBottom: 4 },
  qtyInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, fontSize: 14 },
  summary: { fontSize: 12, color: '#2f6b45', fontWeight: '600', marginTop: 8 },
  addButton: { backgroundColor: '#2f6b45', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
