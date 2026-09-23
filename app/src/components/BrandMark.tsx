import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Icono de marca: circulo verde con un brote, para que el interfaz
 * "se reconozca" al abrir la app (mismo estilo que la web de
 * viverossimonharo.es). Powered by TESK queda solo como texto
 * pequeno, nunca como logo destacado.
 */
export default function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.5 }}>🌱</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1.5,
    borderColor: '#2f6b45',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
