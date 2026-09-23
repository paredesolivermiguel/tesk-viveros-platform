import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { priceLabel, Product } from '../components/ProductCard';

export default function ProductDetailScreen({ route, navigation }: any) {
  const product: Product = route.params.product;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: 50 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver al catálogo</Text>
      </TouchableOpacity>

      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
      ) : null}

      <View style={styles.badges}>
        {product.isNew ? <Text style={[styles.badge, styles.badgeNew]}>NOVEDAD</Text> : null}
        {product.isOffer ? <Text style={[styles.badge, styles.badgeOffer]}>OFERTA</Text> : null}
      </View>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{priceLabel(product)}</Text>

      <View style={styles.careRow}>
        {product.sunInfo ? <Text style={styles.careText}>☀️ {product.sunInfo}</Text> : null}
        {product.waterInfo ? <Text style={styles.careText}>💧 {product.waterInfo}</Text> : null}
      </View>

      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

      {product.trayEnabled ? (
        <Text style={styles.trayNote}>Este producto se vende en bandejas de {product.unitsPerTray} unidades (o sueltas).</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { color: '#2f6b45', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  image: { width: '100%', height: 320, borderRadius: 12, backgroundColor: '#f2f2f2', marginBottom: 16 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { fontSize: 12, fontWeight: '700', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  badgeNew: { backgroundColor: '#1d4ed8' },
  badgeOffer: { backgroundColor: '#d9480f' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  price: { fontSize: 16, color: '#2f6b45', fontWeight: '600', marginBottom: 10 },
  careRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  careText: { fontSize: 14, color: '#555' },
  description: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 16 },
  trayNote: { fontSize: 13, color: '#666', fontStyle: 'italic' },
});
