import { StyleSheet, Text, View } from "react-native";

export default function IndexRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo App Root</Text>
      <Text style={styles.subtitle}>Start wiring navigation from this route.</Text>
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
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#475569",
    fontSize: 13,
  },
});
