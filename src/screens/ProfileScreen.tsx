import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ToastMessagePayload } from "../components/ui/toastmessage";
import { carModels } from "../data/cars";
import { colors } from "../theme";
import { SessionHistoryEntry } from "../types";

interface ProfileScreenProps {
  walletBalance: number;
  selectedCarId: string;
  sessionHistory: SessionHistoryEntry[];
  onTopUp: () => void;
  onSelectCar: (carId: string) => void;
  onSignOut: () => void;
  onOpenMenuItem: (item: string) => void;
  onToast: (toast: ToastMessagePayload) => void;
}

const menuItems: Array<{
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { label: "Payment Methods", icon: "credit-card-outline" },
  { label: "Charging History", icon: "history" },
  { label: "Billing and Invoices", icon: "file-document-outline" },
  { label: "Settings", icon: "cog-outline" },
  { label: "Help and Support", icon: "help-circle-outline" },
];

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

function formatTotalTime(totalMinutes: number) {
  if (totalMinutes >= 60) return `${(totalMinutes / 60).toFixed(1)}h`;
  return `${totalMinutes}m`;
}

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

export function ProfileScreen({
  walletBalance,
  selectedCarId,
  sessionHistory,
  onTopUp,
  onSelectCar,
  onSignOut,
  onOpenMenuItem,
  onToast,
}: ProfileScreenProps) {
  const handleSignOut = () => {
    onToast({
      title: "Sign out",
      message: "Your local session data will be reset on this device.",
      tone: "warning",
      durationMs: 0,
      secondaryAction: { label: "Cancel", tone: "neutral" },
      primaryAction: { label: "Sign Out", tone: "destructive", onPress: onSignOut },
    });
  };

  const totalEnergy = sessionHistory.reduce((sum, item) => sum + item.energyAddedKwh, 0);
  const totalSpend = sessionHistory.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalMinutes = Math.floor(
    sessionHistory.reduce((sum, item) => sum + item.elapsedSec, 0) / 60
  );

  const averageEnergy = sessionHistory.length > 0 ? totalEnergy / sessionHistory.length : 0;
  const averageSpend = sessionHistory.length > 0 ? totalSpend / sessionHistory.length : 0;
  const averageProgress =
    sessionHistory.length > 0
      ? sessionHistory.reduce((sum, item) => sum + item.progressPercent, 0) / sessionHistory.length
      : 0;
  const averageSessionDurationSec =
    sessionHistory.length > 0
      ? Math.round(sessionHistory.reduce((sum, item) => sum + item.elapsedSec, 0) / sessionHistory.length)
      : 0;

  const selectedCar = carModels.find((car) => car.id === selectedCarId) ?? carModels[0];
  const recentSessions = sessionHistory.slice(0, 4);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />

        <View style={styles.heroTopRow}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.identityTextWrap}>
              <Text style={styles.name}>Juan Dela Cruz</Text>
              <Text style={styles.email}>juan.delacruz@email.com</Text>
            </View>
          </View>
          <View style={styles.tierBadge}>
            <MaterialCommunityIcons name="shield-check-outline" size={14} color={colors.emerald} />
            <Text style={styles.tierText}>Smart Driver</Text>
          </View>
        </View>

        <View style={styles.linkedCarBadge}>
          <MaterialCommunityIcons name="car-electric" size={14} color={colors.cyan} />
          <Text style={styles.linkedCarText}>{selectedCar.displayName}</Text>
        </View>

        <View style={styles.heroStatGrid}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatLabel}>Sessions</Text>
            <Text style={styles.heroStatValue}>{sessionHistory.length}</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatLabel}>Energy</Text>
            <Text style={styles.heroStatValue}>{totalEnergy.toFixed(1)} kWh</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatLabel}>Spend</Text>
            <Text style={styles.heroStatValue}>PHP {totalSpend.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <View style={styles.walletTextWrap}>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletValue}>PHP {walletBalance.toFixed(2)}</Text>
            <Text style={styles.walletHint}>Ready for your next charging session</Text>
          </View>
          <Pressable style={styles.topUpBtn} onPress={onTopUp}>
            <MaterialCommunityIcons name="plus" size={15} color="#03201a" />
            <Text style={styles.topUpText}>Top Up</Text>
          </Pressable>
        </View>

        <View style={styles.walletMetaRow}>
          <View style={styles.walletMetaChip}>
            <MaterialCommunityIcons name="flash-outline" size={14} color={colors.amber} />
            <Text style={styles.walletMetaText}>Avg/session PHP {averageSpend.toFixed(2)}</Text>
          </View>
          <View style={styles.walletMetaChip}>
            <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.cyan} />
            <Text style={styles.walletMetaText}>Charging time {formatTotalTime(totalMinutes)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Linked EV</Text>
          <Text style={styles.sectionHint}>Tap a model to switch</Text>
        </View>

        <FlatList
          data={carModels}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carListContent}
          renderItem={({ item }) => {
            const active = item.id === selectedCarId;
            return (
              <Pressable
                onPress={() => onSelectCar(item.id)}
                style={[
                  styles.carItem,
                  active && {
                    borderColor: item.accent,
                    backgroundColor: `${item.accent}24`,
                  },
                ]}
              >
                <View style={[styles.carIconWrap, active && { backgroundColor: `${item.accent}1f` }]}>
                  <MaterialCommunityIcons
                    name="car-electric"
                    size={24}
                    color={active ? item.accent : colors.textMuted}
                  />
                </View>
                <Text style={styles.carBrand}>{item.brand}</Text>
                <Text style={styles.carName}>{item.model}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Charging Insights</Text>
          <Text style={styles.sectionHint}>From your recent activity</Text>
        </View>
        <View style={styles.insightGrid}>
          <View style={styles.insightTile}>
            <Text style={styles.insightLabel}>Avg Energy</Text>
            <Text style={styles.insightValue}>{averageEnergy.toFixed(1)} kWh</Text>
          </View>
          <View style={styles.insightTile}>
            <Text style={styles.insightLabel}>Avg Spend</Text>
            <Text style={styles.insightValue}>PHP {averageSpend.toFixed(2)}</Text>
          </View>
          <View style={styles.insightTile}>
            <Text style={styles.insightLabel}>Completion</Text>
            <Text style={styles.insightValue}>{averageProgress.toFixed(0)}%</Text>
          </View>
          <View style={styles.insightTile}>
            <Text style={styles.insightLabel}>Avg Duration</Text>
            <Text style={styles.insightValue}>{formatDuration(averageSessionDurationSec)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <Text style={styles.sectionHint}>{recentSessions.length} records</Text>
        </View>
        {recentSessions.length === 0 ? (
          <Text style={styles.historyEmpty}>No completed sessions yet. Start charging from Maps.</Text>
        ) : (
          recentSessions.map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIconWrap}>
                  <MaterialCommunityIcons name="ev-station" size={14} color={colors.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyStation}>{entry.stationName}</Text>
                  <Text style={styles.historyMeta}>
                    {formatShortDate(entry.endedAt)} | {formatDuration(entry.elapsedSec)} |{" "}
                    {entry.energyAddedKwh.toFixed(1)} kWh
                  </Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyCost}>PHP {entry.estimatedCost.toFixed(2)}</Text>
                <Text style={styles.historyPay}>{entry.paymentMethod}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => onOpenMenuItem(item.label)}
            style={[
              styles.menuRow,
              index !== menuItems.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null,
            ]}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconWrap}>
                <MaterialCommunityIcons name={item.icon} size={16} color={colors.cyan} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
        <MaterialCommunityIcons name="logout" size={16} color={colors.rose} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
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
    paddingTop: 14,
    paddingBottom: 22,
    gap: 12,
  },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2036",
    padding: 14,
    gap: 12,
    overflow: "hidden",
  },
  heroGlowPrimary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#24d6a01f",
    left: -90,
    top: -120,
  },
  heroGlowSecondary: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#31d4f519",
    right: -90,
    top: -90,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  identityRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  identityTextWrap: {
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#31d4f566",
    backgroundColor: "#14364a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  email: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  tierBadge: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#24d6a066",
    backgroundColor: "#24d6a01f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tierText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "700",
  },
  linkedCarBadge: {
    alignSelf: "flex-start",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#31d4f560",
    backgroundColor: "#31d4f51c",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkedCarText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  heroStatGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#08182acc",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  heroStatValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  walletCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#24d6a066",
    backgroundColor: "#10312d",
    padding: 14,
    gap: 10,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  walletTextWrap: {
    flex: 1,
  },
  walletLabel: {
    color: "#9ee8d0",
    fontSize: 12,
    fontWeight: "700",
  },
  walletValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 29,
    fontWeight: "800",
  },
  walletHint: {
    marginTop: 3,
    color: "#c8e6dc",
    fontSize: 11,
  },
  topUpBtn: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: colors.emerald,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  topUpText: {
    color: "#03201a",
    fontWeight: "800",
    fontSize: 12,
  },
  walletMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  walletMetaChip: {
    flex: 1,
    minWidth: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9ee8d033",
    backgroundColor: "#0a2522",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  walletMetaText: {
    color: "#d1f5e8",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  carListContent: {
    gap: 10,
    paddingRight: 2,
  },
  carItem: {
    width: 152,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#102134",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "flex-start",
    gap: 6,
  },
  carIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a1726",
  },
  carBrand: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  carName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  insightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  insightTile: {
    width: "48.5%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0b1a2d",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  insightLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  insightValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  historyEmpty: {
    color: colors.textMuted,
    fontSize: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: "#0b1a2d",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  historyLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#10b9815b",
    backgroundColor: "#10b9811d",
    alignItems: "center",
    justifyContent: "center",
  },
  historyStation: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  historyMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  historyCost: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "800",
  },
  historyPay: {
    color: colors.textMuted,
    fontSize: 11,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  menuRow: {
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0c1a2b",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  signOutBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fb718580",
    backgroundColor: "#fb71851d",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  signOutText: {
    color: "#fda4af",
    fontWeight: "800",
    fontSize: 13,
  },
});
