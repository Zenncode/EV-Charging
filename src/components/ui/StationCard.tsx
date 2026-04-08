import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { ChargingStation } from "../../types";

interface StationCardProps {
  station: ChargingStation;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onReserve: (station: ChargingStation) => void;
  onStartSession?: (station: ChargingStation) => void;
  reservationCount?: number;
  startDisabled?: boolean;
  startDisabledText?: string;
}

export function StationCard({
  station,
  isFavorite,
  onToggleFavorite,
  onReserve,
  onStartSession,
  reservationCount = 0,
  startDisabled = false,
  startDisabledText,
}: StationCardProps) {
  const availabilityColor = station.availableChargers > 0 ? colors.emerald : "#f97316";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{station.name}</Text>
          <Text style={styles.address}>{station.address}</Text>
        </View>
        <Pressable onPress={() => onToggleFavorite(station.id)} style={styles.iconButton}>
          <MaterialCommunityIcons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#fb7185" : colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={[styles.badge, { backgroundColor: `${availabilityColor}22` }]}>
        <Text style={[styles.badgeText, { color: availabilityColor }]}>
          {station.availableChargers}/{station.totalChargers} available
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metricText}>PHP {station.price.toFixed(1)}/kWh</Text>
        </View>
        <View style={styles.metricItem}>
          <MaterialCommunityIcons name="star-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metricText}>{station.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.metricItem}>
          <MaterialCommunityIcons name="map-marker-distance" size={14} color={colors.textMuted} />
          <Text style={styles.metricText}>{station.distance.toFixed(1)} km</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Speed: {station.speed}</Text>
        <Text style={styles.infoText}>Open: {station.openingHours}</Text>
      </View>

      {reservationCount > 0 ? <Text style={styles.reservedText}>Reservations: {reservationCount}</Text> : null}
      {startDisabledText ? <Text style={styles.disabledHint}>{startDisabledText}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, styles.reserveBtn]} onPress={() => onReserve(station)}>
          <Text style={styles.reserveText}>Reserve</Text>
        </Pressable>
        {onStartSession ? (
          <Pressable
            disabled={startDisabled}
            style={[styles.actionBtn, styles.startBtn, startDisabled && styles.startBtnDisabled]}
            onPress={() => onStartSession(station)}
          >
            <Text style={[styles.startText, startDisabled && styles.startTextDisabled]}>
              {startDisabled ? "Unavailable" : "Start"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  address: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    borderRadius: 99,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  reservedText: {
    color: "#fde68a",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledHint: {
    color: "#fda4af",
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reserveBtn: {
    borderWidth: 1,
    borderColor: "#fbbf24aa",
    backgroundColor: "#f59e0b1f",
  },
  startBtn: {
    borderWidth: 1,
    borderColor: "#34d399aa",
    backgroundColor: "#10b98125",
  },
  startBtnDisabled: {
    borderColor: "#64748b66",
    backgroundColor: "#3341554f",
  },
  reserveText: {
    color: "#fbbf24",
    fontWeight: "700",
  },
  startText: {
    color: colors.emerald,
    fontWeight: "700",
  },
  startTextDisabled: {
    color: colors.textMuted,
  },
});