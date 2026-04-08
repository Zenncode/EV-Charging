import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { carModels } from "../data/cars";
import { colors } from "../theme";
import { ToastMessagePayload } from "../components/ui/toastmessage";

interface ProfileScreenProps {
  walletBalance: number;
  selectedCarId: string;
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

export function ProfileScreen({
  walletBalance,
  selectedCarId,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
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
    paddingBottom: 20,
    gap: 12,
  },
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    paddingVertical: 18,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#0ea5e942",
    borderWidth: 1,
    borderColor: "#38bdf855",
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
    borderColor: "#a855f766",
    backgroundColor: "#a855f724",
    padding: 14,
  },
  walletLabel: {
    color: "#f5d0fe",
    fontSize: 12,
  },
  walletValue: {
    marginTop: 6,
    color: colors.text,
    fontSize: 30,
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
