import { useEffect, useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { chargingStations } from "../data/stations";
import { getSessionSnapshot } from "../sessionMetrics";
import { colors } from "../theme";
import { ActiveSession } from "../types";
import { ToastMessagePayload } from "../components/ui/toastmessage";

interface SessionScreenProps {
  activeSession: ActiveSession | null;
  onStopSession: () => void;
  onOpenMaps: () => void;
  onToast: (toast: ToastMessagePayload) => void;
}

function formatClock(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function SessionScreen({ activeSession, onStopSession, onOpenMaps, onToast }: SessionScreenProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const station = activeSession
    ? chargingStations.find((item) => item.id === activeSession.stationId)
    : undefined;

  const snapshot = useMemo(() => {
    if (!activeSession) {
      return {
        elapsedSec: 0,
        progressPercent: 0,
        targetEtaSec: 0,
        energyAddedKwh: 0,
        estimatedCost: 0,
      };
    }
    return getSessionSnapshot(activeSession.startedAt, station?.price ?? 18.5);
  }, [activeSession, station?.price, tick]);

  if (!activeSession) {
    return (
      <View style={[styles.emptyContainer, styles.center]}>
        <MaterialCommunityIcons name="battery-alert-variant-outline" size={34} color={colors.cyan} />
        <Text style={styles.emptyTitle}>No Active Session</Text>
        <Text style={styles.emptySub}>Start charging from Maps to track your live session.</Text>
        <Pressable style={styles.openMapBtn} onPress={onOpenMaps}>
          <Text style={styles.openMapText}>Open Maps</Text>
        </Pressable>
      </View>
    );
  }

  const stopNow = () => {
    onToast({
      title: "Stop charging?",
      message: "You will be charged for energy used so far.",
      tone: "warning",
      durationMs: 0,
      secondaryAction: { label: "Cancel", tone: "neutral" },
      primaryAction: { label: "Stop", tone: "destructive", onPress: onStopSession },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Charging in Progress</Text>
          <Text style={styles.headerSub}>{activeSession.stationName}</Text>
        </View>
        <Pressable style={styles.closeBtn} onPress={onOpenMaps}>
          <MaterialCommunityIcons name="close" size={18} color={colors.rose} />
        </Pressable>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.mainGlow} />
        <View style={styles.batteryWrap}>
          <View style={styles.batteryBody}>
            <MaterialCommunityIcons name="battery-charging-70" size={34} color={colors.emerald} />
          </View>
        </View>

        <Text style={styles.percentText}>{snapshot.progressPercent.toFixed(1)}%</Text>
        <Text style={styles.percentLabel}>Battery Level</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(4, snapshot.progressPercent)}%` }]} />
        </View>
        <View style={styles.progressMetaRow}>
          <Text style={styles.metaText}>Start: 0%</Text>
          <Text style={styles.metaTarget}>Target: 80%</Text>
          <Text style={styles.metaText}>Full: 100%</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.cyan} />
              <Text style={styles.statLabel}>Elapsed Time</Text>
            </View>
            <Text style={styles.statValue}>{formatClock(snapshot.elapsedSec)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="timer-sand" size={14} color={colors.amber} />
              <Text style={styles.statLabel}>Time Remaining</Text>
            </View>
            <Text style={styles.statValue}>{formatClock(snapshot.targetEtaSec)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="cash-multiple" size={14} color={colors.emerald} />
              <Text style={styles.statLabel}>Current Cost</Text>
            </View>
            <Text style={styles.statValue}>PHP {snapshot.estimatedCost.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={14} color={colors.lime} />
              <Text style={styles.statLabel}>Energy Added</Text>
            </View>
            <Text style={styles.statValue}>{snapshot.energyAddedKwh.toFixed(1)} kWh</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Session Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method</Text>
          <Text style={styles.detailValue}>{activeSession.paymentMethod ?? "GCash"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Authorized Amount</Text>
          <Text style={styles.detailValue}>PHP {(activeSession.authorizedAmount ?? 150).toFixed(0)}</Text>
        </View>
        {station ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Station Rate</Text>
            <Text style={styles.detailValue}>PHP {station.price.toFixed(1)}/kWh</Text>
          </View>
        ) : null}
        <Pressable style={styles.stopBtn} onPress={stopNow}>
          <Text style={styles.stopText}>Stop Charging</Text>
        </Pressable>
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
    paddingBottom: 20,
    gap: 12,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  emptySub: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 19,
  },
  openMapBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#31d4f566",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#31d4f520",
  },
  openMapText: {
    color: colors.cyan,
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#0d1b2c",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  headerSub: {
    marginTop: 1,
    color: colors.textMuted,
    fontSize: 12,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111f30",
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainCard: {
    marginHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    overflow: "hidden",
  },
  mainGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#24d6a018",
    top: -170,
    right: -90,
  },
  batteryWrap: {
    alignItems: "center",
    marginTop: 2,
  },
  batteryBody: {
    width: 70,
    height: 130,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2f4256",
    backgroundColor: "#0a1624",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.emerald,
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  percentText: {
    marginTop: 10,
    textAlign: "center",
    color: colors.text,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "800",
  },
  percentLabel: {
    marginTop: 1,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#23374d",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
    backgroundColor: colors.emerald,
  },
  progressMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metaTarget: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  statCard: {
    width: "48.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102234",
    paddingHorizontal: 9,
    paddingVertical: 8,
    minHeight: 70,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  statValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
  },
  detailsCard: {
    marginHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 8,
  },
  detailsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  detailValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  stopBtn: {
    marginTop: 4,
    borderRadius: 10,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ff7d8b99",
    backgroundColor: "#ff7d8b24",
    alignItems: "center",
    justifyContent: "center",
  },
  stopText: {
    color: colors.rose,
    fontSize: 13,
    fontWeight: "800",
  },
});
