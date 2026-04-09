import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ToastMessagePayload } from "../components/ui/toastmessage";
import { chargingStations } from "../data/stations";
import { getSessionSnapshot, SESSION_TARGET_PERCENT } from "../sessionMetrics";
import { colors } from "../theme";
import { ActiveSession } from "../types";

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

function formatShortDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${mins}`;
}

const BATTERY_SEGMENT_COUNT = 10;

function getBatteryTone(progress: number) {
  if (progress >= 85) {
    return {
      fill: "#34d399",
      edge: "#10b981",
      shell: "#0d3028",
    };
  }

  if (progress >= 55) {
    return {
      fill: "#2dd4bf",
      edge: "#14b8a6",
      shell: "#0d2f35",
    };
  }

  if (progress >= 30) {
    return {
      fill: "#fbbf24",
      edge: "#f59e0b",
      shell: "#3a2f10",
    };
  }

  return {
    fill: "#fb7185",
    edge: "#f43f5e",
    shell: "#361624",
  };
}

function getChargeState(progress: number) {
  if (progress >= 95) return "Battery full";
  if (progress >= SESSION_TARGET_PERCENT) return "Top-off stage";
  if (progress >= 45) return "Optimal charging";
  return "Boost charging";
}

function getCellCareEfficiency(progress: number) {
  if (progress <= SESSION_TARGET_PERCENT) {
    const headroom = SESSION_TARGET_PERCENT - progress;
    return Math.round(90 + (headroom / SESSION_TARGET_PERCENT) * 8);
  }
  return Math.round(Math.max(76, 90 - (progress - SESSION_TARGET_PERCENT) * 0.7));
}

export function SessionScreen({ activeSession, onStopSession, onOpenMaps, onToast }: SessionScreenProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

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

  if (!activeSession) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.emptyContent}>
        <View style={styles.emptyHero}>
          <View style={styles.emptyGlowPrimary} />
          <View style={styles.emptyGlowSecondary} />
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="battery-alert-variant-outline" size={34} color={colors.cyan} />
          </View>
          <Text style={styles.emptyTitle}>No Active Session</Text>
          <Text style={styles.emptySub}>Start charging from Maps to monitor progress, cost, and energy live.</Text>
          <Pressable style={styles.emptyPrimaryBtn} onPress={onOpenMaps}>
            <MaterialCommunityIcons name="map-marker-path" size={16} color={colors.cyan} />
            <Text style={styles.emptyPrimaryText}>Open Maps</Text>
          </Pressable>
        </View>

        <View style={styles.emptyInfoCard}>
          <Text style={styles.emptyInfoTitle}>What you can track here</Text>
          <View style={styles.emptyInfoRow}>
            <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.cyan} />
            <Text style={styles.emptyInfoText}>Elapsed charging time</Text>
          </View>
          <View style={styles.emptyInfoRow}>
            <MaterialCommunityIcons name="cash-multiple" size={14} color={colors.emerald} />
            <Text style={styles.emptyInfoText}>Real-time session cost</Text>
          </View>
          <View style={styles.emptyInfoRow}>
            <MaterialCommunityIcons name="lightning-bolt-outline" size={14} color={colors.amber} />
            <Text style={styles.emptyInfoText}>Energy added and battery progress</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const progress = Math.max(0, Math.min(100, snapshot.progressPercent));
  const batteryTone = getBatteryTone(progress);
  const batteryState = getChargeState(progress);
  const activeSegments = Math.max(
    1,
    Math.min(BATTERY_SEGMENT_COUNT, Math.round((progress / 100) * BATTERY_SEGMENT_COUNT))
  );
  const chargeRatePerMinute = snapshot.elapsedSec > 0 ? (progress / snapshot.elapsedSec) * 60 : 0;
  const energyFlowPerMinute =
    snapshot.elapsedSec > 0 ? snapshot.energyAddedKwh / (snapshot.elapsedSec / 60) : 0;
  const cellCareEfficiency = getCellCareEfficiency(progress);
  const isTargetStage = progress >= SESSION_TARGET_PERCENT;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>Live Session</Text>
            <Text style={styles.heroTitle}>Charging in Progress</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.heroStation}>{activeSession.stationName}</Text>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaChip}>
            <MaterialCommunityIcons name="clock-start" size={13} color={colors.cyan} />
            <Text style={styles.heroMetaText}>Started {formatShortDateTime(activeSession.startedAt)}</Text>
          </View>
          <View style={styles.heroMetaChip}>
            <MaterialCommunityIcons name="wallet-outline" size={13} color={colors.emerald} />
            <Text style={styles.heroMetaText}>{activeSession.paymentMethod ?? "GCash"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTopRow}>
          <View>
            <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
            <Text style={styles.progressCaption}>Battery level</Text>
            <Text style={[styles.progressState, { color: batteryTone.fill }]}>{batteryState}</Text>
          </View>
          <View style={styles.battery3DWrap}>
            <View style={styles.batteryShadow} />
            <View style={[styles.batteryBody, { borderColor: batteryTone.edge, backgroundColor: batteryTone.shell }]}>
              <View style={styles.batteryGloss} />
              <View style={styles.batteryInner}>
                {Array.from({ length: BATTERY_SEGMENT_COUNT }).map((_, index) => (
                  <View
                    key={`segment-${index}`}
                    style={[
                      styles.batterySegment,
                      {
                        opacity: index < activeSegments ? 1 : 0.18,
                        backgroundColor: index < activeSegments ? batteryTone.fill : "#264257",
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.batterySheen} />
            </View>
            <View style={[styles.batteryCap, { backgroundColor: batteryTone.edge }]} />
            <View style={[styles.batteryBoltBadge, { borderColor: `${batteryTone.fill}88` }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={12} color={batteryTone.fill} />
            </View>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(4, progress)}%`,
                backgroundColor: batteryTone.fill,
              },
            ]}
          />
          <View style={styles.progressTrackGloss} />
        </View>
        <View style={styles.progressMetaRow}>
          <Text style={styles.progressMetaText}>Start 0%</Text>
          <Text style={styles.progressMetaTarget}>Target {SESSION_TARGET_PERCENT}%</Text>
          <Text style={styles.progressMetaText}>Full 100%</Text>
        </View>

        <View style={styles.timerRow}>
          <View style={styles.timerCard}>
            <View style={styles.timerLabelRow}>
              <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.cyan} />
              <Text style={styles.timerLabel}>Elapsed</Text>
            </View>
            <Text style={styles.timerValue}>{formatClock(snapshot.elapsedSec)}</Text>
          </View>
          <View style={styles.timerCard}>
            <View style={styles.timerLabelRow}>
              <MaterialCommunityIcons name="timer-sand" size={14} color={colors.amber} />
              <Text style={styles.timerLabel}>Remaining</Text>
            </View>
            <Text style={styles.timerValue}>{formatClock(snapshot.targetEtaSec)}</Text>
          </View>
        </View>

        <View style={styles.efficiencyCard}>
          <View style={styles.efficiencyHeaderRow}>
            <Text style={styles.efficiencyTitle}>Charging Efficiency</Text>
            <View style={styles.efficiencyBadge}>
              <Text style={[styles.efficiencyBadgeText, { color: batteryTone.fill }]}>
                {cellCareEfficiency}%
              </Text>
            </View>
          </View>
          <Text style={styles.efficiencyHint}>
            {isTargetStage
              ? "Top-off mode is active for safer battery cells and lower thermal stress."
              : `Fast-charge mode is optimized until ${SESSION_TARGET_PERCENT}% for healthier long-term battery life.`}
          </Text>
          <View style={styles.efficiencyMetricsRow}>
            <View style={styles.efficiencyMetric}>
              <Text style={styles.efficiencyMetricLabel}>Charge Rate</Text>
              <Text style={styles.efficiencyMetricValue}>{chargeRatePerMinute.toFixed(1)}%/min</Text>
            </View>
            <View style={styles.efficiencyMetric}>
              <Text style={styles.efficiencyMetricLabel}>Energy Flow</Text>
              <Text style={styles.efficiencyMetricValue}>{energyFlowPerMinute.toFixed(2)} kWh/min</Text>
            </View>
            <View style={styles.efficiencyMetric}>
              <Text style={styles.efficiencyMetricLabel}>Best Zone</Text>
              <Text style={styles.efficiencyMetricValue}>{SESSION_TARGET_PERCENT - 20}-{SESSION_TARGET_PERCENT}%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Energy Added</Text>
          <Text style={styles.statValue}>{snapshot.energyAddedKwh.toFixed(1)} kWh</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Cost So Far</Text>
          <Text style={styles.statValue}>PHP {snapshot.estimatedCost.toFixed(2)}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Station Rate</Text>
          <Text style={styles.statValue}>PHP {(station?.price ?? 18.5).toFixed(1)}/kWh</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Authorized Hold</Text>
          <Text style={styles.statValue}>PHP {(activeSession.authorizedAmount ?? 150).toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Session Actions</Text>
        <View style={styles.actionRow}>
          <Pressable style={[styles.actionBtn, styles.mapBtn]} onPress={onOpenMaps}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={15} color={colors.cyan} />
            <Text style={styles.mapBtnText}>Open Maps</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.stopBtn]} onPress={stopNow}>
            <MaterialCommunityIcons name="stop-circle-outline" size={15} color={colors.rose} />
            <Text style={styles.stopBtnText}>Stop Charging</Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 12,
  },
  emptyContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 12,
  },
  emptyHero: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2136",
    padding: 14,
    alignItems: "center",
    overflow: "hidden",
  },
  emptyGlowPrimary: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#31d4f51b",
    top: -130,
    right: -90,
  },
  emptyGlowSecondary: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#24d6a017",
    bottom: -120,
    left: -90,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#31d4f560",
    backgroundColor: "#0c1a2c",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  emptySub: {
    marginTop: 6,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyPrimaryBtn: {
    marginTop: 12,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#31d4f566",
    backgroundColor: "#31d4f520",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  emptyPrimaryText: {
    color: colors.cyan,
    fontWeight: "700",
  },
  emptyInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 8,
  },
  emptyInfoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyInfoText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2238",
    padding: 14,
    gap: 8,
    overflow: "hidden",
  },
  heroGlowA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#31d4f51c",
    right: -70,
    top: -145,
  },
  heroGlowB: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#24d6a016",
    left: -90,
    bottom: -110,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  heroKicker: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    marginTop: 2,
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  heroStation: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  liveBadge: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#10b98178",
    backgroundColor: "#10b98120",
    paddingHorizontal: 9,
    paddingVertical: 4,
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
  heroMetaRow: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  heroMetaChip: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0a1829c7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroMetaText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 8,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  progressPercent: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "800",
  },
  progressCaption: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  progressState: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
  },
  battery3DWrap: {
    width: 124,
    height: 82,
    justifyContent: "center",
    alignItems: "center",
  },
  batteryShadow: {
    position: "absolute",
    width: 92,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(6, 12, 24, 0.52)",
    bottom: 10,
    transform: [{ scaleX: 1.04 }],
  },
  batteryBody: {
    width: 106,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    shadowColor: "#040912",
    shadowOpacity: 0.38,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    overflow: "hidden",
  },
  batteryGloss: {
    position: "absolute",
    left: 5,
    right: 15,
    top: 4,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  batteryInner: {
    flexDirection: "row",
    gap: 3,
    alignItems: "stretch",
  },
  batterySegment: {
    flex: 1,
    borderRadius: 4,
    minHeight: 28,
  },
  batterySheen: {
    position: "absolute",
    left: 10,
    bottom: 4,
    width: 44,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.13)",
  },
  batteryCap: {
    position: "absolute",
    right: 5,
    width: 7,
    height: 20,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  batteryBoltBadge: {
    position: "absolute",
    right: 14,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(8, 16, 28, 0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    marginTop: 2,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#24384f",
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
  },
  progressTrackGloss: {
    position: "absolute",
    top: 1,
    left: 2,
    right: 2,
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressMetaText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  progressMetaTarget: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "700",
  },
  timerRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  timerCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102236",
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 6,
  },
  timerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  timerValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  efficiencyCard: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2338",
    padding: 10,
    gap: 8,
  },
  efficiencyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  efficiencyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  efficiencyBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f3a52",
    backgroundColor: "#0d1a29",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  efficiencyBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  efficiencyHint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  efficiencyMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  efficiencyMetric: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102741",
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 3,
  },
  efficiencyMetricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  efficiencyMetricValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  statTile: {
    width: "48.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0e1f33",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  statValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  actionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 9,
  },
  actionsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  mapBtn: {
    borderColor: "#22d3ee66",
    backgroundColor: "#22d3ee1a",
  },
  mapBtnText: {
    color: colors.cyan,
    fontWeight: "700",
    fontSize: 12,
  },
  stopBtn: {
    borderColor: "#ff7d8b99",
    backgroundColor: "#ff7d8b24",
  },
  stopBtnText: {
    color: colors.rose,
    fontWeight: "800",
    fontSize: 12,
  },
});
