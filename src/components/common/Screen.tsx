import { PropsWithChildren } from "react";
import { Platform, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
  },
});
