import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const { userInfo } = useAuth();

  const paymentOptions = [
    { id: "1", title: "Annual Dues", amount: 5000, icon: "calendar" },
    { id: "2", title: "Conference Fee", amount: 10000, icon: "people" },
    { id: "3", title: "Workshop Registration", amount: 3000, icon: "book" },
    { id: "4", title: "Membership Card", amount: 1500, icon: "card" },
  ];

  const handlePayment = (payment) => {
    navigation.navigate("Payment", { payment });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>
            {userInfo?.fullName || "NACOS Member"}
          </Text>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>NACOS</Text>
        </View>
      </View>

      <View style={styles.announcementCard}>
        <View style={styles.announcementContent}>
          <Text style={styles.announcementTitle}>Welcome to NACOS App</Text>
          <Text style={styles.announcementText}>
            Make payments, track your history, and stay updated with NACOS
            activities.
          </Text>
        </View>
        <Ionicons name="megaphone" size={40} color="#2196F3" />
      </View>

      <Text style={styles.sectionTitle}>Payment Options</Text>

      <View style={styles.paymentGrid}>
        {paymentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.paymentOption}
            onPress={() => handlePayment(option)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={option.icon} size={28} color="#2196F3" />
            </View>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionAmount}>₦{option.amount}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Links</Text>

      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="document-text" size={24} color="#2196F3" />
          <Text style={styles.quickLinkText}>Resources</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="calendar" size={24} color="#2196F3" />
          <Text style={styles.quickLinkText}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="chatbubbles" size={24} color="#2196F3" />
          <Text style={styles.quickLinkText}>Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="help-circle" size={24} color="#2196F3" />
          <Text style={styles.quickLinkText}>Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
  },
  announcementCard: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 15,
    margin: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  announcementContent: {
    flex: 1,
    marginRight: 10,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  announcementText: {
    fontSize: 14,
    color: "#444",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 15,
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  paymentOption: {
    width: "46%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: "2%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  quickLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  quickLink: {
    width: "46%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: "2%",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickLinkText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
  },
});
