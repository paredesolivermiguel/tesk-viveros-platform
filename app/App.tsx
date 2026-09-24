import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AccountScreen from './src/screens/AccountScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2f6b45" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Catalog" component={CatalogScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

/**
 * Banner de diagnostico temporal: muestra en pantalla, sin necesidad de
 * logs ni cable USB, exactamente que esta pasando con las
 * actualizaciones OTA. Se quitara en cuanto confirmemos que todo
 * funciona.
 */
function UpdateDebugBanner() {
  const [status, setStatus] = useState('Comprobando...');

  useEffect(() => {
    (async () => {
      try {
        const info = [
          `updateId: ${Updates.updateId ?? 'NINGUNO (build nativo)'}`,
          `channel: ${Updates.channel ?? 'desconocido'}`,
          `runtimeVersion: ${Updates.runtimeVersion ?? 'desconocido'}`,
          `isEmbedded: ${Updates.isEmbeddedLaunch}`,
        ].join(' | ');

        const result = await Updates.checkForUpdateAsync();
        const checkInfo = result.isAvailable
          ? `HAY ACTUALIZACION DISPONIBLE (manifest: ${result.manifest ? 'si' : 'no'})`
          : 'No hay actualizacion nueva';

        setStatus(`${info}\n${checkInfo}`);

        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          setStatus((prev) => `${prev}\nDescargada. Reiniciando...`);
          await Updates.reloadAsync();
        }
      } catch (e: any) {
        setStatus((prev) => `${prev}\nERROR: ${e?.message ?? String(e)}`);
      }
    })();
  }, []);

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{status}</Text>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <UpdateDebugBanner />
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#111',
    paddingTop: 40,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  bannerText: { color: '#0f0', fontSize: 10, fontFamily: 'monospace' },
});
