import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "../../constants/colors";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ title, onPress, disabled = false, style }: AppButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, disabled && styles.disabled, style]}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.55,
  },
  title: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});
