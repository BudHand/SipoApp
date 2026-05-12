import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/utils/api";
import { FontAwesome6 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
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
  surface3: "#EBF0F8",
  border: "rgba(100,140,200,0.13)",
  borderStrong: "rgba(80,120,190,0.2)",
  accent: "#1A6FD4",
  accent2: "#2A88F5",
  accentBg: "rgba(26,111,212,0.07)",
  accentBorder: "rgba(26,111,212,0.18)",
  textPrimary: "#0D1829",
  textSecondary: "#3A5070",
  textTertiary: "#7A99BE",
  textMuted: "#A8C0D8",
  blue: "#1A6FD4",
  blueBg: "rgba(26,111,212,0.08)",
  blueBd: "rgba(26,111,212,0.2)",
  blue2: "#1558B0",
  blue2Bg: "rgba(21,88,176,0.08)",
  blue2Bd: "rgba(21,88,176,0.2)",
  cardIn: "#EDF3FF",
  cardOut: "#EEF2FF",
  orb1: "rgba(26,111,212,0.06)",
  orb2: "rgba(42,136,245,0.04)",
  shadowSm: {
    shadowColor: "#1A3C8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: "#1A3C8C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};

const DARK = {
  bg: "#060B18",
  surface: "#0C1220",
  surface2: "#0F1828",
  surface3: "#141E30",
  border: "rgba(255,255,255,0.055)",
  borderStrong: "rgba(255,255,255,0.1)",
  accent: "#00D4FF",
  accent2: "#00AACC",
  accentBg: "rgba(0,212,255,0.08)",
  accentBorder: "rgba(0,212,255,0.18)",
  textPrimary: "rgba(255,255,255,0.90)",
  textSecondary: "rgba(255,255,255,0.50)",
  textTertiary: "rgba(255,255,255,0.28)",
  textMuted: "rgba(255,255,255,0.15)",
  blue: "#4AB0FF",
  blueBg: "rgba(0,132,255,0.13)",
  blueBd: "rgba(0,132,255,0.25)",
  blue2: "#7AC8FF",
  blue2Bg: "rgba(74,176,255,0.13)",
  blue2Bd: "rgba(74,176,255,0.25)",
  cardIn: "#0A1628",
  cardOut: "#101B38",
  orb1: "rgba(0,132,255,0.10)",
  orb2: "rgba(0,255,198,0.06)",
  shadowSm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  shadowMd: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

type ThemeColors = typeof LIGHT;

export default function MemoIndex() {
  const router = useRouter();
  const { isDark, toggleDark } = useTheme();
  const C: ThemeColors = isDark ? DARK : LIGHT;

  const [countMasuk, setCountMasuk] = useState<number | null>(null);
  const [countKeluar, setCountKeluar] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      const [masukRes, keluarRes] = await Promise.all([
        apiFetch("/memos/masuk"),
        apiFetch("/memos/keluar"),
      ]);

      const masuk = masukRes?.data ?? masukRes;
      const keluar = keluarRes?.data ?? keluarRes;

      setCountMasuk(
        Array.isArray(masuk) ? masuk.length : (masuk?.total ?? null),
      );

      setCountKeluar(
        Array.isArray(keluar) ? keluar.length : (keluar?.total ?? null),
      );
    } catch {
      // count optional
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCounts();
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <View
        style={[s.orb1, { backgroundColor: C.orb1 }]}
        pointerEvents="none"
      />

      <View
        style={[s.orb2, { backgroundColor: C.orb2 }]}
        pointerEvents="none"
      />

      <View style={[s.header, { borderBottomColor: C.border }]}>
        <View style={s.headerLeft}>
          <TouchableOpacity
            style={[
              s.backBtn,
              { backgroundColor: C.surface, borderColor: C.borderStrong },
              C.shadowSm,
            ]}
            onPress={() => router.back()}
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
            <FontAwesome6 name="envelope" size={16} color={C.accent} />
          </View>

          <View>
            <Text style={[s.headerTitle, { color: C.textPrimary }]}>Memo</Text>
            <Text style={[s.headerSub, { color: C.textTertiary }]}>
              Surat menyurat internal
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
        contentContainerStyle={s.scrollContent}
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
        <View
          style={[
            s.banner,
            { backgroundColor: C.accentBg, borderColor: C.accentBorder },
          ]}
        >
          <View style={[s.bannerDot, { backgroundColor: C.accent }]} />
          <Text style={[s.bannerText, { color: C.accent }]}>
            Pilih kategori memo yang ingin ditampilkan
          </Text>
        </View>

        <View style={s.cardsWrap}>
          <TouchableOpacity
            style={[
              s.card,
              { backgroundColor: C.cardIn, borderColor: C.borderStrong },
              C.shadowMd,
            ]}
            activeOpacity={0.82}
            onPress={() => router.push("/memo/memo-masuk" as any)}
          >
            <View style={[s.cardGlow, { backgroundColor: C.blueBg }]} />
            <View style={[s.cardStrip, { backgroundColor: C.blue }]} />

            <View style={s.cardBody}>
              <View style={s.cardTopRow}>
                <View
                  style={[
                    s.cardIconWrap,
                    { backgroundColor: C.blueBg, borderColor: C.blueBd },
                  ]}
                >
                  <FontAwesome6 name="envelope-open" size={26} color={C.blue} />
                </View>

                {countMasuk !== null && (
                  <View
                    style={[
                      s.countBadge,
                      { backgroundColor: C.blueBg, borderColor: C.blueBd },
                    ]}
                  >
                    <View style={[s.countDot, { backgroundColor: C.blue }]} />
                    <Text style={[s.countText, { color: C.blue }]}>
                      {countMasuk} dokumen
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[s.cardTitle, { color: C.textPrimary }]}>
                Memo Masuk
              </Text>

              <Text style={[s.cardDesc, { color: C.textTertiary }]}>
                Memo yang diterima dan ditujukan kepada Anda
              </Text>

              <View
                style={[s.cardDivider, { backgroundColor: C.borderStrong }]}
              />

              <View style={s.cardCta}>
                <Text style={[s.cardCtaText, { color: C.blue }]}>
                  Lihat Memo Masuk
                </Text>

                <View
                  style={[
                    s.cardCtaArrow,
                    { backgroundColor: C.blueBg, borderColor: C.blueBd },
                  ]}
                >
                  <FontAwesome6 name="arrow-right" size={11} color={C.blue} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.card,
              { backgroundColor: C.cardOut, borderColor: C.borderStrong },
              C.shadowMd,
            ]}
            activeOpacity={0.82}
            onPress={() => router.push("/memo/memo-keluar" as any)}
          >
            <View style={[s.cardGlow, { backgroundColor: C.blue2Bg }]} />
            <View style={[s.cardStrip, { backgroundColor: C.blue2 }]} />

            <View style={s.cardBody}>
              <View style={s.cardTopRow}>
                <View
                  style={[
                    s.cardIconWrap,
                    { backgroundColor: C.blue2Bg, borderColor: C.blue2Bd },
                  ]}
                >
                  <FontAwesome6 name="envelope" size={26} color={C.blue2} />
                </View>

                {countKeluar !== null && (
                  <View
                    style={[
                      s.countBadge,
                      { backgroundColor: C.blue2Bg, borderColor: C.blue2Bd },
                    ]}
                  >
                    <View style={[s.countDot, { backgroundColor: C.blue2 }]} />
                    <Text style={[s.countText, { color: C.blue2 }]}>
                      {countKeluar} dokumen
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[s.cardTitle, { color: C.textPrimary }]}>
                Memo Keluar
              </Text>

              <Text style={[s.cardDesc, { color: C.textTertiary }]}>
                Memo yang telah dikirimkan dari akun Anda
              </Text>

              <View
                style={[s.cardDivider, { backgroundColor: C.borderStrong }]}
              />

              <View style={s.cardCta}>
                <Text style={[s.cardCtaText, { color: C.blue2 }]}>
                  Lihat Memo Keluar
                </Text>

                <View
                  style={[
                    s.cardCtaArrow,
                    { backgroundColor: C.blue2Bg, borderColor: C.blue2Bd },
                  ]}
                >
                  <FontAwesome6 name="arrow-right" size={11} color={C.blue2} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={[
            s.infoCard,
            { backgroundColor: C.surface, borderColor: C.borderStrong },
            C.shadowSm,
          ]}
        >
          <View style={[s.infoTopLine, { backgroundColor: C.accentBorder }]} />

          <View style={s.infoRow}>
            <View
              style={[
                s.infoIcon,
                { backgroundColor: C.accentBg, borderColor: C.accentBorder },
              ]}
            >
              <FontAwesome6 name="circle-info" size={13} color={C.accent} />
            </View>

            <View style={s.infoContent}>
              <Text style={[s.infoTitle, { color: C.textPrimary }]}>
                Tentang Memo
              </Text>

              <Text style={[s.infoDesc, { color: C.textTertiary }]}>
                Memo adalah surat resmi internal yang digunakan untuk komunikasi
                antar unit atau pegawai dalam lingkungan instansi.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  orb1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -90,
    right: -80,
    zIndex: 0,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: 240,
    left: -70,
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  headerSub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: { padding: 16, paddingBottom: 110, gap: 14, zIndex: 1 },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  bannerText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2, flex: 1 },

  cardsWrap: { gap: 14 },

  card: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: "hidden",
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  cardStrip: { height: 3.5, width: "100%" },
  cardBody: { padding: 20, gap: 6 },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 0.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countDot: { width: 6, height: 6, borderRadius: 3 },
  countText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 6,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  cardDivider: { height: 0.5, marginVertical: 12 },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardCtaText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.1 },
  cardCtaArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  infoCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    position: "relative",
  },
  infoTopLine: { position: "absolute", top: 0, left: 30, right: 30, height: 1 },
  infoRow: { flexDirection: "row", gap: 12, padding: 14 },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  infoContent: { flex: 1, gap: 4 },
  infoTitle: { fontSize: 12.5, fontWeight: "700", letterSpacing: -0.1 },
  infoDesc: {
    fontSize: 11.5,
    fontWeight: "500",
    lineHeight: 17,
    letterSpacing: 0.1,
  },
});
