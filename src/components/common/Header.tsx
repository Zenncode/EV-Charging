import { StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      {subtitle ? <AppText muted>{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
