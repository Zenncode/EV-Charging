import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton } from "../ui/AppButton";
import { AppInput } from "../ui/AppInput";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  loading?: boolean;
  onSubmit: (values: LoginFormValues) => void;
}

export function LoginForm({ loading = false, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <AppInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <AppInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <AppButton title={loading ? "Signing In..." : "Sign In"} disabled={loading} onPress={() => onSubmit({ email, password })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
