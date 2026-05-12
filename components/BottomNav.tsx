// components/BottomNav.tsx
import { apiFetch } from "@/utils/api";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, usePathname, useRouter, type Href } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Theme ────────────────────────────────────────────────────────────────────

const LIGHT = {
  bg: "#FFFFFF",
  border: "rgba(80,120,190,0.15)",
  activeBg: "rgba(26,111,212,0.09)",
  activeBorder: "rgba(26,111,212,0.2)",
  activeText: "#1A6FD4",
  inactiveText: "#7A99BE",
  inactiveBg: "transparent",
  dot: "#D63050",
  dotBorder: "#FFFFFF",
  shadow: {
    shadowColor: "#1A3C8C",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
};

const DARK = {
  bg: "#0C1220",
  border: "rgba(255,255,255,0.08)",
  activeBg: "rgba(0,212,255,0.10)",
  activeBorder: "rgba(0,212,255,0.2)",
  activeText: "#00D4FF",
  inactiveText: "rgba(255,255,255,0.35)",
  inactiveBg: "transparent",
  dot: "#FF4D6D",
  dotBorder: "#0C1220",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

type Theme = typeof LIGHT;

// ─── Nav items ────────────────────────────────────────────────────────────────

type NavKey = "home" | "notification" | "signature" | "profile";

type NavItem = {
  key: NavKey;
  label: string;
  href: Href;
  icon: React.ComponentProps<typeof FontAwesome6>["name"];
  iconActive: React.ComponentProps<typeof FontAwesome6>["name"];
};

const ITEMS: NavItem[] = [
  {
    key: "home",
    label: "Beranda",
    href: "/beranda/beranda",
    icon: "house",
    iconActive: "house",
  },
  {
    key: "notification",
    label: "Notifikasi",
    href: "/notifikasi/notifikasi",
    icon: "bell",
    iconActive: "bell",
  },
  {
    key: "signature",
    label: "Approval",
    href: "/approval/approval",
    icon: "shield-halved",
    iconActive: "shield-halved",
  },
  {
    key: "profile",
    label: "Profil",
    href: "/profil/profil",
    icon: "user",
    iconActive: "user",
  },
];

// ─── NavButton ────────────────────────────────────────────────────────────────

function NavButton({
  item,
  isActive,
  hasNotif,
  T,
  onPress,
}: {
  item: NavItem;
  isActive: boolean;
  hasNotif: boolean;
  T: Theme;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          s.item,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: isActive ? T.activeBg : T.inactiveBg,
            borderWidth: isActive ? 0.5 : 0,
            borderColor: T.activeBorder,
          },
        ]}
      >
        {/* Icon + notification dot */}
        <View style={s.iconWrap}>
          <FontAwesome6
            name={isActive ? item.iconActive : item.icon}
            size={20}
            color={isActive ? T.activeText : T.inactiveText}
            solid={isActive}
          />
          {item.key === "notification" && hasNotif && (
            <View
              style={[
                s.dot,
                { backgroundColor: T.dot, borderColor: T.dotBorder },
              ]}
            />
          )}
        </View>

        {/* Label */}
        <Text
          style={[s.label, { color: isActive ? T.activeText : T.inactiveText }]}
        >
          {item.label}
        </Text>

        {/* Active indicator pip */}
        {isActive && (
          <View style={[s.activePip, { backgroundColor: T.activeText }]} />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

export default function BottomNav({ isDark = false }: { isDark?: boolean }) {
  const T: Theme = isDark ? DARK : LIGHT;
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [hasNotif, setHasNotif] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("role")
      .then((r) => setRole(r))
      .catch(() => {});
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const fetchStatus = async () => {
        try {
          const r = await AsyncStorage.getItem("role");
          if (active) setRole(r);

          const res = await apiFetch("/notifikasi/status");
          if (active && res) setHasNotif(Boolean(res.status));
        } catch {
          // silent
        }
      };

      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }, []),
  );

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[s.safeArea, { backgroundColor: T.bg }, T.shadow]}
    >
      <View
        style={[
          s.container,
          { borderTopColor: T.border, backgroundColor: T.bg },
        ]}
      >
        {ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(String(item.href) + "/");

          return (
            <NavButton
              key={item.key}
              item={item}
              isActive={isActive}
              hasNotif={hasNotif}
              T={T}
              onPress={() => router.navigate(item.href)}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: { zIndex: 100 },

  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 0.5,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 12 : 6,
    paddingHorizontal: 8,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 4,
    minWidth: 64,
    position: "relative",
  },

  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    position: "absolute",
    top: -3,
    right: -5,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },

  label: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  activePip: {
    position: "absolute",
    bottom: -7,
    width: 20,
    height: 3,
    borderRadius: 2,
    alignSelf: "center",
  },
});
