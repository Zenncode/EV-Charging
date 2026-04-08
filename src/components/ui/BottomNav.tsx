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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#040f1e",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
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
    borderColor: "#16d5a249",
    backgroundColor: "#0a2c31",
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "400",
  },
  labelActive: {
    color: colors.emerald,
    fontWeight: "500",
  },
});
