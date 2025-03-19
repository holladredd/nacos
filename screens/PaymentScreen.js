import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function PaymentScreen({ route, navigation }) {
  const { payment } = route.params;
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const { currentUser } = useAuth();

  const handlePayment = async () => {
    if (!cardNumber || !cvv || !expiry) {
      Alert.alert("Error", "Please enter dummy card details.");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        await addDoc(collection(db, "payments"), {
          userId: currentUser.uid,
          title: payment.title,
          amount: payment.amount,
          status: "Completed",
          paymentMethod: "Dummy Payment",
          timestamp: new Date(),
        });

        setLoading(false);
        Alert.alert("Success", "Payment simulated successfully!", [
          { text: "OK", onPress: () => navigation.navigate("History") },
        ]);
      } catch (error) {
        setLoading(false);
        Alert.alert("Error", "Failed to process payment: " + error.message);
      }
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Make Payment</Text>
      <Text style={styles.paymentDetails}>
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
        maxLength={3}
      />
      <TextInput
        placeholder="Expiry Date (MM/YY)"
        value={expiry}
        onChangeText={setExpiry}
        keyboardType="numeric"
        style={styles.input}
        maxLength={5}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Simulate Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paymentDetails: {
    fontSize: 18,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    padding: 15,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
