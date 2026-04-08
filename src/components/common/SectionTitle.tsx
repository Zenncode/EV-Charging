import { StyleSheet } from "react-native";
import { AppText } from "../ui/AppText";

interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return <AppText style={styles.title}>{title}</AppText>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
});
