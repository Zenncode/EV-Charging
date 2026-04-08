import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { TabKey } from "../../types";

interface BottomNavProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

const items: {
  key: TabKey;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { key: "Home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { key: "Maps", label: "Maps", icon: "map-marker-outline", activeIcon: "map-marker" },
  { key: "Favorites", label: "Favorites", icon: "heart-outline", activeIcon: "heart" },
  { key: "Session", label: "Session", icon: "lightning-bolt-outline", activeIcon: "lightning-bolt" },
  { key: "Profile", label: "Profile", icon: "account-outline", activeIcon: "account" },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.navCard}>
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => onChange(item.key)}
            >
              <MaterialCommunityIcons
                name={isActive ? item.activeIcon : item.icon}
                size={21}
                color={isActive ? colors.emerald : colors.textMuted}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 12,
  },
  navCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#071324",
    borderRadius: 18,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minHeight: 50,
    borderRadius: 14,
  },
  itemActive: {
    borderWidth: 1,
    borderColor: "#24d6a056",
    backgroundColor: "#0d2b36",
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.emerald,
    fontWeight: "700",
  },
});
