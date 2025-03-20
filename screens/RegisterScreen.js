import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

// Required for Google Sign-In with Expo
WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const auth = getAuth();

  // Set up Google Sign-In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "1065295977532-ii2kqqe52rp28pfcpluraqhkdan30131.apps.googleusercontent.com",
    // You might need these depending on your setup
    // iosClientId: 'YOUR_IOS_CLIENT_ID',
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      handleGoogleSignIn(credential);
    }
  }, [response]);

  const handleGoogleSignIn = async (credential) => {
    setLoading(true);
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Create new user document if first time sign-in
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        // Update last login time
        await setDoc(
          doc(db, "users", user.uid),
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setLoading(false);
      navigation.replace("Main");
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isStrongPassword = (password) => {
    return password.length >= 6; // Basic requirement, can be enhanced
  };

  // Validate form inputs
  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!isStrongPassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Add user details to Firestore - using setDoc with user UID as document ID
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName,
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      setLoading(false);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.replace("Main") },
      ]);
    } catch (error) {
      setLoading(false);

      // Handle specific Firebase auth errors
      let errorMessage = "Registration failed. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage =
            "This email is already registered. Please use a different email or login.";
          break;
        case "auth/invalid-email":
          errorMessage = "The email address is not valid.";
          break;
        case "auth/weak-password":
          errorMessage =
            "The password is too weak. Please use a stronger password.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>NACOS</Text>
          <Text style={styles.subtitle}>Create a new account</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.passwordContainer,
                errors.password ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <View
              style={[
                styles.passwordContainer,
                errors.confirmPassword ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
            disabled={loading}
          >
            <Ionicons
              name="logo-google"
              size={20}
              color="#fff"
              style={styles.googleIcon}
            />
            <Text style={styles.buttonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.linkContainer}
          >
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 5,
  },
  inputError: {
    borderColor: "#ff6b6b",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
  },
  eyeIcon: {
    padding: 10,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
  googleButton: {
    backgroundColor: "#DB4437",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 10,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: "#2196F3",
  },
});
