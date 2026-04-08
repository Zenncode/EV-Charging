import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";

interface ErrorViewProps {
  message: string;
}

export function ErrorView({ message }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Something went wrong</AppText>
      <AppText muted>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 6,
  },
  title: {
    fontWeight: "700",
  },
});
