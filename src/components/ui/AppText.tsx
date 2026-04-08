import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { colors } from "../../constants/colors";

interface AppTextProps extends PropsWithChildren {
  style?: StyleProp<TextStyle>;
  muted?: boolean;
}

export function AppText({ children, style, muted = false }: AppTextProps) {
  return <Text style={[styles.text, muted && styles.muted, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
    fontSize: 14,
  },
  muted: {
    color: colors.muted,
  },
});
