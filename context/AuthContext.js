import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Get additional user info from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());

            // Update last login time
            await setDoc(
              doc(db, "users", user.uid),
              {
                lastLogin: serverTimestamp(),
              },
              { merge: true }
            );
          } else {
            // If user exists in Auth but not in Firestore (rare case)
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              fullName: user.displayName || "",
              email: user.email,
              photoURL: user.photoURL || "",
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });

            // Fetch the newly created user data
            const newUserDoc = await getDoc(doc(db, "users", user.uid));
            setUserInfo(newUserDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserInfo(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userInfo,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}
