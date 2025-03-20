import React, { createContext, useState, useContext, useEffect } from "react";
import { db, storage } from "../firebaseConfig"; // Make sure storage is exported
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

import { useAuth } from "./AuthContext";
import { Alert } from "react-native";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    if (!currentUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        // Create a new user document if it doesn't exist
        const newUserData = {
          fullName: currentUser.displayName || "",
          email: currentUser.email || "",
          phoneNumber: currentUser.phoneNumber || "",
          createdAt: new Date(),
          notificationSettings: {
            paymentReminders: true,
            appUpdates: true,
            newFeatures: true,
          },
        };

        await updateDoc(userDocRef, newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data
  const updateUserProfile = async (updatedData) => {
    if (!currentUser) return false;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, updatedData);

      // Update local state
      setUserData((prevData) => ({
        ...prevData,
        ...updatedData,
      }));

      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      Alert.alert("Error", "Failed to update profile: " + error.message);
      return false;
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings) => {
    if (!currentUser) return false;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        notificationSettings: settings,
      });

      // Update local state
      setUserData((prevData) => ({
        ...prevData,
        notificationSettings: settings,
      }));

      return true;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      Alert.alert(
        "Error",
        "Failed to update notification settings: " + error.message
      );
      return false;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const value = {
    userData,
    loading,
    fetchUserData,
    updateUserProfile,

    updateNotificationSettings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
