import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof FontAwesome6>["name"];
  children: React.ReactNode;
  applyLabel?: string;
  onApply?: () => void;
  resetLabel?: string;
  onReset?: () => void;
  isDark?: boolean;
};

export default function CustomModal({
  visible,
  onClose,
  title,
  subtitle,
  icon = "filter",
  children,
  applyLabel = "Terapkan",
  onApply,
  resetLabel = "Reset",
  onReset,
  isDark = false,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handleWrap}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? "#374151" : "#CBD5E1" },
              ]}
            />
          </View>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(0,212,255,0.08)"
                      : "#EEF4FF",
                    borderColor: isDark
                      ? "rgba(0,212,255,0.22)"
                      : "rgba(37,99,235,0.18)",
                  },
                ]}
              >
                <FontAwesome6
                  name={icon}
                  size={13}
                  color={isDark ? "#00D4FF" : "#2563EB"}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? "#F8FAFC" : "#0F1E50" },
                  ]}
                >
                  {title}
                </Text>

                {!!subtitle && (
                  <Text
                    style={[
                      styles.subtitle,
                      {
                        color: isDark
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(15,30,80,0.45)",
                      },
                    ]}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,30,80,0.10)",
                },
              ]}
            >
              <FontAwesome6
                name="xmark"
                size={14}
                color={isDark ? "#CBD5E1" : "#64748B"}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(15,30,80,0.08)",
              },
            ]}
          />

          <View style={styles.body}>{children}</View>

          <View style={styles.actions}>
            {!!onReset && (
              <TouchableOpacity
                style={[
                  styles.resetBtn,
                  {
                    borderColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(15,30,80,0.12)",
                  },
                ]}
                onPress={onReset}
              >
                <Text
                  style={[
                    styles.resetText,
                    { color: isDark ? "#CBD5E1" : "#475569" },
                  ]}
                >
                  {resetLabel}
                </Text>
              </TouchableOpacity>
            )}

            {!!onApply && (
              <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
                <Text style={styles.applyText}>{applyLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,30,80,0.45)",
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 22,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 6,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 99,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  body: {
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  resetText: {
    fontSize: 13,
    fontWeight: "700",
  },
  applyBtn: {
    flex: 2,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  applyText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
