import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const querySnapshot = await getDocs(collection(db, "payments"));
      setTransactions(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.transaction}>{item.title} - ₦{item.amount} ({item.paymentMethod})</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  transaction: { fontSize: 16, padding: 5 },
});
