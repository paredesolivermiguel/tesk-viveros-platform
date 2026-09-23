import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SetPasswordScreen({ navigation }: any) {
  const { setPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await setPassword(email.trim(), newPassword);
    } catch (e: any) {
      Alert.alert('No se pudo establecer', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Establecer contrasena</Text>
      <Text style={styles.subtitle}>
        Tu cuenta viene de la migracion desde el sistema antiguo y todavia no tiene una contrasena
        nueva. Escribe tu email y elige una contrasena (minimo 8 caracteres).
      </Text>

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
        placeholder="Nueva contrasena"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar y entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#2f6b45' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginVertical: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2f6b45', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2f6b45', textAlign: 'center', marginTop: 20, fontSize: 13 },
});
