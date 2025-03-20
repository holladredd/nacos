import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function PaymentDetailsScreen({ route, navigation }) {
  const { payment } = route.params;

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
              color: #333;
            }
            .receipt {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 15px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2196F3;
              margin-bottom: 5px;
            }
            .title {
              font-size: 18px;
              color: #666;
            }
            .status {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 14px;
              margin-top: 10px;
              background-color: ${
                payment.status === "Completed" ? "#e6f7ed" : "#fff8e6"
              };
              color: ${payment.status === "Completed" ? "#00a650" : "#f5a623"};
            }
            .details {
              margin: 20px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .label {
              font-weight: 500;
              color: #666;
            }
            .value {
              font-weight: 600;
            }
            .amount {
              font-size: 22px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">NACOS</div>
              <div class="title">Payment Receipt</div>
              <div class="status">${payment.status}</div>
            </div>
            
            <div class="amount">₦${payment.amount}</div>
            
            <div class="details">
              <div class="row">
                <span class="label">Payment For</span>
                <span class="value">${payment.title}</span>
              </div>
              <div class="row">
                <span class="label">Date</span>
                <span class="value">${formatDate(payment.timestamp)}</span>
              </div>
              <div class="row">
                <span class="label">Reference</span>
                <span class="value">${payment.reference || "N/A"}</span>
              </div>
              <div class="row">
                <span class="label">Payment Method</span>
                <span class="value">${payment.paymentMethod} ${
      payment.cardLast4 ? `•••• ${payment.cardLast4}` : ""
    }</span>
              </div>
              ${
                payment.email
                  ? `
              <div class="row">
                <span class="label">Email</span>
                <span class="value">${payment.email}</span>
              </div>
              `
                  : ""
              }
              ${
                payment.description
                  ? `
              <div class="row">
                <span class="label">Description</span>
                <span class="value">${payment.description}</span>
              </div>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>Thank you for your payment.</p>
              <p>For any questions, please contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printReceipt = async () => {
    try {
      const html = generateReceiptHTML();
      await Print.printAsync({
        html,
      });
    } catch (error) {
      Alert.alert("Print Error", "Could not print the receipt.");
      console.error("Print error:", error);
    }
  };

  const shareReceipt = async () => {
    try {
      const html = generateReceiptHTML();
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri);
      } else {
        const pdfName = `receipt-${payment.id}.pdf`;
        const destinationUri = FileSystem.documentDirectory + pdfName;

        await FileSystem.moveAsync({
          from: uri,
          to: destinationUri,
        });

        await Sharing.shareAsync(destinationUri);
      }
    } catch (error) {
      Alert.alert("Share Error", "Could not share the receipt.");
      console.error("Share error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                payment.status === "Completed"
                  ? styles.statusCompleted
                  : styles.statusPending,
              ]}
            >
              {payment.status}
            </Text>
          </View>

          <Text style={styles.title}>{payment.title}</Text>
          <Text style={styles.amount}>₦{payment.amount}</Text>
          <Text style={styles.date}>{formatDate(payment.timestamp)}</Text>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {payment.paymentMethod}{" "}
              {payment.cardLast4 ? `•••• ${payment.cardLast4}` : ""}
            </Text>
          </View>

          {payment.reference && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference</Text>
              <Text style={styles.detailValue}>{payment.reference}</Text>
            </View>
          )}

          {payment.email && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{payment.email}</Text>
            </View>
          )}

          {payment.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{payment.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={shareReceipt}
        >
          <Ionicons name="share-outline" size={20} color="#2196F3" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.printButton]}
          onPress={printReceipt}
        >
          <Ionicons name="print-outline" size={20} color="#fff" />
          <Text style={styles.printButtonText}>Print Receipt</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusCompleted: {
    backgroundColor: "#e6f7ed",
    color: "#00a650",
  },
  statusPending: {
    backgroundColor: "#fff8e6",
    color: "#f5a623",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 15,
    color: "#666",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  shareButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  shareButtonText: {
    marginLeft: 8,
    color: "#2196F3",
    fontWeight: "600",
  },
  printButton: {
    flex: 2,
    backgroundColor: "#2196F3",
  },
  printButtonText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "600",
  },
});
