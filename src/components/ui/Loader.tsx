import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";

export function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
