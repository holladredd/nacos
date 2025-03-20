import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";

export default function NotificationsScreen({ navigation }) {
  const { userData, updateNotificationSettings } = useUser();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    paymentReminders: true,
    appUpdates: true,
    newFeatures: true,
    promotions: false,
    emailNotifications: true,
  });

  useEffect(() => {
    if (userData && userData.notificationSettings) {
      setSettings({
        ...settings,
        ...userData.notificationSettings,
      });
    }
  }, [userData]);

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await updateNotificationSettings(settings);

      if (success) {
        Alert.alert("Success", "Notification settings updated successfully");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update notification settings: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Payment Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified about upcoming and due payments
              </Text>
            </View>
            <Switch
              value={settings.paymentReminders}
              onValueChange={() => handleToggle("paymentReminders")}
              trackColor={{ false: "#d9d9d9", true: "#bae6fd" }}
              thumbColor={settings.paymentReminders ? "#2196F3" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>App Updates</Text>
              <Text style={styles.settingDescription}>
                Get notified when app updates are available
              </Text>
            </View>
            <Switch
              value={settings.appUpdates}
              onValueChange={() => handleToggle("appUpdates")}
              trackColor={{ false: "#d9d9d9", true: "#bae6fd" }}
              thumbColor={settings.appUpdates ? "#2196F3" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>New Features</Text>
              <Text style={styles.settingDescription}>
                Get notified about new features and improvements
              </Text>
            </View>
            <Switch
              value={settings.newFeatures}
              onValueChange={() => handleToggle("newFeatures")}
              trackColor={{ false: "#d9d9d9", true: "#bae6fd" }}
              thumbColor={settings.newFeatures ? "#2196F3" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Promotions</Text>
              <Text style={styles.settingDescription}>
                Get notified about special offers and promotions
              </Text>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={() => handleToggle("promotions")}
              trackColor={{ false: "#d9d9d9", true: "#bae6fd" }}
              thumbColor={settings.promotions ? "#2196F3" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggle("emailNotifications")}
              trackColor={{ false: "#d9d9d9", true: "#bae6fd" }}
              thumbColor={settings.emailNotifications ? "#2196F3" : "#f4f3f4"}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
