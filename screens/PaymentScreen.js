import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function PaymentScreen({ route, navigation }) {
  const { payment } = route.params;
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

  const handlePayment = async () => {
    if (!cardNumber || !cvv || !expiry) {
      Alert.alert("Error", "Please enter dummy card details.");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      setLoading(false);
      await addDoc(collection(db, "payments"), {
        title: payment.title,
        amount: payment.amount,
        status: "Completed",
        paymentMethod: "Dummy Payment",
        timestamp: new Date(),
      });

      Alert.alert("Success", "Payment simulated successfully!");
      navigation.navigate("History");
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Make Payment</Text>
      <Text>
        {payment.title} - ₦{payment.amount}
      </Text>

      <TextInput
        placeholder="Card Number"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="CVV"
        value={cvv}
        onChangeText={setCvv}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Expiry Date (MM/YY)"
        value={expiry}
        onChangeText={setExpiry}
        keyboardType="numeric"
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Simulate Payment" onPress={handlePayment} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", borderBottomWidth: 1, marginBottom: 10, padding: 8 },
});
