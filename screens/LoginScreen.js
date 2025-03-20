import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

// Required for Google Sign-In with Expo
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const auth = getAuth();

  // Set up Google Sign-In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId:
      "1065295977532-ii2kqqe52rp28pfcpluraqhkdan30131.apps.googleusercontent.com",
    // expoClientId:
    //   "1065295977532-ii2kqqe52rp28pfcpluraqhkdan30131.apps.googleusercontent.com",
    androidClientId:
      "1065295977532-ii2kqqe52rp28pfcpluraqhkdan30131.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    // iosClientId: 'YOUR_IOS_CLIENT_ID',
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      handleGoogleSignInCredential(credential);
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(
          "1065295977532-ii2kqqe52rp28pfcpluraqhkdan30131.apps.googleusercontent.com"
        )}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent("profile email")}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl
      );

      if (result.type === "success") {
        // Parse the access token from the URL
        const accessToken = result.url
          .split("#")[1]
          .split("&")[0]
          .split("=")[1];
        console.log("Got access token:", accessToken);

        // Use the token to get user info or sign in to Firebase
        // ...
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleGoogleSignInCredential = async (credential) => {
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

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update last login time
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      setLoading(false);
      navigation.replace("Main");
    } catch (error) {
      setLoading(false);

      let errorMessage = "Login failed. Please check your credentials.";

      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed login attempts. Please try again later.";
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
      style={styles.container}
    >
      <Text style={styles.title}>NACOS</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleEmailLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
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
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={styles.linkContainer}
      >
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
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
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: "#2196F3",
  },
});
