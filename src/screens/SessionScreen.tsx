import { useEffect, useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { chargingStations } from "../data/stations";
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

  const elapsedSec = useMemo(() => {
    if (!activeSession) return 0;
    const start = new Date(activeSession.startedAt).getTime();
    if (!Number.isFinite(start)) return 0;
    return Math.max(0, Math.floor((Date.now() - start) / 1000));
  }, [activeSession, tick]);

  if (!activeSession) {
    return (
      <View style={[styles.emptyContainer, styles.center]}>
        <MaterialCommunityIcons name="battery-alert-variant-outline" size={34} color="#0f766e" />
        <Text style={styles.emptyTitle}>No Active Session</Text>
        <Text style={styles.emptySub}>Start charging from Maps to track your live session.</Text>
        <Pressable style={styles.openMapBtn} onPress={onOpenMaps}>
          <Text style={styles.openMapText}>Open Maps</Text>
        </Pressable>
      </View>
    );
  }

  const chargeRatePerSecond = 0.35;
  const progress = Math.min(100, 2 + elapsedSec * chargeRatePerSecond);
  const targetPercent = 80;
  const remainingToTarget = Math.max(0, targetPercent - progress);
  const targetEtaSec = Math.ceil(remainingToTarget / chargeRatePerSecond);
  const energyAdded = (progress / 100) * 60;
  const station = chargingStations.find((item) => item.id === activeSession.stationId);
  const estimatedCost = energyAdded * (station?.price ?? 18.5);

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
          <MaterialCommunityIcons name="close" size={18} color="#ef4444" />
        </Pressable>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.batteryWrap}>
          <View style={styles.batteryBody}>
            <MaterialCommunityIcons name="battery-charging-70" size={34} color="#10b981" />
          </View>
        </View>

        <Text style={styles.percentText}>{progress.toFixed(1)}%</Text>
        <Text style={styles.percentLabel}>Battery Level</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(4, progress)}%` }]} />
        </View>
        <View style={styles.progressMetaRow}>
          <Text style={styles.metaText}>Start: 0%</Text>
          <Text style={styles.metaTarget}>Target: 80%</Text>
          <Text style={styles.metaText}>Full: 100%</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#3b82f6" />
              <Text style={styles.statLabel}>Elapsed Time</Text>
            </View>
            <Text style={styles.statValue}>{formatClock(elapsedSec)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="timer-sand" size={14} color="#a855f7" />
              <Text style={styles.statLabel}>Time Remaining</Text>
            </View>
            <Text style={styles.statValue}>{formatClock(targetEtaSec)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="cash-multiple" size={14} color="#22c55e" />
              <Text style={styles.statLabel}>Current Cost</Text>
            </View>
            <Text style={styles.statValue}>PHP {estimatedCost.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={14} color="#f59e0b" />
              <Text style={styles.statLabel}>Energy Added</Text>
            </View>
            <Text style={styles.statValue}>{energyAdded.toFixed(1)} kWh</Text>
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
    backgroundColor: "#e9eded",
  },
  content: {
    paddingBottom: 18,
    gap: 10,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#e9eded",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 10,
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
  },
  emptySub: {
    marginTop: 8,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 19,
  },
  openMapBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#22d3ee66",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#22d3ee1a",
  },
  openMapText: {
    color: "#0e7490",
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#e8f1ef",
    borderBottomWidth: 1,
    borderBottomColor: "#d8e3e1",
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#1e293b",
    fontSize: 19,
    fontWeight: "800",
  },
  headerSub: {
    marginTop: 1,
    color: "#64748b",
    fontSize: 11,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f4f3",
    borderWidth: 1,
    borderColor: "#d4d8d7",
  },
  mainCard: {
    marginHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d7dddb",
    backgroundColor: "#f3f4f4",
    padding: 12,
  },
  batteryWrap: {
    alignItems: "center",
    marginTop: 2,
  },
  batteryBody: {
    width: 70,
    height: 130,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#bcc7c5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  percentText: {
    marginTop: 10,
    textAlign: "center",
    color: "#0f172a",
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "800",
  },
  percentLabel: {
    marginTop: 1,
    textAlign: "center",
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#d6dce1",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#14b8a6",
  },
  progressMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    color: "#64748b",
    fontSize: 12,
  },
  metaTarget: {
    color: "#0d9488",
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d6dbda",
    backgroundColor: "#ecefee",
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
    color: "#64748b",
    fontSize: 11,
    fontWeight: "500",
  },
  statValue: {
    marginTop: 8,
    color: "#111827",
    fontSize: 27,
    lineHeight: 30,
    fontWeight: "800",
  },
  detailsCard: {
    marginHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7dddb",
    backgroundColor: "#f3f4f4",
    padding: 12,
    gap: 8,
  },
  detailsTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  detailValue: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
  stopBtn: {
    marginTop: 4,
    borderRadius: 10,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ef444499",
    backgroundColor: "#ef444420",
    alignItems: "center",
    justifyContent: "center",
  },
  stopText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "800",
  },
});
