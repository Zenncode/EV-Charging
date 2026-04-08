import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { carModels } from "../data/cars";
import { chargingStations } from "../data/stations";
import { colors } from "../theme";
import { ActiveSession, CarModel, ReservationEntry, SessionHistoryEntry, TabKey } from "../types";

interface HomeScreenProps {
  selectedCarId: string;
  activeSession: ActiveSession | null;
  reservationsByStation: Record<string, ReservationEntry[]>;
  favoriteCount: number;
  sessionHistory: SessionHistoryEntry[];
  onSelectTab: (tab: TabKey) => void;
}

export function HomeScreen({
  selectedCarId,
  activeSession,
  reservationsByStation,
  favoriteCount,
  sessionHistory,
  onSelectTab,
}: HomeScreenProps) {
  const nearest = [...chargingStations].sort((a, b) => a.distance - b.distance)[0];
  const openStations = chargingStations.filter((station) => station.availableChargers > 0).length;
  const avgPrice = chargingStations.reduce((sum, item) => sum + item.price, 0) / chargingStations.length;
  const queuedReservations = Object.values(reservationsByStation).reduce(
    (sum, list) => sum + list.length,
    0
  );

  const monthKey = new Date().toISOString().slice(0, 7);
  const currentMonthEntries = sessionHistory.filter((entry) => entry.endedAt.slice(0, 7) === monthKey);
  const monthEnergy = currentMonthEntries.reduce((sum, entry) => sum + entry.energyAddedKwh, 0);
  const monthCost = currentMonthEntries.reduce((sum, entry) => sum + entry.estimatedCost, 0);
  const latestSession = sessionHistory[0];

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
      <View style={styles.hero}>
        <View style={styles.heroGlowLarge} />
        <View style={styles.heroGlowSmall} />
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.kicker}>Electric Uzaro Control</Text>
            <Text style={styles.title}>Charge Smarter, Drive Longer</Text>
            <Text style={styles.subtitle}>Live data, quick actions, and better charging choices.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>EU</Text>
          </View>
        </View>

        <View style={styles.heroMetricsRow}>
          <View style={styles.heroMetricChip}>
            <MaterialCommunityIcons name="ev-station" size={14} color={colors.emerald} />
            <Text style={styles.heroMetricText}>{openStations} open now</Text>
          </View>
          <View style={styles.heroMetricChip}>
            <MaterialCommunityIcons name="cash-multiple" size={14} color={colors.amber} />
            <Text style={styles.heroMetricText}>Avg PHP {avgPrice.toFixed(1)}/kWh</Text>
          </View>
          <View style={styles.heroMetricChip}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.cyan} />
            <Text style={styles.heroMetricText}>{queuedReservations} queued</Text>
          </View>
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

      {!activeSession && latestSession ? (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Latest Session</Text>
          <Text style={styles.historyStation}>{latestSession.stationName}</Text>
          <View style={styles.historyRow}>
            <Text style={styles.historyText}>{latestSession.energyAddedKwh.toFixed(1)} kWh</Text>
            <Text style={styles.historyText}>PHP {latestSession.estimatedCost.toFixed(2)}</Text>
            <Text style={styles.historyText}>{Math.round(latestSession.progressPercent)}%</Text>
          </View>
        </View>
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

      <View style={styles.monthSummary}>
        <Text style={styles.monthSummaryTitle}>This Month</Text>
        <View style={styles.monthSummaryGrid}>
          <View style={styles.monthTile}>
            <Text style={styles.monthTileLabel}>Sessions</Text>
            <Text style={styles.monthTileValue}>{currentMonthEntries.length}</Text>
          </View>
          <View style={styles.monthTile}>
            <Text style={styles.monthTileLabel}>Energy Added</Text>
            <Text style={styles.monthTileValue}>{monthEnergy.toFixed(1)} kWh</Text>
          </View>
          <View style={styles.monthTile}>
            <Text style={styles.monthTileLabel}>Spend</Text>
            <Text style={styles.monthTileValue}>PHP {monthCost.toFixed(2)}</Text>
          </View>
          <View style={styles.monthTile}>
            <Text style={styles.monthTileLabel}>Favorites</Text>
            <Text style={styles.monthTileValue}>{favoriteCount}</Text>
          </View>
        </View>
      </View>

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
    paddingTop: 12,
    paddingBottom: 20,
    gap: 14,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2034",
    padding: 14,
    overflow: "hidden",
    gap: 12,
  },
  heroGlowLarge: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#31d4f522",
    right: -70,
    top: -170,
  },
  heroGlowSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#24d6a015",
    left: -90,
    bottom: -120,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  kicker: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 250,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#132f3f",
    borderWidth: 1,
    borderColor: "#31d4f54d",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  heroMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroMetricChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#0a1726c7",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroMetricText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  carCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102236",
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
    overflow: "hidden",
  },
  carGlow: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#31d4f521",
    top: -155,
  },
  carTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  carSub: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  sessionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#24d6a066",
    backgroundColor: "#0f2737",
    padding: 16,
  },
  sessionTitle: {
    color: "#86f6d8",
    fontWeight: "800",
    fontSize: 13,
  },
  sessionSub: {
    marginTop: 6,
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  sessionHint: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 6,
  },
  historyTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "700",
  },
  historyStation: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  historyRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  historyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  stationCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 16,
  },
  stationTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  stationName: {
    marginTop: 6,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  stationSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  monthSummary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2034",
    padding: 12,
    gap: 8,
  },
  monthSummaryTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  monthSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    justifyContent: "space-between",
  },
  monthTile: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#081729d4",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  monthTileLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  monthTileValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  actionCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0e1f32",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 118,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#24d6a01f",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
});
