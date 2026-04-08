import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StationCard } from "../components/ui/StationCard";
import { chargingStations } from "../data/stations";
import { colors } from "../theme";
import { ActiveSession, ChargingStation, ReservationEntry } from "../types";
import { ToastMessagePayload } from "../components/ui/toastmessage";

interface MapScreenProps {
  favoriteIds: string[];
  activeSession: ActiveSession | null;
  reservationsByStation: Record<string, ReservationEntry[]>;
  onToggleFavorite: (stationId: string) => void;
  onCreateReservation: (stationId: string, reservedBy: string) => void;
  onStartSession: (station: ChargingStation) => void;
  onToast: (toast: ToastMessagePayload) => void;
}

export function MapScreen({
  favoriteIds,
  activeSession,
  reservationsByStation,
  onToggleFavorite,
  onCreateReservation,
  onStartSession,
  onToast,
}: MapScreenProps) {
  const [search, setSearch] = useState("");
  const [sortByNearest, setSortByNearest] = useState(true);

  const filteredStations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = chargingStations.filter((station) => {
      if (!q) return true;
      return station.name.toLowerCase().includes(q) || station.address.toLowerCase().includes(q);
    });

    return list.sort((a, b) => (sortByNearest ? a.distance - b.distance : b.distance - a.distance));
  }, [search, sortByNearest]);

  const reserveWeb = (stationId: string) => {
    onCreateReservation(stationId, "Web User");
    const station = chargingStations.find((item) => item.id === stationId);
    onToast({
      title: "Reservation added",
      message: station ? `Saved reservation for ${station.name}.` : "Reservation saved.",
      tone: "success",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Map view is native-only on this build</Text>
        <Text style={styles.bannerSub}>
          Web shows a station list fallback. Use Android/iOS for full map experience.
        </Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          placeholder="Search stations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <Pressable style={styles.sortBtn} onPress={() => setSortByNearest((prev) => !prev)}>
          <Text style={styles.sortText}>{sortByNearest ? "Nearest" : "Farthest"}</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hintWrap}>
        <Text style={styles.hintText}>Tips:</Text>
        <Text style={styles.hintChip}>Open mobile app for map pins</Text>
        <Text style={styles.hintChip}>Reservations work on web</Text>
        <Text style={styles.hintChip}>Start session is supported</Text>
      </ScrollView>

      <FlatList
        data={filteredStations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isUnavailable = item.availableChargers <= 0;
          const hasDifferentActiveSession = activeSession ? activeSession.stationId !== item.id : false;

          return (
            <View style={styles.cardWrap}>
              <StationCard
                station={item}
                isFavorite={favoriteIds.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
                onReserve={() => reserveWeb(item.id)}
                onStartSession={onStartSession}
                reservationCount={reservationsByStation[item.id]?.length ?? 0}
                startDisabled={isUnavailable || hasDifferentActiveSession}
                startDisabledText={
                  isUnavailable
                    ? "No free charger at this station."
                    : hasDifferentActiveSession
                      ? "Stop your current session first."
                      : undefined
                }
              />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  banner: {
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#31d4f566",
    backgroundColor: "#31d4f51f",
    padding: 12,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  bannerSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  controls: {
    marginTop: 10,
    marginHorizontal: 12,
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0d1f31",
    paddingHorizontal: 12,
    color: colors.text,
  },
  sortBtn: {
    minWidth: 82,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d1f31",
    paddingHorizontal: 12,
  },
  sortText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "700",
  },
  hintWrap: {
    marginTop: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    alignSelf: "center",
  },
  hintChip: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102236",
    color: colors.text,
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  cardWrap: {
    width: "100%",
  },
});
