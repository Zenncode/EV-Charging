import { StyleSheet, Text, View } from "react-native";

export default function ScreenRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Layout</Text>
      <Text style={styles.subtitle}>Root app layout scaffold. Wrap with Expo Router Slot when you switch to expo-router entry.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
  },
});