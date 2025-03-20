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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function PaymentScreen({ route, navigation }) {
  const { payment } = route.params;
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const { currentUser } = useAuth();

  const formatCardNumber = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add slash after first 2 digits
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryChange = (text) => {
    setExpiry(formatExpiry(text));
  };

  const validateInputs = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Error", "Please enter a valid card number.");
      return false;
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert("Error", "Please enter a valid CVV.");
      return false;
    }

    if (!expiry || expiry.length < 5) {
      Alert.alert("Error", "Please enter a valid expiry date (MM/YY).");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    const paymentData = {
      id: Date.now().toString(), // Temporary ID until we get the actual doc ID
      userId: currentUser.uid,
      title: payment.title,
      amount: payment.amount,
      status: "Completed",
      paymentMethod: "Card Payment",
      cardLast4: cardNumber.slice(-4),
      timestamp: new Date(),
    };

    setTimeout(async () => {
      try {
        // Add payment record to Firestore
        await addDoc(collection(db, "payments"), {
          userId: currentUser.uid,
          title: payment.title,
          amount: payment.amount,
          status: "Completed",
          paymentMethod: "Card Payment",
          cardLast4: cardNumber.slice(-4),
          timestamp: serverTimestamp(),
        });

        setLoading(false);
        Alert.alert("Success", "Payment processed successfully!", [
          {
            text: "View Receipt",
            onPress: () =>
              navigation.navigate("PaymentDetails", { payment: paymentData }),
          },
          {
            text: "OK",
            onPress: () => navigation.navigate("Main", { screen: "History" }),
          },
        ]);
      } catch (error) {
        setLoading(false);
        Alert.alert("Error", "Failed to process payment: " + error.message);
      }
    }, 2000); // Simulate payment processing
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Make Payment</Text>

      <View style={styles.paymentDetails}>
        <Text style={styles.paymentTitle}>{payment.title}</Text>
        <Text style={styles.paymentAmount}>₦{payment.amount}</Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>Card Details</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            style={styles.input}
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              placeholder="MM/YY"
              value={expiry}
              onChangeText={handleExpiryChange}
              keyboardType="numeric"
              style={styles.input}
              maxLength={5}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              style={styles.input}
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Process Payment</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.secureNote}>
        This is a simulated payment. No actual charges will be made.
      </Text>
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
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  paymentTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
  },
  cardContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secureNote: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 12,
  },
});
