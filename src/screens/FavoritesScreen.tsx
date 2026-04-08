import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { StationCard } from "../components/ui/StationCard";
import { chargingStations } from "../data/stations";
import { colors } from "../theme";
import { ChargingStation, ReservationEntry } from "../types";
import { ToastMessagePayload } from "../components/ui/toastmessage";

interface FavoritesScreenProps {
  favoriteIds: string[];
  reservationsByStation: Record<string, ReservationEntry[]>;
  onToggleFavorite: (stationId: string) => void;
  onCreateReservation: (stationId: string, reservedBy: string) => void;
  onStartSession: (station: ChargingStation) => void;
  onOpenMaps: () => void;
  onToast: (toast: ToastMessagePayload) => void;
}

export function FavoritesScreen({
  favoriteIds,
  reservationsByStation,
  onToggleFavorite,
  onCreateReservation,
  onStartSession,
  onOpenMaps,
  onToast,
}: FavoritesScreenProps) {
  const [reserveStation, setReserveStation] = useState<ChargingStation | null>(null);
  const [reserveName, setReserveName] = useState("");

  const favorites = chargingStations.filter((station) => favoriteIds.includes(station.id));

  const submitReservation = () => {
    if (!reserveStation) return;
    const value = reserveName.trim();

    if (!value) {
      onToast({
        title: "Name required",
        message: "Enter the reserver name before saving.",
        tone: "warning",
      });
      return;
    }

    onCreateReservation(reserveStation.id, value);
    setReserveName("");
    setReserveStation(null);
    onToast({
      title: "Reservation added",
      message: `Saved reservation for ${reserveStation.name}.`,
      tone: "success",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.sub}>{favorites.length} saved stations</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialCommunityIcons name="heart-plus-outline" size={34} color={colors.emerald} />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySub}>Add favorites from the map screen and they will appear here.</Text>
          <Pressable style={styles.openMapBtn} onPress={onOpenMaps}>
            <Text style={styles.openMapText}>Open Maps</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <StationCard
              station={item}
              isFavorite
              onToggleFavorite={onToggleFavorite}
              onReserve={setReserveStation}
              onStartSession={onStartSession}
              reservationCount={reservationsByStation[item.id]?.length ?? 0}
              startDisabled={item.availableChargers <= 0}
              startDisabledText={
                item.availableChargers <= 0 ? "No free charger at this station." : undefined
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      <Modal
        visible={reserveStation !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReserveStation(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reserve Favorite Station</Text>
            <Text style={styles.modalSub}>{reserveStation?.name}</Text>
            <TextInput
              value={reserveName}
              onChangeText={setReserveName}
              placeholder="Name of reserver"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={() => setReserveStation(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalConfirm]} onPress={submitReservation}>
                <Text style={styles.modalConfirmText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  sub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  openMapBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#22d3ee66",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#22d3ee1a",
  },
  openMapText: {
    color: colors.cyan,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 16,
    paddingBottom: 22,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  modalSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  modalInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  modalActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  modalConfirm: {
    backgroundColor: "#10b981",
  },
  modalCancelText: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  modalConfirmText: {
    color: "white",
    fontWeight: "800",
  },
});
