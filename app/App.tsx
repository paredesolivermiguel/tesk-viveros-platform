import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import LoginScreen from './src/screens/LoginScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';

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
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
