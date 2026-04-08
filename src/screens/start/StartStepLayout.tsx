import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

interface StartStepLayoutProps {
  step: 1 | 2 | 3;
  title: string;
  description: string;
  backgroundUri: string | null;
  blackOverlayPercent: number;
  ctaLabel: string;
  onPress: () => void;
}

export function StartStepLayout({
  step,
  title,
  description,
  backgroundUri,
  blackOverlayPercent,
  ctaLabel,
  onPress,
}: StartStepLayoutProps) {
  const safePercent = Math.max(0, Math.min(100, blackOverlayPercent));
  const base = safePercent / 100;
  const globalDimAlpha = Math.min(0.1, base * 0.06);
  const fadeAlphaA = Math.min(0.08, base * 0.04);
  const fadeAlphaB = Math.min(0.12, base * 0.07);
  const fadeAlphaC = Math.min(0.17, base * 0.11);
  const fadeAlphaD = Math.min(0.23, base * 0.16);
  const fadeAlphaE = Math.min(0.3, base * 0.22);
  const fadeAlphaF = Math.min(0.38, base * 0.29);
  const bottomFocusAlpha = Math.min(0.22, base * 0.14);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundUri ? { uri: backgroundUri } : undefined}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.image}
      >
        <View style={[styles.globalDim, { backgroundColor: `rgba(0, 0, 0, ${globalDimAlpha})` }]} />
        <View style={[styles.bottomFadeA, { backgroundColor: `rgba(0, 0, 0, ${fadeAlphaA})` }]} />
        <View style={[styles.bottomFadeB, { backgroundColor: `rgba(0, 0, 0, ${fadeAlphaB})` }]} />
        <View style={[styles.bottomFadeC, { backgroundColor: `rgba(0, 0, 0, ${fadeAlphaC})` }]} />
        <View style={[styles.bottomFadeD, { backgroundColor: `rgba(0, 0, 0, ${fadeAlphaD})` }]} />
        <View style={[styles.bottomFadeE, { backgroundColor: `rgba(0, 0, 0, ${fadeAlphaE})` }]} />
        <View style={[styles.bottomFadeF, { backgroundColor: `rgba(0, 0, 0, ${fadeAlphaF})` }]} />
        <View style={[styles.bottomFocus, { backgroundColor: `rgba(0, 0, 0, ${bottomFocusAlpha})` }]} />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <Pressable style={styles.ctaBtn} onPress={onPress}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>

          <View style={styles.dotRow}>
            {[1, 2, 3].map((item) => (
              <View key={`step-${item}`} style={[styles.dot, item === step && styles.dotActive]} />
            ))}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050b16",
  },
  background: {
    flex: 1,
    justifyContent: "flex-end",
  },
  image: {
    backgroundColor: "#0a1220",
  },
  globalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 8, 16, 0.22)",
  },
  bottomFadeA: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "74%",
  },
  bottomFadeB: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "65%",
  },
  bottomFadeC: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "56%",
  },
  bottomFadeD: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%",
  },
  bottomFadeE: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "41%",
  },
  bottomFadeF: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "35%",
  },
  bottomFocus: {
    position: "absolute",
    left: -10,
    right: -10,
    bottom: -42,
    height: "30%",
    borderRadius: 180,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  title: {
    color: "#f8fbff",
    fontSize: 46,
    lineHeight: 50,
    fontWeight: "900",
    letterSpacing: 0.1,
    maxWidth: 280,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  description: {
    marginTop: 10,
    color: "#d2def2",
    fontSize: 14,
    lineHeight: 18,
    maxWidth: 315,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  ctaBtn: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f65c07f",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0749a5",
    shadowColor: "#02214a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 14,
    elevation: 7,
  },
  ctaText: {
    color: "#eaf3ff",
    fontSize: 20,
    fontWeight: "700",
  },
  dotRow: {
    marginTop: 15,
    flexDirection: "row",
    alignSelf: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#1c7fd8",
  },
  dotActive: {
    backgroundColor: "#f8fbff",
  },
});
