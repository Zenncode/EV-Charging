import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

interface StartStepLayoutProps {
  step: 1 | 2 | 3;
  title: string;
  description: string;
  backgroundUri: string | null;
  blackOverlayPercent: number;
  onPress: () => void;
}

export function StartStepLayout({
  step,
  title,
  description,
  backgroundUri,
  blackOverlayPercent,
  onPress,
}: StartStepLayoutProps) {
  const safePercent = Math.max(0, Math.min(100, blackOverlayPercent));
  const topAlpha = Math.min(0.85, safePercent / 100 / 2);
  const bottomAlpha = Math.min(0.96, safePercent / 100);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundUri ? { uri: backgroundUri } : undefined}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.image}
      >
        <View style={[styles.topDim, { backgroundColor: `rgba(0, 0, 0, ${topAlpha})` }]} />
        <View style={[styles.bottomDim, { backgroundColor: `rgba(0, 0, 0, ${bottomAlpha})` }]} />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <Pressable style={styles.ctaBtn} onPress={onPress}>
            <Text style={styles.ctaText}>Get Started</Text>
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
  topDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 8, 16, 0.22)",
  },
  bottomDim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "52%",
    backgroundColor: "rgba(4, 9, 18, 0.66)",
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
  },
  description: {
    marginTop: 10,
    color: "#d2def2",
    fontSize: 14,
    lineHeight: 18,
    maxWidth: 315,
  },
  ctaBtn: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0749a5",
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
