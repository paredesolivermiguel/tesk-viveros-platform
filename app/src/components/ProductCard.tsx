import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Keyboard } from 'react-native';
import { normalizeTrayUnits } from '../trays';
import { useCart } from '../context/CartContext';

export interface ProductPrice { profile: string; price: number }

export interface Product {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  trayEnabled: boolean;
  unitsPerTray: number;
  isOffer: boolean;
  isNew: boolean;
  sunInfo: string | null;
  waterInfo: string | null;
  price: number | null;
  pricesByProfile: ProductPrice[] | null;
}

export function priceLabel(product: Product) {
  if (product.pricesByProfile && product.pricesByProfile.length > 0) {
    return product.pricesByProfile.map((p) => `${p.profile}: ${p.price.toFixed(2)} €`).join('  ·  ');
  }
  return product.price != null ? `${product.price.toFixed(2)} €/ud.` : 'Sin precio para tu perfil';
}

export default function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const { addOrUpdate, remove, items } = useCart();
  const inCart = items.find((i) => i.productId === product.id);
  const [unitsInput, setUnitsInput] = useState(String(inCart?.units ?? 0));
  const [traysInput, setTraysInput] = useState(String(inCart?.trays ?? 0));

  const norm = normalizeTrayUnits(Number(unitsInput) || 0, Number(traysInput) || 0, product.unitsPerTray);
  const yaEnCarrito = !!inCart;

  function apply() {
    Keyboard.dismiss();
    if (norm.totalUnits === 0) {
      if (yaEnCarrito) remove(product.id);
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

  let buttonLabel = 'Añadir al carrito';
  if (norm.totalUnits === 0 && yaEnCarrito) buttonLabel = 'Quitar del carrito';
  else if (norm.totalUnits > 0 && yaEnCarrito) buttonLabel = 'Actualizar carrito';
  else if (norm.totalUnits > 0) buttonLabel = 'Añadir al carrito';

  const buttonDisabled = norm.totalUnits === 0 && !yaEnCarrito;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: '#999' }}>Sin foto</Text>
          </View>
        )}
        <View style={styles.badges}>
          {product.isNew ? <Text style={[styles.badge, styles.badgeNew]}>NOVEDAD</Text> : <View />}
          {product.isOffer ? <Text style={[styles.badge, styles.badgeOffer]}>OFERTA</Text> : <View />}
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.careRow}>
          {product.sunInfo ? <Text style={styles.careText}>☀️ {product.sunInfo}</Text> : null}
          {product.waterInfo ? <Text style={styles.careText}>💧 {product.waterInfo}</Text> : null}
        </View>
        <Text style={styles.price}>{priceLabel(product)}</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Unidades sueltas</Text>
          <TextInput
            style={styles.qtyInput}
            keyboardType="number-pad"
            returnKeyType="done"
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
              returnKeyType="done"
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

      <TouchableOpacity
        style={[styles.addButton, buttonDisabled && styles.addButtonDisabled]}
        onPress={apply}
        disabled={buttonDisabled}
      >
        <Text style={styles.addButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#eee' },
  image: { width: '100%', height: 220, borderRadius: 8, marginBottom: 8, backgroundColor: '#f2f2f2' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  badge: { fontSize: 11, fontWeight: '700', color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  badgeNew: { backgroundColor: '#1d4ed8' },
  badgeOffer: { backgroundColor: '#d9480f' },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  careRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  careText: { fontSize: 12, color: '#666' },
  price: { fontSize: 13, color: '#2f6b45', marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  label: { fontSize: 11, color: '#666', marginBottom: 4 },
  qtyInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, fontSize: 14 },
  summary: { fontSize: 12, color: '#2f6b45', fontWeight: '600', marginTop: 8 },
  addButton: { backgroundColor: '#2f6b45', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
  addButtonDisabled: { backgroundColor: '#bbb' },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
