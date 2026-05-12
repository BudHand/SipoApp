import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/utils/api";
import { formatTanggalID } from "@/utils/date";
import { FontAwesome6 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LIGHT = {
  bg: "#F0F4FA",
  surface: "#FFFFFF",
  surface2: "#F5F8FD",
  border: "rgba(100,140,200,0.13)",
  borderStrong: "rgba(80,120,190,0.2)",
  accent: "#1A6FD4",
  accentBg: "rgba(26,111,212,0.07)",
  accentBorder: "rgba(26,111,212,0.18)",
  textPrimary: "#0D1829",
  textSecondary: "#3A5070",
  textTertiary: "#7A99BE",
  textMuted: "#A8C0D8",
  blue: "#1A6FD4",
  blueBg: "rgba(26,111,212,0.08)",
  blueBd: "rgba(26,111,212,0.2)",
  blueCard: "#EDF3FF",
  purple: "#6B3FA8",
  purpleBg: "rgba(107,63,168,0.08)",
  purpleBd: "rgba(107,63,168,0.2)",
  purpleCard: "#F4EEFF",
  green: "#1A8A4A",
  greenBg: "rgba(26,138,74,0.08)",
  greenBd: "rgba(26,138,74,0.2)",
  greenCard: "#EDFBF4",
  emptyBg: "#EBF3FF",
  shadowSm: {
    shadowColor: "#1A3C8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
};

const DARK = {
  bg: "#060B18",
  surface: "#0C1220",
  surface2: "#0F1828",
  border: "rgba(255,255,255,0.055)",
  borderStrong: "rgba(255,255,255,0.1)",
  accent: "#00D4FF",
  accentBg: "rgba(0,212,255,0.08)",
  accentBorder: "rgba(0,212,255,0.18)",
  textPrimary: "rgba(255,255,255,0.90)",
  textSecondary: "rgba(255,255,255,0.50)",
  textTertiary: "rgba(255,255,255,0.28)",
  textMuted: "rgba(255,255,255,0.15)",
  blue: "#4AB0FF",
  blueBg: "rgba(0,132,255,0.13)",
  blueBd: "rgba(0,132,255,0.25)",
  blueCard: "#0A1628",
  purple: "#BB88FF",
  purpleBg: "rgba(120,80,255,0.13)",
  purpleBd: "rgba(120,80,255,0.25)",
  purpleCard: "#120A28",
  green: "#00CC80",
  greenBg: "rgba(0,200,120,0.13)",
  greenBd: "rgba(0,200,120,0.25)",
  greenCard: "#0A2018",
  emptyBg: "rgba(0,212,255,0.07)",
  shadowSm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

type ThemeColors = typeof LIGHT;
type ItemType = "memo" | "undangan" | "risalah";

interface ApprovalItem {
  id: number | string;
  type: ItemType;
  title: string;
  date: string | Date;
  status?: string;
}

interface ApprovalApiItem {
  id: number | string;
  judul?: string;
  tgl_dokumen?: string;
  tipe: ItemType;
  status?: string;
}

export default function ApprovalIndex() {
  const router = useRouter();
  const { isDark, toggleDark } = useTheme();
  const C: ThemeColors = isDark ? DARK : LIGHT;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadApprovals = useCallback(async () => {
    try {
      const response = await apiFetch("/approval");

      const data: ApprovalApiItem[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const list: ApprovalItem[] = data
        .filter((item) => item.id && item.tipe)
        .map((item) => ({
          id: item.id,
          type: item.tipe,
          title: item.judul || "Dokumen tidak ditemukan",
          date: item.tgl_dokumen || new Date(),
          status: item.status,
        }));

      setItems(list);
    } catch (err) {
      console.error("Error loading approvals:", err);
      Alert.alert("Error", "Gagal memuat data approval. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadApprovals();
  }, [loadApprovals]);

  const handleNavigate = (item: ApprovalItem) => {
    switch (item.type) {
      case "memo":
        router.push({
          pathname: "/memo/memo-detail" as any,
          params: {
            id: String(item.id),
            jenis: "keluar",
            source: "approval",
            from: "approval",
          },
        });
        break;

      case "undangan":
        router.push({
          pathname: "/undangan/undangan-detail" as any,
          params: {
            id: String(item.id),
            jenis: "keluar",
            source: "approval",
            from: "approval",
          },
        });
        break;

      case "risalah":
        router.push({
          pathname: "/risalah/risalah-detail" as any,
          params: {
            id: String(item.id),
            source: "approval",
            from: "approval",
          },
        });
        break;
    }
  };

  const getTypeStyle = (type: ItemType) => {
    switch (type) {
      case "memo":
        return {
          c: C.blue,
          bg: C.blueBg,
          bd: C.blueBd,
          card: C.blueCard,
          icon: "envelope" as const,
          label: "Memo",
        };

      case "undangan":
        return {
          c: C.purple,
          bg: C.purpleBg,
          bd: C.purpleBd,
          card: C.purpleCard,
          icon: "calendar-check" as const,
          label: "Undangan",
        };

      case "risalah":
        return {
          c: C.green,
          bg: C.greenBg,
          bd: C.greenBd,
          card: C.greenCard,
          icon: "file-lines" as const,
          label: "Risalah",
        };
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <SafeAreaView
          style={[s.centerContainer, { backgroundColor: C.bg }]}
          edges={["top"]}
        >
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={C.bg}
          />

          <View
            style={[
              s.loadingIconWrap,
              { backgroundColor: C.accentBg, borderColor: C.accentBorder },
            ]}
          >
            <ActivityIndicator size="large" color={C.accent} />
          </View>

          <Text style={[s.loadingText, { color: C.textTertiary }]}>
            Memuat data approval...
          </Text>
        </SafeAreaView>
      </>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]} edges={["top"]}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={C.bg}
        />

        <View
          style={[
            s.orb1,
            {
              backgroundColor: isDark
                ? "rgba(0,132,255,0.10)"
                : "rgba(26,111,212,0.06)",
            },
          ]}
          pointerEvents="none"
        />

        <View
          style={[
            s.orb2,
            {
              backgroundColor: isDark
                ? "rgba(0,255,198,0.06)"
                : "rgba(107,63,168,0.04)",
            },
          ]}
          pointerEvents="none"
        />

        <View style={[s.header, { borderBottomColor: C.border }]}>
          <View style={s.headerLeft}>
            <TouchableOpacity
              style={[
                s.backBtn,
                {
                  backgroundColor: C.surface,
                  borderColor: C.borderStrong,
                },
                C.shadowSm,
              ]}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/home");
                }
              }}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="chevron-left"
                size={13}
                color={C.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[
                s.headerIconWrap,
                { backgroundColor: C.accentBg, borderColor: C.accentBorder },
              ]}
            >
              <FontAwesome6 name="shield-halved" size={16} color={C.accent} />
            </View>

            <View>
              <Text style={[s.headerTitle, { color: C.textPrimary }]}>
                Approval
              </Text>

              <Text style={[s.headerSub, { color: C.textTertiary }]}>
                {isEmpty
                  ? "Tidak ada dokumen menunggu"
                  : `${items.length} dokumen menunggu persetujuan`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              s.themeBtn,
              { backgroundColor: C.surface, borderColor: C.borderStrong },
              C.shadowSm,
            ]}
            onPress={toggleDark}
            activeOpacity={0.7}
          >
            <FontAwesome6
              name={isDark ? "moon" : "sun"}
              size={13}
              color={C.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[s.scrollContent, isEmpty && s.scrollCentered]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[C.accent]}
              tintColor={C.accent}
              progressBackgroundColor={C.surface}
            />
          }
        >
          {isEmpty ? (
            <View style={s.emptyWrap}>
              <View
                style={[
                  s.emptyOrb,
                  {
                    backgroundColor: isDark
                      ? "rgba(0,212,255,0.06)"
                      : "rgba(26,111,212,0.05)",
                  },
                ]}
              />

              <View
                style={[
                  s.emptyIconRing,
                  { backgroundColor: C.emptyBg, borderColor: C.accentBorder },
                ]}
              >
                <View
                  style={[s.emptyIconInner, { backgroundColor: C.accentBg }]}
                >
                  <FontAwesome6
                    name="circle-check"
                    size={32}
                    color={C.accent}
                  />
                </View>
              </View>

              <Text style={[s.emptyTitle, { color: C.textPrimary }]}>
                Semua Beres!
              </Text>

              <Text style={[s.emptyDesc, { color: C.textTertiary }]}>
                Tidak ada dokumen yang{"\n"}menunggu persetujuan Anda
              </Text>

              <View
                style={[
                  s.emptyBadge,
                  { backgroundColor: C.accentBg, borderColor: C.accentBorder },
                ]}
              >
                <FontAwesome6 name="check" size={10} color={C.accent} />
                <Text style={[s.emptyBadgeText, { color: C.accent }]}>
                  Semua dokumen telah diproses
                </Text>
              </View>
            </View>
          ) : (
            <View style={s.listContainer}>
              <View
                style={[
                  s.countBadge,
                  { backgroundColor: C.surface, borderColor: C.borderStrong },
                  C.shadowSm,
                ]}
              >
                <View style={[s.countDot, { backgroundColor: C.accent }]} />
                <Text style={[s.countText, { color: C.textSecondary }]}>
                  {items.length} dokumen menunggu tindakan
                </Text>
              </View>

              {items.map((item) => {
                const st = getTypeStyle(item.type);

                return (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    style={[
                      s.card,
                      {
                        backgroundColor: st.card,
                        borderColor: C.borderStrong,
                      },
                      C.shadowSm,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleNavigate(item)}
                  >
                    <View style={[s.cardGlow, { backgroundColor: st.bg }]} />
                    <View
                      style={[s.cardAccentLine, { backgroundColor: st.c }]}
                    />

                    <View
                      style={[
                        s.cardIconWrap,
                        { backgroundColor: st.bg, borderColor: st.bd },
                      ]}
                    >
                      <FontAwesome6 name={st.icon} size={18} color={st.c} />
                    </View>

                    <View style={s.cardContent}>
                      <View style={s.cardTopRow}>
                        <View
                          style={[
                            s.typePill,
                            { backgroundColor: st.bg, borderColor: st.bd },
                          ]}
                        >
                          <Text style={[s.typePillText, { color: st.c }]}>
                            {st.label.toUpperCase()}
                          </Text>
                        </View>

                        <Text style={[s.cardDate, { color: C.textMuted }]}>
                          {formatTanggalID(item.date)}
                        </Text>
                      </View>

                      <Text
                        style={[s.cardTitle, { color: C.textPrimary }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>

                      <View
                        style={[s.cardAction, { borderTopColor: C.border }]}
                      >
                        <Text style={[s.cardActionText, { color: st.c }]}>
                          Tinjau dokumen
                        </Text>
                        <FontAwesome6
                          name="arrow-right"
                          size={10}
                          color={st.c}
                        />
                      </View>
                    </View>

                    <FontAwesome6
                      name="chevron-right"
                      size={11}
                      color={C.textMuted}
                      style={s.cardChevron}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  orb1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -80,
    right: -80,
    zIndex: 0,
  },
  orb2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 220,
    left: -60,
    zIndex: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.1,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    zIndex: 1,
  },
  scrollCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
    gap: 12,
    position: "relative",
  },
  emptyOrb: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 0,
    alignSelf: "center",
  },
  emptyIconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyIconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  emptyDesc: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  emptyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    borderWidth: 0.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  countDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  listContainer: {
    gap: 12,
  },

  card: {
    borderRadius: 18,
    borderWidth: 0.5,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 0,
    paddingRight: 14,
    paddingLeft: 0,
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cardAccentLine: {
    width: 3.5,
    height: "100%",
    borderRadius: 2,
    marginRight: 14,
    alignSelf: "stretch",
    minHeight: 80,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 0,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  typePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  cardDate: {
    fontSize: 10,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 19,
    marginBottom: 10,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderTopWidth: 0.5,
    paddingTop: 10,
    paddingBottom: 14,
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cardChevron: {
    marginLeft: 8,
    flexShrink: 0,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
