import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BrandMark from '../components/BrandMark';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenidos a Viveros Simón Haro</Text>

      <View style={styles.card}>
        <BrandMark size={72} />
        <Text style={styles.subtitle}>SISTEMA DE GESTIÓN ONLINE</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Acceder al área de cliente →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Powered by TESK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#333', marginBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderTopWidth: 3,
    borderTopColor: '#2f6b45',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  subtitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: '#8a9a7a', marginTop: 18, marginBottom: 28 },
  button: { backgroundColor: '#2f6b45', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  footer: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 24 },
});
