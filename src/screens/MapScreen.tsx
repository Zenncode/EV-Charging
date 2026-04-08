import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Linking,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import MapView, { Callout, Circle, Marker, Region } from "react-native-maps";
import { StationCard } from "../components/ui/StationCard";
import { chargingStations } from "../data/stations";
import { colors } from "../theme";
import { ActiveSession, ChargingStation, ReservationEntry } from "../types";
import { ToastMessagePayload } from "../components/ui/toastmessage";

const defaultRegion: Region = {
  latitude: 14.585,
  longitude: 121.0573,
  latitudeDelta: 0.18,
  longitudeDelta: 0.12,
};

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
  const [region, setRegion] = useState<Region>(defaultRegion);
  const [userCoord, setUserCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reserveStation, setReserveStation] = useState<ChargingStation | null>(null);
  const [reserveName, setReserveName] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSheetHidden, setIsSheetHidden] = useState(false);

  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.max(280, Math.round(windowHeight * 0.48));
  const hiddenSheetOffset = sheetHeight + 26;
  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  const filteredStations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = chargingStations.filter((station) => {
      if (!q) return true;
      return station.name.toLowerCase().includes(q) || station.address.toLowerCase().includes(q);
    });

    return list.sort((a, b) => (sortByNearest ? a.distance - b.distance : b.distance - a.distance));
  }, [search, sortByNearest]);

  const requestLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError("Location permission denied. Showing default area.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setUserCoord(next);
      setRegion({
        ...next,
        latitudeDelta: 0.08,
        longitudeDelta: 0.06,
      });
      setLocationError(null);
    } catch {
      setLocationError("Could not fetch your location right now.");
    }
  };

  const openNavigation = async (station: ChargingStation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      onToast({
        title: "Cannot open maps",
        message: "No navigation app is available on this device.",
        tone: "error",
      });
      return;
    }

    Linking.openURL(url).catch(() => {
      onToast({
        title: "Cannot open maps",
        message: "Failed to open the navigation link.",
        tone: "error",
      });
    });
  };

  const submitReservation = () => {
    if (!reserveStation) return;

    const value = reserveName.trim();
    if (!value) {
      onToast({
        title: "Name required",
        message: "Enter the reserver name before adding.",
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

  const showSheet = () => {
    setIsSheetHidden(false);
    Animated.spring(sheetTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 11,
    }).start();
  };

  const hideSheet = () => {
    Animated.timing(sheetTranslateY, {
      toValue: hiddenSheetOffset,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setIsSheetHidden(true);
    });
  };

  useEffect(() => {
    if (isSheetHidden) {
      sheetTranslateY.setValue(hiddenSheetOffset);
    }
  }, [hiddenSheetOffset, isSheetHidden, sheetTranslateY]);

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          const nextOffset = Math.max(0, gesture.dy);
          sheetTranslateY.setValue(nextOffset);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldHide = gesture.dy > sheetHeight * 0.22 || gesture.vy > 1.05;
          if (shouldHide) {
            hideSheet();
            return;
          }
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 70,
            friction: 11,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 70,
            friction: 11,
          }).start();
        },
      }),
    [hideSheet, sheetHeight, sheetTranslateY]
  );

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} region={region} onRegionChangeComplete={setRegion}>
        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{ latitude: station.lat, longitude: station.lng }}
            pinColor={station.availableChargers > 0 ? "#10b981" : "#f97316"}
          >
            <Callout onPress={() => setReserveStation(station)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{station.name}</Text>
                <Text style={styles.calloutAddress}>{station.address}</Text>
                <Text style={styles.calloutHint}>Tap to reserve this station</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {userCoord ? (
          <>
            <Circle
              center={userCoord}
              radius={220}
              strokeColor="#38bdf8"
              fillColor="#38bdf830"
              strokeWidth={1}
            />
            <Marker coordinate={userCoord} title="You are here" pinColor="#38bdf8" />
          </>
        ) : null}
      </MapView>

      <View style={styles.overlayTop}>
        <Text style={styles.header}>Electric Uzaro</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search stations..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.actionSquare} onPress={() => setSortByNearest((prev) => !prev)}>
            <MaterialCommunityIcons
              name={sortByNearest ? "sort-ascending" : "sort-descending"}
              size={18}
              color={colors.text}
            />
          </Pressable>
          <Pressable style={styles.actionSquare} onPress={requestLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.headerHint}>
          {sortByNearest ? "Sort: nearest first" : "Sort: farthest first"}
        </Text>
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
      </View>

      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View style={styles.sheetDragArea} {...sheetPanResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        <View style={styles.sheetTitleRow}>
          <Text style={styles.sheetTitle}>Nearby Stations ({filteredStations.length})</Text>
          {activeSession ? <Text style={styles.liveTag}>Session Live</Text> : null}
        </View>
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isUnavailable = item.availableChargers <= 0;
            const hasDifferentActiveSession = activeSession ? activeSession.stationId !== item.id : false;

            return (
              <View style={styles.listItemWrap}>
                <StationCard
                  station={item}
                  isFavorite={favoriteIds.includes(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onReserve={() => setReserveStation(item)}
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
                <View style={styles.cardActionsRow}>
                  <Pressable style={styles.navBtn} onPress={() => openNavigation(item)}>
                    <MaterialCommunityIcons name="navigation-variant-outline" size={16} color={colors.cyan} />
                    <Text style={styles.navText}>Navigate</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </Animated.View>

      {isSheetHidden ? (
        <Pressable style={styles.revealSheetBtn} onPress={showSheet}>
          <MaterialCommunityIcons name="chevron-up" size={16} color={colors.text} />
          <Text style={styles.revealSheetText}>Show Nearby Stations ({filteredStations.length})</Text>
        </Pressable>
      ) : null}

      <Modal
        visible={reserveStation !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReserveStation(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Reserve Spot</Text>
                <Text style={styles.modalSub}>Nearby Station Booking</Text>
              </View>
              <Pressable style={styles.modalCloseBtn} onPress={() => setReserveStation(null)}>
                <MaterialCommunityIcons name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>

            {reserveStation ? (
              <View style={styles.stationPreview}>
                <Text style={styles.stationPreviewName}>{reserveStation.name}</Text>
                <Text style={styles.stationPreviewAddress}>{reserveStation.address}</Text>
                <View style={styles.stationMetaRow}>
                  <View style={styles.stationMetaChip}>
                    <MaterialCommunityIcons name="ev-station" size={13} color={colors.emerald} />
                    <Text style={styles.stationMetaText}>
                      {reserveStation.availableChargers}/{reserveStation.totalChargers} available
                    </Text>
                  </View>
                  <View style={styles.stationMetaChip}>
                    <MaterialCommunityIcons name="cash" size={13} color={colors.cyan} />
                    <Text style={styles.stationMetaText}>PHP {reserveStation.price.toFixed(1)}/kWh</Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.modalInputWrap}>
              <MaterialCommunityIcons name="account-outline" size={16} color={colors.textMuted} />
              <TextInput
                value={reserveName}
                onChangeText={setReserveName}
                placeholder="Enter reserver name"
                placeholderTextColor={colors.textMuted}
                style={styles.modalInput}
              />
            </View>

            {reserveStation && (reservationsByStation[reserveStation.id]?.length ?? 0) > 0 ? (
              <View style={styles.reservationList}>
                <Text style={styles.resListTitle}>Current Queue</Text>
                {reservationsByStation[reserveStation.id].slice(-4).map((entry) => (
                  <View key={entry.id} style={styles.resItemRow}>
                    <View style={styles.resDot} />
                    <Text style={styles.resItem}>{entry.reservedBy}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={() => setReserveStation(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalConfirm, !reserveName.trim() && styles.modalConfirmDisabled]}
                onPress={submitReservation}
              >
                <Text style={styles.modalConfirmText}>Confirm Reservation</Text>
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
  },
  callout: {
    width: 190,
    paddingVertical: 2,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  calloutAddress: {
    marginTop: 3,
    fontSize: 12,
    color: "#334155",
  },
  calloutHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#0f766e",
    fontWeight: "600",
  },
  overlayTop: {
    paddingTop: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(8, 17, 28, 0.62)",
  },
  header: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  searchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(8, 17, 28, 0.9)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  actionSquare: {
    height: 44,
    width: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(8, 17, 28, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerHint: {
    marginTop: 6,
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 4,
    color: "#fda4af",
    fontSize: 12,
  },
  sheet: {
    marginTop: "auto",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#08111cf2",
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  sheetDragArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#64748b",
  },
  sheetTitleRow: {
    marginTop: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  liveTag: {
    color: "#6ee7b7",
    fontSize: 11,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#10b98166",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  listContent: {
    paddingBottom: 24,
  },
  listItemWrap: {
    gap: 8,
  },
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#22d3ee66",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "#22d3ee1a",
  },
  navText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "700",
  },
  revealSheetBtn: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#08111cf4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  revealSheetText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 16,
    paddingBottom: 22,
    gap: 10,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  modalSub: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  stationPreview: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.bg,
    padding: 11,
    gap: 5,
  },
  stationPreviewName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  stationPreviewAddress: {
    color: colors.textMuted,
    fontSize: 12,
  },
  stationMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  stationMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#0d1e2e",
  },
  stationMetaText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  modalInputWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.bg,
  },
  modalInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  reservationList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 11,
    gap: 6,
  },
  resListTitle: {
    color: "#fde68a",
    fontSize: 12,
    fontWeight: "700",
  },
  resItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  resDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
  },
  resItem: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  modalActions: {
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
  modalConfirmDisabled: {
    opacity: 0.7,
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
