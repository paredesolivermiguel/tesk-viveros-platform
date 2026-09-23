import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';

export default function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const roleLabel = user?.role === 'gestor' ? 'Gestor / Administrador' : 'Cliente';
  const profileLabel =
    user?.priceProfileId === 1 ? 'Bazar' : user?.priceProfileId === 2 ? 'Garden' : user?.priceProfileId === 3 ? 'Mayorista' : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: 50 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <BrandMark size={64} />
        <Text style={styles.title}>Mi cuenta</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de cuenta</Text>
          <Text style={styles.value}>{roleLabel}</Text>
        </View>
        {user?.role !== 'gestor' && (
          <View style={styles.row}>
            <Text style={styles.label}>Perfil de precio</Text>
            <Text style={styles.value}>{profileLabel}</Text>
          </View>
        )}
      </View>

      {user?.role === 'gestor' && (
        <TouchableOpacity style={styles.panelButton} onPress={() => navigation.navigate('AdminPanel')}>
          <Text style={styles.panelButtonText}>Ir al Panel de Gestión</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Powered by TESK</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { color: '#2f6b45', fontSize: 14, fontWeight: '600', marginBottom: 20 },
  headerCenter: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  label: { fontSize: 13, color: '#888' },
  value: { fontSize: 14, fontWeight: '600', color: '#333' },
  panelButton: { backgroundColor: '#1d4ed8', borderRadius: 24, padding: 14, alignItems: 'center', marginBottom: 12 },
  panelButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  logoutButton: { borderWidth: 1, borderColor: '#d9480f', borderRadius: 24, padding: 14, alignItems: 'center' },
  logoutText: { color: '#d9480f', fontWeight: '600', fontSize: 15 },
  footer: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 30 },
});
