import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      {description ? <AppText muted style={styles.description}>{description}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
  },
  description: {
    marginTop: 6,
    textAlign: "center",
  },
});
