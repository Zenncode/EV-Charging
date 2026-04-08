import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { carModels } from "../data/cars";
import { chargingStations } from "../data/stations";
import { colors } from "../theme";
import { ActiveSession, CarModel, ReservationEntry, TabKey } from "../types";

interface HomeScreenProps {
  selectedCarId: string;
  activeSession: ActiveSession | null;
  reservationsByStation: Record<string, ReservationEntry[]>;
  onSelectTab: (tab: TabKey) => void;
}

export function HomeScreen({
  selectedCarId,
  activeSession,
  reservationsByStation: _reservationsByStation,
  onSelectTab,
}: HomeScreenProps) {
  const nearest = [...chargingStations].sort((a, b) => a.distance - b.distance)[0];
  const selectedCar: CarModel = carModels.find((car) => car.id === selectedCarId) ?? carModels[0];

  const cards: {
    label: string;
    subtitle: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    tab: TabKey;
  }[] = [
    { label: "Open Maps", subtitle: "Find nearby chargers", icon: "map-marker-path", tab: "Maps" },
    { label: "Favorites", subtitle: "Saved stations", icon: "heart-outline", tab: "Favorites" },
    { label: "Session", subtitle: "Track charging", icon: "lightning-bolt-outline", tab: "Session" },
    { label: "Profile", subtitle: "Wallet and settings", icon: "account-outline", tab: "Profile" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Ready to Ride</Text>
          <Text style={styles.title}>Electric Uzaro</Text>
          <Text style={styles.subtitle}>Your EV is active and ready.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EU</Text>
        </View>
      </View>

      <View style={styles.carCard}>
        <View style={styles.carGlow} />
        <MaterialCommunityIcons name="car-electric" size={56} color={colors.emerald} />
        <Text style={styles.carTitle}>{selectedCar.displayName}</Text>
        <Text style={styles.carSub}>Linked EV profile</Text>
      </View>

      {activeSession ? (
        <Pressable style={styles.sessionCard} onPress={() => onSelectTab("Session")}>
          <Text style={styles.sessionTitle}>Charging Session Active</Text>
          <Text style={styles.sessionSub}>{activeSession.stationName}</Text>
          <Text style={styles.sessionHint}>Tap to monitor charging progress</Text>
        </Pressable>
      ) : null}

      {nearest ? (
        <Pressable style={styles.stationCard} onPress={() => onSelectTab("Maps")}>
          <Text style={styles.stationTitle}>Nearest Station</Text>
          <Text style={styles.stationName}>{nearest.name}</Text>
          <Text style={styles.stationSub}>
            {nearest.distance.toFixed(1)} km away | {nearest.availableChargers}/{nearest.totalChargers} available
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.actionGrid}>
        {cards.map((card) => (
          <Pressable key={card.label} style={styles.actionCard} onPress={() => onSelectTab(card.tab)}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name={card.icon} size={17} color={colors.emerald} />
            </View>
            <Text style={styles.actionTitle}>{card.label}</Text>
            <Text style={styles.actionSub}>{card.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kicker: {
    color: "#3dd9ae",
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "400",
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0f2a37",
    borderWidth: 1,
    borderColor: "#1dd8a95d",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#d3dfed",
    fontWeight: "600",
    fontSize: 18,
  },
  carCard: {
    marginTop: 2,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  carGlow: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#11d39f1a",
    top: -155,
  },
  carTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: "400",
  },
  carSub: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "400",
  },
  sessionCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1ad4a866",
    backgroundColor: "#0f2436",
    padding: 16,
  },
  sessionTitle: {
    color: "#70ebca",
    fontWeight: "500",
    fontSize: 14,
  },
  sessionSub: {
    marginTop: 8,
    color: colors.text,
    fontWeight: "400",
    fontSize: 16,
  },
  sessionHint: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  stationCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 16,
  },
  stationTitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  stationName: {
    marginTop: 6,
    color: colors.text,
    fontSize: 16,
    fontWeight: "400",
  },
  stationSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  actionCard: {
    width: "48%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 126,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#10d7a11c",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  actionSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
});
