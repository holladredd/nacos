import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HistoryScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      if (!currentUser || !currentUser.uid) {
        console.error("User not authenticated");
        setPayments([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "payments"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const paymentsList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Safely handle missing fields with default values
        paymentsList.push({
          id: doc.id,
          title: data.title || "Unknown Payment",
          amount: data.amount || 0,
          status: data.status || "Unknown",
          paymentMethod: data.paymentMethod || "Unknown Method",
          cardLast4: data.cardLast4 || "",
          // Safely convert timestamp or use current date as fallback
          timestamp: data.timestamp
            ? typeof data.timestamp.toDate === "function"
              ? data.timestamp.toDate()
              : new Date()
            : new Date(),
          // Include any additional data needed for the details screen
          reference: data.reference || "",
          email: data.email || "",
          description: data.description || "",
        });
      });

      setPayments(paymentsList);
    } catch (error) {
      console.error("Error fetching payments:", error);
      // Show a more specific error message based on the error
      if (error.code === "permission-denied") {
        console.error("Permission denied. Check Firestore rules.");
      } else if (error.code === "not-found") {
        console.error("Payments collection not found.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePaymentPress = (payment) => {
    navigation.navigate("PaymentDetails", { payment });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentTitle}>{item.title}</Text>
        <Text
          style={[
            styles.paymentStatus,
            item.status === "Completed"
              ? styles.statusCompleted
              : styles.statusPending,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        <Text style={styles.paymentAmount}>₦{item.amount}</Text>
        <Text style={styles.paymentDate}>{formatDate(item.timestamp)}</Text>
      </View>

      <View style={styles.paymentMethod}>
        <Ionicons name="card-outline" size={16} color="#666" />
        <Text style={styles.paymentMethodText}>
          {item.paymentMethod} {item.cardLast4 ? `•••• ${item.cardLast4}` : ""}
        </Text>
      </View>

      <View style={styles.viewDetailsContainer}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#2196F3" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No payment history yet</Text>
      <Text style={styles.emptySubtext}>
        Your payment history will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment History</Text>
        <TouchableOpacity onPress={fetchPayments}>
          <Ionicons name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            payments.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 15,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#e6f7ed",
    color: "#00a650",
  },
  statusPending: {
    backgroundColor: "#fff8e6",
    color: "#f5a623",
  },
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentDate: {
    color: "#666",
    fontSize: 14,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: "#666",
    textAlign: "center",
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  viewDetailsText: {
    color: "#2196F3",
    fontSize: 14,
    marginRight: 5,
  },
});
