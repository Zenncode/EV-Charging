import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getImage } from "../lib/imageMapper";

interface LoginScreenProps {
  onSignIn: () => void;
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const uzaroLogo = getImage("uzaro", "uzaroLogo");

  const canSignIn = email.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.hexTopWrap}>
        <View style={[styles.hex, styles.hexTopA]} />
        <View style={[styles.hex, styles.hexTopB]} />
        <View style={[styles.hex, styles.hexTopC]} />
      </View>
      <View style={styles.hexBottomWrap}>
        <View style={[styles.hex, styles.hexBottomA]} />
        <View style={[styles.hex, styles.hexBottomB]} />
      </View>

      <View style={styles.brandRow}>
        {uzaroLogo ? (
          <Image source={{ uri: uzaroLogo }} style={styles.logoIcon} resizeMode="contain" />
        ) : (
          <View style={styles.logoFallback}>
            <MaterialCommunityIcons name="cube-outline" size={18} color="#24d6a0" />
          </View>
        )}
        <Text style={styles.brandText}>Electric Uzaro</Text>
      </View>

      <Text style={styles.title}>Login Your{"\n"}Account</Text>

      <Text style={styles.label}>Email:</Text>
      <View style={styles.inputWrap}>
        <MaterialCommunityIcons name="email-outline" size={16} color="#5d6979" />
        <TextInput
          placeholder="Email or Phone number"
          placeholderTextColor="#8893a3"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <Text style={styles.label}>Password:</Text>
      <View style={styles.inputWrap}>
        <MaterialCommunityIcons name="lock-outline" size={16} color="#5d6979" />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#8893a3"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <MaterialCommunityIcons name="eye-off-outline" size={16} color="#64748b" />
      </View>

      <Pressable style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot password</Text>
      </Pressable>

      <Pressable
        disabled={!canSignIn}
        style={[styles.signInBtn, !canSignIn && styles.signInBtnDisabled]}
        onPress={onSignIn}
      >
        <Text style={[styles.signInText, !canSignIn && styles.signInTextDisabled]}>Sign In</Text>
      </Pressable>

      <View style={styles.footerSection}>
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialBtn}>
            <MaterialCommunityIcons name="google" size={21} color="#ea4335" />
          </Pressable>
          <Pressable style={styles.socialBtn}>
            <MaterialCommunityIcons name="phone" size={21} color="#22c55e" />
          </Pressable>
          <Pressable style={styles.socialBtn}>
            <MaterialCommunityIcons name="facebook" size={21} color="#3b82f6" />
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          Don't have an account? <Text style={styles.footerLink}>Sign Up</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04070d",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 20,
  },
  hexTopWrap: {
    position: "absolute",
    right: -24,
    top: -10,
    width: 170,
    height: 220,
  },
  hexBottomWrap: {
    position: "absolute",
    left: -34,
    bottom: -26,
    width: 190,
    height: 210,
  },
  hex: {
    position: "absolute",
    width: 74,
    height: 74,
    borderWidth: 1,
    borderColor: "#1a355970",
    transform: [{ rotate: "45deg" }],
  },
  hexTopA: {
    top: 12,
    right: 14,
  },
  hexTopB: {
    top: 64,
    right: 56,
  },
  hexTopC: {
    top: 118,
    right: 16,
  },
  hexBottomA: {
    bottom: 56,
    left: 6,
  },
  hexBottomB: {
    bottom: 4,
    left: 52,
  },
  brandRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
  },
  logoFallback: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22558f80",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d223b",
  },
  brandText: {
    color: "#f8fbff",
    fontSize: 24,
    fontWeight: "700",
  },
  title: {
    marginTop: 24,
    color: "#ffffff",
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "800",
  },
  label: {
    marginTop: 22,
    marginBottom: 7,
    color: "#edf3ff",
    fontSize: 16,
    fontWeight: "600",
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d3d9e2",
    backgroundColor: "#e8ebf0",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    color: "#0f172a",
    fontSize: 13,
  },
  forgotBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  forgotText: {
    color: "#2d7fff",
    fontSize: 12,
    fontWeight: "500",
  },
  signInBtn: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a4cad",
  },
  signInBtnDisabled: {
    opacity: 0.55,
  },
  signInText: {
    color: "#051630",
    fontSize: 17,
    fontWeight: "700",
  },
  signInTextDisabled: {
    color: "#2c3f5d",
  },
  footerSection: {
    marginTop: "auto",
  },
  orRow: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#24374e",
  },
  orText: {
    color: "#97abc6",
    fontSize: 13,
    fontWeight: "600",
  },
  socialRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#25456977",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0e1f32",
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#edf3ff",
    fontSize: 15,
  },
  footerLink: {
    color: "#2f83ff",
    fontWeight: "700",
  },
});
