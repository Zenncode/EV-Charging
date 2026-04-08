import { forwardRef } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { colors } from "../../constants/colors";

export const AppInput = forwardRef<TextInput, TextInputProps>(function AppInput(props, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.muted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
});
