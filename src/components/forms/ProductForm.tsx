import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { CreateProductPayload } from "../../types/product";
import { AppButton } from "../ui/AppButton";
import { AppInput } from "../ui/AppInput";

interface ProductFormProps {
  loading?: boolean;
  onSubmit: (payload: CreateProductPayload) => void;
}

export function ProductForm({ loading = false, onSubmit }: ProductFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  return (
    <View style={styles.container}>
      <AppInput placeholder="Title" value={title} onChangeText={setTitle} />
      <AppInput placeholder="Description" value={description} onChangeText={setDescription} />
      <AppInput
        placeholder="Price"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />
      <AppButton
        title={loading ? "Saving..." : "Save Product"}
        disabled={loading}
        onPress={() =>
          onSubmit({
            title,
            description,
            price: Number(price || "0"),
            currency: "PHP",
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
