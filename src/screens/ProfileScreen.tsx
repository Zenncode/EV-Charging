import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { carModels } from "../data/cars";
import { colors } from "../theme";
import { ToastMessagePayload } from "../components/ui/toastmessage";
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

const menuItems = [
  "Payment Methods",
  "Charging History",
  "Billing and Invoices",
  "Settings",
  "Help and Support",
];

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
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
  const recentSessions = sessionHistory.slice(0, 4);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={styles.name}>Juan Dela Cruz</Text>
        <Text style={styles.email}>juan.delacruz@email.com</Text>
      </View>

      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Wallet Balance</Text>
        <Text style={styles.walletValue}>PHP {walletBalance.toFixed(2)}</Text>
        <Pressable style={styles.topUpBtn} onPress={onTopUp}>
          <Text style={styles.topUpText}>Top Up + PHP 500</Text>
        </Pressable>
      </View>

      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>Sessions Logged</Text>
          <Text style={styles.analyticsValue}>{sessionHistory.length}</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>Energy Added</Text>
          <Text style={styles.analyticsValue}>{totalEnergy.toFixed(1)} kWh</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsLabel}>Charging Spend</Text>
          <Text style={styles.analyticsValue}>PHP {totalSpend.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My EV Model</Text>
        <FlatList
          data={carModels}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            const active = item.id === selectedCarId;
            return (
              <Pressable
                onPress={() => onSelectCar(item.id)}
                style={[
                  styles.carItem,
                  {
                    borderColor: active ? item.accent : colors.border,
                    backgroundColor: active ? `${item.accent}20` : colors.bgCard,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="car-electric"
                  size={30}
                  color={active ? item.accent : colors.textMuted}
                />
                <Text style={styles.carName}>{item.displayName}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {recentSessions.length === 0 ? (
          <Text style={styles.historyEmpty}>No completed sessions yet. Start charging from Maps.</Text>
        ) : (
          recentSessions.map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyStation}>{entry.stationName}</Text>
                <Text style={styles.historyMeta}>
                  {formatDuration(entry.elapsedSec)} | {entry.energyAddedKwh.toFixed(1)} kWh
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.historyCost}>PHP {entry.estimatedCost.toFixed(2)}</Text>
                <Text style={styles.historyMeta}>{entry.paymentMethod}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item}
            onPress={() => onOpenMenuItem(item)}
            style={[
              styles.menuRow,
              index !== menuItems.length - 1
                ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                : null,
            ]}
          >
            <Text style={styles.menuText}>{item}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
    gap: 12,
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0f2034",
    alignItems: "center",
    paddingVertical: 18,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#31d4f522",
    top: -130,
    right: -80,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#143244",
    borderWidth: 1,
    borderColor: "#31d4f55b",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    marginTop: 10,
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
  },
  email: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 13,
  },
  walletCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#24d6a066",
    backgroundColor: "#123228",
    padding: 14,
  },
  walletLabel: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "700",
  },
  walletValue: {
    marginTop: 6,
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  topUpBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#ffffff2c",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topUpText: {
    color: colors.text,
    fontWeight: "700",
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  analyticsCard: {
    width: "48.8%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 10,
  },
  analyticsLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  analyticsValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  carItem: {
    width: 170,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  carName: {
    marginTop: 8,
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 12,
    gap: 10,
  },
  historyEmpty: {
    color: colors.textMuted,
    fontSize: 12,
  },
  historyRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  historyStation: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  historyCost: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "800",
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  menuRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  menuText: {
    color: colors.text,
    fontWeight: "600",
  },
  signOutBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fb718580",
    backgroundColor: "#fb71851d",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
  },
  signOutText: {
    color: "#fda4af",
    fontWeight: "800",
  },
});
