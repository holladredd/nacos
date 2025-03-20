import React from "react";
import { StatusBar, Text, View } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import "./firebaseConfig"; // Ensure Firebase is initialized
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Test App</Text>
        </View> */}
        <UserProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
            translucent={false}
          />
          <AppNavigator />
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
