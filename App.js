import React from "react";
import { StatusBar } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./context/AuthContext";
import "./firebaseConfig"; // Ensure Firebase is initialized
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
