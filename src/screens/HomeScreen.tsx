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

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
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
  const monthAvgCost = currentMonthEntries.length > 0 ? monthCost / currentMonthEntries.length : 0;
  const latestSession = sessionHistory[0];

  const selectedCar: CarModel = carModels.find((car) => car.id === selectedCarId) ?? carModels[0];
  const greeting = getGreeting();

  const quickActions: Array<{
    label: string;
    subtitle: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    tab: TabKey;
    color: string;
    tint: string;
  }> = [
    {
      label: "Explore Map",
      subtitle: "Discover chargers near you",
      icon: "map-search-outline",
      tab: "Maps",
      color: colors.cyan,
      tint: "#22d3ee1d",
    },
    {
      label: "Saved Stations",
      subtitle: "Your favorite charging spots",
      icon: "heart-multiple-outline",
      tab: "Favorites",
      color: "#fb7185",
      tint: "#fb71851a",
    },
    {
      label: "Live Session",
      subtitle: activeSession ? "Monitor charging now" : "No active charge yet",
      icon: "lightning-bolt-outline",
      tab: "Session",
      color: colors.emerald,
      tint: "#10b9811b",
    },
    {
      label: "Account Hub",
      subtitle: "Wallet, EV profile, settings",
      icon: "account-cog-outline",
      tab: "Profile",
      color: colors.amber,
      tint: "#f59e0b1e",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />

        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Electric Uzaro Control</Text>
            <Text style={styles.title}>{greeting}, Juan</Text>
            <Text style={styles.subtitle}>Charge smarter and keep every trip ready.</Text>
          </View>
          <Pressable style={styles.heroMapBtn} onPress={() => onSelectTab("Maps")}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={19} color={colors.cyan} />
          </Pressable>
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

        <View style={styles.heroBottomRow}>
          <View style={styles.linkedCarPill}>
            <MaterialCommunityIcons name="car-electric" size={14} color={colors.emerald} />
            <Text style={styles.linkedCarText}>{selectedCar.displayName}</Text>
          </View>
          <Pressable
            style={styles.heroPrimaryBtn}
            onPress={() => onSelectTab(activeSession ? "Session" : "Maps")}
          >
            <Text style={styles.heroPrimaryBtnText}>{activeSession ? "Open Session" : "Start Charging"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.dualInfoRow}>
        {nearest ? (
          <Pressable style={styles.infoCard} onPress={() => onSelectTab("Maps")}>
            <View style={styles.infoCardTitleRow}>
              <MaterialCommunityIcons name="crosshairs-gps" size={14} color={colors.cyan} />
              <Text style={styles.infoTitle}>Nearest Station</Text>
            </View>
            <Text style={styles.infoMain}>{nearest.name}</Text>
            <Text style={styles.infoSub}>
              {nearest.distance.toFixed(1)} km • {nearest.availableChargers}/{nearest.totalChargers} available
            </Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.infoCard} onPress={() => onSelectTab("Favorites")}>
          <View style={styles.infoCardTitleRow}>
            <MaterialCommunityIcons name="heart-outline" size={14} color="#fb7185" />
            <Text style={styles.infoTitle}>Favorites</Text>
          </View>
          <Text style={styles.infoMain}>{favoriteCount} saved</Text>
          <Text style={styles.infoSub}>Quick access to preferred stations</Text>
        </Pressable>
      </View>

      {activeSession ? (
        <Pressable style={styles.activeCard} onPress={() => onSelectTab("Session")}>
          <View style={styles.activeHeader}>
            <Text style={styles.activeTitle}>Charging Session Active</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.activeStation}>{activeSession.stationName}</Text>
          <Text style={styles.activeHint}>Tap to monitor your charging progress in real time.</Text>
        </Pressable>
      ) : (
        <View style={styles.latestCard}>
          <View style={styles.latestTitleRow}>
            <Text style={styles.latestTitle}>Latest Session</Text>
            {latestSession ? <Text style={styles.latestDate}>{formatShortDate(latestSession.endedAt)}</Text> : null}
          </View>
          {latestSession ? (
            <>
              <Text style={styles.latestStation}>{latestSession.stationName}</Text>
              <View style={styles.latestMetaRow}>
                <Text style={styles.latestMeta}>{latestSession.energyAddedKwh.toFixed(1)} kWh</Text>
                <Text style={styles.latestMeta}>PHP {latestSession.estimatedCost.toFixed(2)}</Text>
                <Text style={styles.latestMeta}>{Math.round(latestSession.progressPercent)}%</Text>
              </View>
            </>
          ) : (
            <Text style={styles.latestEmpty}>No charging history yet. Start your first session from Maps.</Text>
          )}
        </View>
      )}

      <View style={styles.monthSummary}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthSummaryTitle}>This Month</Text>
          <Text style={styles.monthSummaryHint}>Performance Snapshot</Text>
        </View>
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
            <Text style={styles.monthTileLabel}>Avg Session Cost</Text>
            <Text style={styles.monthTileValue}>PHP {monthAvgCost.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionGrid}>
        {quickActions.map((card) => (
          <Pressable key={card.label} style={styles.actionCard} onPress={() => onSelectTab(card.tab)}>
            <View style={[styles.actionIconWrap, { backgroundColor: card.tint }]}>
              <MaterialCommunityIcons name={card.icon} size={17} color={card.color} />
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
    gap: 12,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102339",
    padding: 14,
    overflow: "hidden",
    gap: 12,
  },
  heroGlowA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#31d4f521",
    right: -70,
    top: -140,
  },
  heroGlowB: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#24d6a018",
    left: -90,
    bottom: -110,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  kicker: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 4,
    color: colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 240,
  },
  heroMapBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#31d4f54d",
    backgroundColor: "#0c1b2cc7",
    alignItems: "center",
    justifyContent: "center",
  },
  heroMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  heroMetricChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#081424c9",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroMetricText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  heroBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  linkedCarPill: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#24d6a066",
    backgroundColor: "#24d6a01f",
    minHeight: 38,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkedCarText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  heroPrimaryBtn: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#24d6a080",
    backgroundColor: "#24d6a02a",
    minHeight: 38,
    minWidth: 128,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPrimaryBtnText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "800",
  },
  dualInfoRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0d1d30",
    padding: 11,
    gap: 6,
  },
  infoCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  infoMain: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  infoSub: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  activeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#24d6a066",
    backgroundColor: "#102c31",
    padding: 13,
    gap: 6,
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  activeTitle: {
    color: "#9ef7dd",
    fontSize: 12,
    fontWeight: "800",
  },
  liveBadge: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#10b9818f",
    backgroundColor: "#10b98124",
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6ee7b7",
  },
  liveText: {
    color: "#6ee7b7",
    fontSize: 10,
    fontWeight: "800",
  },
  activeStation: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  activeHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  latestCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 7,
  },
  latestTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  latestTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "700",
  },
  latestDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
  latestStation: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  latestMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  latestMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  latestEmpty: {
    color: colors.textMuted,
    fontSize: 12,
  },
  monthSummary: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2036",
    padding: 12,
    gap: 8,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  monthSummaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  monthSummaryHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  monthSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    justifyContent: "space-between",
  },
  monthTile: {
    width: "48.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#081729d1",
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
    rowGap: 10,
  },
  actionCard: {
    width: "48.5%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0d1f32",
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 108,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
