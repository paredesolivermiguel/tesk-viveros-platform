import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      Alert.alert('No se pudo entrar', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceder</Text>

      <View style={styles.card}>
        <BrandMark size={56} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Acceso</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SetPassword')}>
          <Text style={styles.link}>¿Vienes de la migración? Establece tu contraseña aquí</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Powered by TESK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '600', textAlign: 'center', color: '#333', marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderTopWidth: 3,
    borderTopColor: '#2f6b45',
    borderRadius: 16,
    padding: 24,
  },
  label: { fontSize: 13, color: '#2f6b45', marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#2f6b45', borderRadius: 24, padding: 14, alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2f6b45', textAlign: 'center', marginTop: 18, fontSize: 12 },
  footer: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 24 },
});
