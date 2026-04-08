import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";

type ToastTone = "info" | "success" | "warning" | "error";
type ToastActionTone = "neutral" | "accent" | "destructive";

export interface ToastAction {
  label: string;
  onPress?: () => void;
  tone?: ToastActionTone;
  keepOpen?: boolean;
}

export interface ToastMessagePayload {
  title: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
  primaryAction?: ToastAction;
  secondaryAction?: ToastAction;
}

interface ToastMessageProps {
  toast: ToastMessagePayload | null;
  onClose: () => void;
}

const AUTO_DISMISS_MS = 2800;

const toneStyles: Record<
  ToastTone,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    iconBg: string;
    borderColor: string;
    backgroundColor: string;
  }
> = {
  info: {
    icon: "information-outline",
    iconColor: "#67e8f9",
    iconBg: "#22d3ee24",
    borderColor: "#22d3ee60",
    backgroundColor: "#08273a",
  },
  success: {
    icon: "check-circle-outline",
    iconColor: "#6ee7b7",
    iconBg: "#10b98124",
    borderColor: "#10b98160",
    backgroundColor: "#082f2b",
  },
  warning: {
    icon: "alert-outline",
    iconColor: "#fcd34d",
    iconBg: "#f59e0b26",
    borderColor: "#f59e0b5f",
    backgroundColor: "#37260a",
  },
  error: {
    icon: "alert-circle-outline",
    iconColor: "#fda4af",
    iconBg: "#fb718524",
    borderColor: "#fb718562",
    backgroundColor: "#31131e",
  },
};

function actionStyleFor(tone: ToastActionTone | undefined) {
  switch (tone) {
    case "accent":
      return {
        backgroundColor: colors.emerald,
        borderColor: colors.emerald,
        textColor: "#03201a",
      };
    case "destructive":
      return {
        backgroundColor: colors.rose,
        borderColor: colors.rose,
        textColor: "#ffffff",
      };
    default:
      return {
        backgroundColor: "transparent",
        borderColor: colors.border,
        textColor: colors.textMuted,
      };
  }
}

export function ToastMessage({ toast, onClose }: ToastMessageProps) {
  useEffect(() => {
    if (!toast) return;
    const hasActions = Boolean(toast.primaryAction || toast.secondaryAction);
    if (hasActions || toast.durationMs === 0) return;

    const timer = setTimeout(onClose, toast.durationMs ?? AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = toast.tone ?? "info";
  const visuals = toneStyles[tone];
  const secondaryAction = toast.secondaryAction;
  const primaryAction = toast.primaryAction;

  const triggerAction = (action: ToastAction) => {
    action.onPress?.();
    if (!action.keepOpen) onClose();
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={[styles.card, { borderColor: visuals.borderColor, backgroundColor: visuals.backgroundColor }]}>
        <View style={styles.mainRow}>
          <View style={[styles.iconWrap, { backgroundColor: visuals.iconBg }]}>
            <MaterialCommunityIcons name={visuals.icon} size={20} color={visuals.iconColor} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{toast.title}</Text>
            <Text style={styles.message}>{toast.message}</Text>
          </View>
          {!primaryAction && !secondaryAction ? (
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {primaryAction || secondaryAction ? (
          <View style={styles.actions}>
            {secondaryAction ? (
              <Pressable
                style={[
                  styles.actionBtn,
                  {
                    borderColor: actionStyleFor(secondaryAction.tone).borderColor,
                    backgroundColor: actionStyleFor(secondaryAction.tone).backgroundColor,
                  },
                ]}
                onPress={() => triggerAction(secondaryAction)}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: actionStyleFor(secondaryAction.tone).textColor, fontWeight: "700" },
                  ]}
                >
                  {secondaryAction.label}
                </Text>
              </Pressable>
            ) : null}

            {primaryAction ? (
              <Pressable
                style={[
                  styles.actionBtn,
                  {
                    borderColor: actionStyleFor(primaryAction.tone).borderColor,
                    backgroundColor: actionStyleFor(primaryAction.tone).backgroundColor,
                  },
                ]}
                onPress={() => triggerAction(primaryAction)}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: actionStyleFor(primaryAction.tone).textColor, fontWeight: "800" },
                  ]}
                >
                  {primaryAction.label}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 86,
    zIndex: 80,
    paddingHorizontal: 12,
    pointerEvents: "box-none",
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  message: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f1f2d",
  },
  actions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 12,
  },
});
