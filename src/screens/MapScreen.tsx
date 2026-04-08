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
import { ReserveSlotModal, SlotBookingSelection } from "../components/ui/ReserveSlotModal";
import { StationCard } from "../components/ui/StationCard";
import { chargingStations } from "../data/stations";
import { colors } from "../theme";
import { ActiveSession, ChargingSpeed, ChargingStation, ConnectorType, ReservationEntry } from "../types";
import { ToastMessagePayload } from "../components/ui/toastmessage";

const defaultRegion: Region = {
  latitude: 14.585,
  longitude: 121.0573,
  latitudeDelta: 0.18,
  longitudeDelta: 0.12,
};

const speedFilters: Array<"All" | ChargingSpeed> = ["All", "Slow", "Fast", "Ultra Fast"];
const connectorFilters: Array<"All" | ConnectorType> = ["All", "CCS", "Type 2", "CHAdeMO", "Tesla"];

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
  const [speedFilter, setSpeedFilter] = useState<"All" | ChargingSpeed>("All");
  const [connectorFilter, setConnectorFilter] = useState<"All" | ConnectorType>("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftSortByNearest, setDraftSortByNearest] = useState(true);
  const [draftSpeedFilter, setDraftSpeedFilter] = useState<"All" | ChargingSpeed>("All");
  const [draftConnectorFilter, setDraftConnectorFilter] = useState<"All" | ConnectorType>("All");
  const [draftAvailableOnly, setDraftAvailableOnly] = useState(false);
  const [region, setRegion] = useState<Region>(defaultRegion);
  const [userCoord, setUserCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reserveStation, setReserveStation] = useState<ChargingStation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSheetHidden, setIsSheetHidden] = useState(false);

  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.max(280, Math.round(windowHeight * 0.48));
  const hiddenSheetOffset = sheetHeight + 26;
  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  const filteredStations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = chargingStations.filter((station) => {
      const connectorSearch = station.connectorTypes.join(" ").toLowerCase();
      if (
        q &&
        !station.name.toLowerCase().includes(q) &&
        !station.address.toLowerCase().includes(q) &&
        !station.speed.toLowerCase().includes(q) &&
        !connectorSearch.includes(q)
      ) {
        return false;
      }
      if (speedFilter !== "All" && station.speed !== speedFilter) {
        return false;
      }
      if (connectorFilter !== "All" && !station.connectorTypes.includes(connectorFilter)) {
        return false;
      }
      if (availableOnly && station.availableChargers <= 0) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => (sortByNearest ? a.distance - b.distance : b.distance - a.distance));
  }, [availableOnly, connectorFilter, search, sortByNearest, speedFilter]);

  const activeFilterCount =
    (speedFilter !== "All" ? 1 : 0) +
    (connectorFilter !== "All" ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (!sortByNearest ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setSortByNearest(true);
    setSpeedFilter("All");
    setConnectorFilter("All");
    setAvailableOnly(false);
  };

  const openFilterModal = () => {
    setDraftSortByNearest(sortByNearest);
    setDraftSpeedFilter(speedFilter);
    setDraftConnectorFilter(connectorFilter);
    setDraftAvailableOnly(availableOnly);
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const applyFilters = () => {
    setSortByNearest(draftSortByNearest);
    setSpeedFilter(draftSpeedFilter);
    setConnectorFilter(draftConnectorFilter);
    setAvailableOnly(draftAvailableOnly);
    setIsFilterModalOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftSortByNearest(true);
    setDraftSpeedFilter("All");
    setDraftConnectorFilter("All");
    setDraftAvailableOnly(false);
  };

  const resetAllFiltersFromModal = () => {
    resetFilters();
    resetDraftFilters();
    setIsFilterModalOpen(false);
  };

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

  const submitReservation = (selection: SlotBookingSelection) => {
    if (!reserveStation) return;
    const slotLabel = `${selection.dateLabel} • ${selection.timeLabel}`;
    onCreateReservation(reserveStation.id, slotLabel);
    setReserveStation(null);
    onToast({
      title: "Reservation added",
      message: `${reserveStation.name} at ${selection.timeLabel} on ${selection.dateLabel}.`,
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
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Explore Chargers</Text>
            <Text style={styles.headerSub}>Search and filter stations by speed, connector, and availability.</Text>
          </View>
          <Pressable style={styles.headerLocateBtn} onPress={requestLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search stations, speed, or connector..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
          <Pressable
            style={[styles.inlineFilterBtn, activeFilterCount > 0 && styles.inlineFilterBtnActive]}
            onPress={openFilterModal}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={18}
              color={activeFilterCount > 0 ? colors.emerald : colors.text}
            />
            {activeFilterCount > 0 ? (
              <View style={styles.inlineFilterBadge}>
                <Text style={styles.inlineFilterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

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
        {filteredStations.length === 0 ? (
          <Text style={styles.emptyFilterText}>No stations match your current filters.</Text>
        ) : null}
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isUnavailable = item.availableChargers <= 0;
            const hasDifferentActiveSession = activeSession ? activeSession.stationId !== item.id : false;

            return (
              <StationCard
                station={item}
                isFavorite={favoriteIds.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
                onReserve={() => setReserveStation(item)}
                onNavigate={openNavigation}
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

      <Modal visible={isFilterModalOpen} transparent animationType="slide" onRequestClose={closeFilterModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Filters</Text>
                <Text style={styles.modalSub}>Adjust speed and connector type</Text>
              </View>
              <Pressable style={styles.modalCloseBtn} onPress={closeFilterModal}>
                <MaterialCommunityIcons name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.filterLabel}>Charging Speed</Text>
            <View style={styles.filterWrap}>
              {speedFilters.map((item) => {
                const active = draftSpeedFilter === item;
                return (
                  <Pressable
                    key={`speed-modal-${item}`}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setDraftSpeedFilter(item)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {item === "All" ? "All Speeds" : item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>Connector Type</Text>
            <View style={styles.filterWrap}>
              {connectorFilters.map((item) => {
                const active = draftConnectorFilter === item;
                return (
                  <Pressable
                    key={`connector-modal-${item}`}
                    style={[styles.filterChip, active && styles.filterChipActiveSecondary]}
                    onPress={() => setDraftConnectorFilter(item)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {item === "All" ? "All Connectors" : item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.filterWrap}>
              <Pressable
                style={[styles.filterChip, draftSortByNearest && styles.filterChipActive]}
                onPress={() => setDraftSortByNearest(true)}
              >
                <Text style={[styles.filterChipText, draftSortByNearest && styles.filterChipTextActive]}>
                  Nearest
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterChip, !draftSortByNearest && styles.filterChipActive]}
                onPress={() => setDraftSortByNearest(false)}
              >
                <Text style={[styles.filterChipText, !draftSortByNearest && styles.filterChipTextActive]}>
                  Farthest
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.availabilityToggle, draftAvailableOnly && styles.availabilityToggleActive]}
              onPress={() => setDraftAvailableOnly((prev) => !prev)}
            >
              <MaterialCommunityIcons
                name={draftAvailableOnly ? "check-decagram" : "checkbox-blank-circle-outline"}
                size={15}
                color={draftAvailableOnly ? colors.emerald : colors.textMuted}
              />
              <Text
                style={[
                  styles.availabilityToggleText,
                  draftAvailableOnly && styles.availabilityToggleTextActive,
                ]}
              >
                Available chargers only
              </Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={resetAllFiltersFromModal}>
                <Text style={styles.modalCancelText}>Reset</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalConfirm]} onPress={applyFilters}>
                <Text style={styles.modalConfirmText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ReserveSlotModal
        visible={reserveStation !== null}
        station={reserveStation}
        queue={reserveStation ? reservationsByStation[reserveStation.id] ?? [] : []}
        onClose={() => setReserveStation(null)}
        onConfirm={submitReservation}
      />
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
    marginHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: "rgba(7, 14, 24, 0.74)",
    gap: 8,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  header: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  headerSub: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  headerLocateBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(8, 17, 28, 0.9)",
    alignItems: "center",
    justifyContent: "center",
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineFilterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(8, 17, 28, 0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineFilterBtnActive: {
    borderColor: "#24d6a066",
    backgroundColor: "#24d6a022",
  },
  inlineFilterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#052e16",
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineFilterBadgeText: {
    color: "#02231a",
    fontSize: 10,
    fontWeight: "800",
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  filterLabel: {
    marginTop: 2,
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#081727",
  },
  filterChipActive: {
    borderColor: "#31d4f566",
    backgroundColor: "#31d4f522",
  },
  filterChipActiveSecondary: {
    borderColor: "#f4b24566",
    backgroundColor: "#f4b24523",
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: colors.text,
  },
  emptyFilterText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "700",
  },
  errorText: {
    color: colors.rose,
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
  filterModalCard: {
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
  availabilityToggle: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.bg,
  },
  availabilityToggleActive: {
    borderColor: "#24d6a066",
    backgroundColor: "#24d6a023",
  },
  availabilityToggleText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  availabilityToggleTextActive: {
    color: colors.emerald,
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
