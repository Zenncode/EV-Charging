import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton } from "../ui/AppButton";
import { AppInput } from "../ui/AppInput";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

interface RegisterFormProps {
  loading?: boolean;
  onSubmit: (values: RegisterFormValues) => void;
}

export function RegisterForm({ loading = false, onSubmit }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <AppInput placeholder="Name" value={name} onChangeText={setName} />
      <AppInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <AppInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <AppButton
        title={loading ? "Creating Account..." : "Create Account"}
        disabled={loading}
        onPress={() => onSubmit({ name, email, password })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
