import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import { ChargingStation, ChargingSpeed, ReservationEntry } from "../../types";

export interface SlotBookingSelection {
  dateLabel: string;
  dateValue: string;
  timeLabel: string;
}

interface ReserveSlotModalProps {
  visible: boolean;
  station: ChargingStation | null;
  queue: ReservationEntry[];
  onClose: () => void;
  onConfirm: (selection: SlotBookingSelection) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const TIME_SLOTS = [
  "12:00 AM",
  "2:00 AM",
  "4:00 AM",
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "6:00 PM",
  "8:00 PM",
  "10:00 PM",
] as const;

function speedToChargerType(speed: ChargingSpeed) {
  if (speed === "Slow") return "Level 2";
  if (speed === "Fast") return "DC Fast";
  return "Ultra Fast";
}

export function ReserveSlotModal({ visible, station, queue, onClose, onConfirm }: ReserveSlotModalProps) {
  const dateOptions = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const weekday = WEEKDAYS[date.getDay()];
      const month = MONTHS[date.getMonth()];
      const day = date.getDate();
      return {
        key: date.toISOString().slice(0, 10),
        weekday,
        month,
        day,
        label: `${weekday}, ${month} ${day}`,
      };
    });
  }, []);

  const [selectedDateKey, setSelectedDateKey] = useState(dateOptions[0]?.key ?? "");
  const [selectedTime, setSelectedTime] = useState<(typeof TIME_SLOTS)[number]>("8:00 PM");

  useEffect(() => {
    if (!visible) return;
    setSelectedDateKey(dateOptions[0]?.key ?? "");
    setSelectedTime("8:00 PM");
  }, [dateOptions, visible, station?.id]);

  if (!station) return null;

  const selectedDate = dateOptions.find((item) => item.key === selectedDateKey) ?? dateOptions[0];
  if (!selectedDate) return null;

  const connector = station.connectorTypes[0] ?? "CCS";
  const chargerType = speedToChargerType(station.speed);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Pressable style={styles.headerBackBtn} onPress={onClose}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Select a Slot</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Charger Settings</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconWrap}>
                  <MaterialCommunityIcons name="flash" size={14} color={colors.cyan} />
                </View>
                <Text style={styles.settingLabel}>Charger Type</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{chargerType}</Text>
                <MaterialCommunityIcons name="check-circle" size={14} color={colors.emerald} />
              </View>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconWrap}>
                  <MaterialCommunityIcons name="power-plug-outline" size={14} color={colors.cyan} />
                </View>
                <Text style={styles.settingLabel}>Connector</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{connector}</Text>
                <MaterialCommunityIcons name="check-circle" size={14} color={colors.emerald} />
              </View>
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Pick a Date</Text>
            <View style={styles.dateRow}>
              {dateOptions.map((item) => {
                const active = item.key === selectedDateKey;
                return (
                  <Pressable
                    key={item.key}
                    style={[styles.dateChip, active && styles.dateChipActive]}
                    onPress={() => setSelectedDateKey(item.key)}
                  >
                    <Text style={[styles.dateWeek, active && styles.dateWeekActive]}>{item.weekday}</Text>
                    <Text style={[styles.dateMain, active && styles.dateMainActive]}>
                      {item.month} {item.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.timeLabel}>Select a Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => {
                const active = slot === selectedTime;
                const recommended = slot === "8:00 PM";
                return (
                  <Pressable
                    key={slot}
                    style={[
                      styles.timeChip,
                      active && styles.timeChipActive,
                      active && recommended && styles.timeChipRecommended,
                    ]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                      {slot}
                      {active && recommended ? "  ⭐" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Booking Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="calendar-month-outline" size={14} color={colors.cyan} />
                <Text style={styles.summaryMain}>{selectedDate.label}</Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.cyan} />
                <Text style={styles.summaryMain}>{selectedTime}</Text>
                <Text style={styles.summarySub}>• {connector}</Text>
                <Text style={styles.summarySub}>• {chargerType}</Text>
              </View>
            </View>
            {queue.length > 0 ? (
              <Text style={styles.queueHint}>{queue.length} reservation(s) already queued at this station.</Text>
            ) : null}
            <Pressable
              style={styles.confirmBtn}
              onPress={() =>
                onConfirm({
                  dateLabel: selectedDate.label,
                  dateValue: selectedDate.key,
                  timeLabel: selectedTime,
                })
              }
            >
              <Text style={styles.confirmBtnText}>Confirm Booking • {selectedTime}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#d6dae3",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 10,
  },
  headerRow: {
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: "#1f5db8",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBackBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#124a99",
  },
  headerTitle: {
    color: "#f1f6ff",
    fontSize: 21,
    fontWeight: "800",
  },
  headerSpacer: {
    width: 28,
    height: 28,
  },
  block: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c3c9d4",
    backgroundColor: "#e2e5ea",
    padding: 10,
    gap: 8,
  },
  blockTitle: {
    color: "#3f4f68",
    fontSize: 16,
    fontWeight: "800",
  },
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c6ccd6",
    backgroundColor: "#ebedf2",
    minHeight: 44,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#dbe8fb",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  settingValue: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
  },
  settingDivider: {
    marginVertical: 2,
    height: 1,
    backgroundColor: "#d4dae5",
  },
  dateRow: {
    flexDirection: "row",
    gap: 6,
  },
  dateChip: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c6ccd6",
    backgroundColor: "#f0f2f7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    gap: 1,
  },
  dateChipActive: {
    borderColor: "#3669be",
    backgroundColor: "#376dcb",
  },
  dateWeek: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "700",
  },
  dateWeekActive: {
    color: "#edf4ff",
  },
  dateMain: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  dateMainActive: {
    color: "#edf4ff",
  },
  timeLabel: {
    marginTop: 4,
    color: "#3f4f68",
    fontSize: 16,
    fontWeight: "800",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  timeChip: {
    width: "31.6%",
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#c6ccd6",
    backgroundColor: "#e9ecf2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  timeChipActive: {
    borderColor: "#3567bc",
    backgroundColor: "#2d6bc3",
  },
  timeChipRecommended: {
    borderColor: "#3ba56a",
    backgroundColor: "#49bc7a",
  },
  timeChipText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
  timeChipTextActive: {
    color: "#eef4ff",
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c6ccd6",
    backgroundColor: "#ebedf2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  summaryMain: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
  },
  summarySub: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  queueHint: {
    color: "#566477",
    fontSize: 12,
    fontWeight: "600",
  },
  confirmBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2f62b7",
    backgroundColor: "#2a66be",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  confirmBtnText: {
    color: "#eff5ff",
    fontSize: 16,
    fontWeight: "800",
  },
});
