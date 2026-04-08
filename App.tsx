import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomNav } from "./src/components/ui/BottomNav";
import { carModels } from "./src/data/cars";
import { chargingStations } from "./src/data/stations";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SessionScreen } from "./src/screens/SessionScreen";
import { StartStep1, StartStep2, StartStep3 } from "./src/screens/start";
import { getSessionSnapshot } from "./src/sessionMetrics";
import { colors } from "./src/theme";
import {
  ActiveSession,
  ChargingStation,
  PaymentMethod,
  ReservationEntry,
  SessionHistoryEntry,
  TabKey,
} from "./src/types";
import { ToastMessage, ToastMessagePayload } from "./src/components/ui/toastmessage";

const STORAGE_KEYS = {
  favorites: "uzaro:favorites",
  wallet: "uzaro:wallet",
  carModel: "uzaro:carModel",
  activeSession: "uzaro:activeSession",
  reservations: "uzaro:reservations",
  sessionHistory: "uzaro:sessionHistory",
} as const;
const SESSION_AUTH_AMOUNT = 150;
type EntryScreenKey = "StartStep1" | "StartStep2" | "StartStep3" | "Login" | "App";

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [entryScreen, setEntryScreen] = useState<EntryScreenKey>("StartStep1");
  const [activeTab, setActiveTab] = useState<TabKey>("Home");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState(1250);
  const [selectedCarId, setSelectedCarId] = useState(carModels[0].id);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [reservationsByStation, setReservationsByStation] = useState<
    Record<string, ReservationEntry[]>
  >({});
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
  const [paymentStation, setPaymentStation] = useState<ChargingStation | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("GCash");
  const [toast, setToast] = useState<ToastMessagePayload | null>(null);

  const showToast = useCallback((nextToast: ToastMessagePayload) => {
    setToast(nextToast);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const values = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
      if (!mounted) return;

      const map = Object.fromEntries(values);
      setFavoriteIds(parseJson<string[]>(map[STORAGE_KEYS.favorites] ?? null, []));
      setWalletBalance(parseJson<number>(map[STORAGE_KEYS.wallet] ?? null, 1250));
      setSelectedCarId(parseJson<string>(map[STORAGE_KEYS.carModel] ?? null, carModels[0].id));
      setActiveSession(parseJson<ActiveSession | null>(map[STORAGE_KEYS.activeSession] ?? null, null));
      setReservationsByStation(
        parseJson<Record<string, ReservationEntry[]>>(map[STORAGE_KEYS.reservations] ?? null, {})
      );
      setSessionHistory(
        parseJson<SessionHistoryEntry[]>(map[STORAGE_KEYS.sessionHistory] ?? null, [])
      );
      setIsReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteIds)).catch(() => undefined);
  }, [favoriteIds, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.wallet, JSON.stringify(walletBalance)).catch(() => undefined);
  }, [walletBalance, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.carModel, JSON.stringify(selectedCarId)).catch(() => undefined);
  }, [selectedCarId, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.activeSession, JSON.stringify(activeSession)).catch(() => undefined);
  }, [activeSession, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(reservationsByStation)).catch(
      () => undefined
    );
  }, [reservationsByStation, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.sessionHistory, JSON.stringify(sessionHistory)).catch(
      () => undefined
    );
  }, [sessionHistory, isReady]);

  const toggleFavorite = (stationId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const addReservation = (stationId: string, reservedBy: string) => {
    setReservationsByStation((prev) => {
      const existing = prev[stationId] ?? [];
      const nextEntry: ReservationEntry = {
        id: `${stationId}-${Date.now()}`,
        stationId,
        reservedBy,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [stationId]: [...existing, nextEntry],
      };
    });
  };

  const startSession = (station: ChargingStation) => {
    if (station.availableChargers <= 0) {
      showToast({
        title: "Charger unavailable",
        message: "This station currently has no free chargers.",
        tone: "warning",
      });
      return;
    }

    if (activeSession && activeSession.stationId !== station.id) {
      showToast({
        title: "Session already active",
        message: "Stop your current session before starting a new one.",
        tone: "warning",
      });
      setActiveTab("Session");
      return;
    }

    if (activeSession && activeSession.stationId === station.id) {
      showToast({
        title: "Already charging",
        message: "This station already has your active session.",
        tone: "info",
      });
      setActiveTab("Session");
      return;
    }

    setPaymentMethod("GCash");
    setPaymentStation(station);
  };

  const closePaymentModal = () => {
    setPaymentStation(null);
  };

  const confirmPaymentAndStart = () => {
    if (!paymentStation) return;

    if (paymentMethod === "E-Wallet" && walletBalance < SESSION_AUTH_AMOUNT) {
      showToast({
        title: "Insufficient e-wallet balance",
        message: `You need at least PHP ${SESSION_AUTH_AMOUNT} to start charging with E-Wallet.`,
        tone: "warning",
      });
      setActiveTab("Profile");
      return;
    }

    if (paymentMethod === "E-Wallet") {
      setWalletBalance((prev) => Math.max(0, prev - SESSION_AUTH_AMOUNT));
    }

    setActiveSession({
      stationId: paymentStation.id,
      stationName: paymentStation.name,
      startedAt: new Date().toISOString(),
      paymentMethod,
      authorizedAmount: SESSION_AUTH_AMOUNT,
    });
    setPaymentStation(null);
    setActiveTab("Session");
    showToast({
      title: "Charging started",
      message: `${paymentMethod} payment authorized (PHP ${SESSION_AUTH_AMOUNT}).`,
      tone: "success",
    });
  };

  const stopSession = () => {
    if (activeSession) {
      const station = chargingStations.find((item) => item.id === activeSession.stationId);
      const snapshot = getSessionSnapshot(activeSession.startedAt, station?.price ?? 18.5);
      const historyEntry: SessionHistoryEntry = {
        id: `history-${Date.now()}`,
        stationId: activeSession.stationId,
        stationName: activeSession.stationName,
        startedAt: activeSession.startedAt,
        endedAt: new Date().toISOString(),
        elapsedSec: snapshot.elapsedSec,
        progressPercent: snapshot.progressPercent,
        energyAddedKwh: snapshot.energyAddedKwh,
        estimatedCost: snapshot.estimatedCost,
        paymentMethod: activeSession.paymentMethod ?? "GCash",
      };

      setSessionHistory((prev) => [historyEntry, ...prev].slice(0, 40));
      showToast({
        title: "Session completed",
        message: `${snapshot.energyAddedKwh.toFixed(1)} kWh | PHP ${snapshot.estimatedCost.toFixed(2)}`,
        tone: "success",
      });
    }

    setActiveSession(null);
    setActiveTab("Home");
  };

  const topUpWallet = () => {
    setWalletBalance((prev) => prev + 500);
    showToast({
      title: "Wallet updated",
      message: "PHP 500 has been added to your balance.",
      tone: "success",
    });
  };

  const handleProfileItemPress = (item: string) => {
    showToast({
      title: item,
      message: "This section is ready in layout and can be connected to real backend data.",
      tone: "info",
    });
  };

  const signOut = () => {
    setFavoriteIds([]);
    setActiveSession(null);
    setReservationsByStation({});
    setSessionHistory([]);
    setPaymentStation(null);
    setActiveTab("Home");
    setEntryScreen("Login");
    AsyncStorage.multiRemove([
      STORAGE_KEYS.favorites,
      STORAGE_KEYS.activeSession,
      STORAGE_KEYS.reservations,
      STORAGE_KEYS.sessionHistory,
    ]).catch(() => undefined);
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Preparing Electric Uzaro Mobile...</Text>
      </SafeAreaView>
    );
  }

  if (entryScreen !== "App") {
    return (
      <View style={styles.entryRoot}>
        <StatusBar style="light" />
        <View style={styles.entryScreen}>
          {entryScreen === "StartStep1" ? <StartStep1 onNext={() => setEntryScreen("StartStep2")} /> : null}
          {entryScreen === "StartStep2" ? <StartStep2 onNext={() => setEntryScreen("StartStep3")} /> : null}
          {entryScreen === "StartStep3" ? <StartStep3 onNext={() => setEntryScreen("Login")} /> : null}
          {entryScreen === "Login" ? <LoginScreen onSignIn={() => setEntryScreen("App")} /> : null}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        {activeTab === "Home" ? (
          <HomeScreen
            selectedCarId={selectedCarId}
            activeSession={activeSession}
            reservationsByStation={reservationsByStation}
            favoriteCount={favoriteIds.length}
            sessionHistory={sessionHistory}
            onSelectTab={setActiveTab}
          />
        ) : null}

        {activeTab === "Maps" ? (
          <MapScreen
            favoriteIds={favoriteIds}
            activeSession={activeSession}
            reservationsByStation={reservationsByStation}
            onToggleFavorite={toggleFavorite}
            onCreateReservation={addReservation}
            onStartSession={startSession}
            onToast={showToast}
          />
        ) : null}

        {activeTab === "Favorites" ? (
          <FavoritesScreen
            favoriteIds={favoriteIds}
            reservationsByStation={reservationsByStation}
            onToggleFavorite={toggleFavorite}
            onCreateReservation={addReservation}
            onStartSession={startSession}
            onOpenMaps={() => setActiveTab("Maps")}
            onToast={showToast}
          />
        ) : null}

        {activeTab === "Session" ? (
          <SessionScreen
            activeSession={activeSession}
            onStopSession={stopSession}
            onOpenMaps={() => setActiveTab("Maps")}
            onToast={showToast}
          />
        ) : null}

        {activeTab === "Profile" ? (
          <ProfileScreen
            walletBalance={walletBalance}
            selectedCarId={selectedCarId}
            sessionHistory={sessionHistory}
            onTopUp={topUpWallet}
            onSelectCar={setSelectedCarId}
            onSignOut={signOut}
            onOpenMenuItem={handleProfileItemPress}
            onToast={showToast}
          />
        ) : null}
      </View>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      <Modal visible={paymentStation !== null} transparent animationType="slide" onRequestClose={closePaymentModal}>
        <View style={styles.paymentBackdrop}>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Confirm Payment</Text>
            <Text style={styles.paymentSub}>
              Start charging at <Text style={styles.paymentStationName}>{paymentStation?.name}</Text>
            </Text>

            <View style={styles.paymentInfoRow}>
              <View style={styles.paymentInfoItem}>
                <Text style={styles.paymentInfoLabel}>Auth Hold</Text>
                <Text style={styles.paymentInfoValue}>PHP {SESSION_AUTH_AMOUNT}</Text>
              </View>
              <View style={styles.paymentInfoItem}>
                <Text style={styles.paymentInfoLabel}>Wallet Balance</Text>
                <Text style={styles.paymentInfoValue}>PHP {walletBalance.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.methodList}>
              <Pressable
                style={[styles.methodCard, paymentMethod === "GCash" && styles.methodCardActive]}
                onPress={() => setPaymentMethod("GCash")}
              >
                <View style={styles.methodIcon}>
                  <MaterialCommunityIcons name="cellphone" size={16} color={colors.cyan} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>GCash</Text>
                  <Text style={styles.methodHint}>Pay with linked GCash account</Text>
                </View>
                {paymentMethod === "GCash" ? (
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.emerald} />
                ) : null}
              </Pressable>

              <Pressable
                style={[styles.methodCard, paymentMethod === "E-Wallet" && styles.methodCardActive]}
                onPress={() => setPaymentMethod("E-Wallet")}
              >
                <View style={styles.methodIcon}>
                  <MaterialCommunityIcons name="wallet-outline" size={16} color={colors.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>E-Wallet</Text>
                  <Text style={styles.methodHint}>Use in-app wallet balance</Text>
                </View>
                {paymentMethod === "E-Wallet" ? (
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.emerald} />
                ) : null}
              </Pressable>
            </View>

            <View style={styles.paymentActions}>
              <Pressable style={[styles.paymentBtn, styles.paymentCancelBtn]} onPress={closePaymentModal}>
                <Text style={styles.paymentCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.paymentBtn, styles.paymentConfirmBtn]} onPress={confirmPaymentAndStart}>
                <Text style={styles.paymentConfirmText}>Pay & Start</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <ToastMessage toast={toast} onClose={dismissToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  entryRoot: {
    flex: 1,
    backgroundColor: "#04070d",
  },
  entryScreen: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? (RNStatusBar.currentHeight ?? 0) : 0,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  paymentBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.75)",
  },
  paymentCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  paymentTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  paymentSub: {
    color: colors.textMuted,
    fontSize: 13,
  },
  paymentStationName: {
    color: colors.text,
    fontWeight: "700",
  },
  paymentInfoRow: {
    marginTop: 2,
    flexDirection: "row",
    gap: 10,
  },
  paymentInfoItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.bg,
    padding: 10,
    gap: 3,
  },
  paymentInfoLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  paymentInfoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  methodList: {
    marginTop: 4,
    gap: 8,
  },
  methodCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.bg,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  methodCardActive: {
    borderColor: "#19d6a48f",
    backgroundColor: "#19d6a41a",
  },
  methodIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f2236",
  },
  methodName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  methodHint: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  paymentActions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 10,
  },
  paymentBtn: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentCancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  paymentConfirmBtn: {
    borderWidth: 1,
    borderColor: "#19d6a48c",
    backgroundColor: "#19d6a42a",
  },
  paymentCancelText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  paymentConfirmText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "800",
  },
});
