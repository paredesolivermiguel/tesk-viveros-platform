import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

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
      <Text style={styles.title}>TESK</Text>
      <Text style={styles.subtitle}>Viveros Simon Haro</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contrasena"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SetPassword')}>
        <Text style={styles.link}>¿Vienes de la migracion desde WordPress? Establece tu contrasena aqui</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', color: '#2f6b45' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: { backgroundColor: '#2f6b45', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2f6b45', textAlign: 'center', marginTop: 20, fontSize: 13 },
});
