import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  const payment = { id: "1", title: "NACOS Dues", amount: 5000 };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Payments</Text>
      <Text>
        {payment.title} - ₦{payment.amount}
      </Text>
      <Button
        title="Make Payment"
        onPress={() => navigation.navigate("Payment", { payment })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});
