import { apiFetch } from "@/utils/api";
import { formatTanggalID } from "@/utils/date";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, SplashScreen, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Theme ────────────────────────────────────────────────────────────────────

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
  online: "#1A9E5A",
  danger: "#D63050",
  orb1: "rgba(26,111,212,0.06)",
  orb2: "rgba(42,136,245,0.04)",
  panelTopLine: "rgba(26,111,212,0.25)",
  // doc cards
  card1Bg: "#EDF3FF",
  card2Bg: "#F4EEFF",
  card3Bg: "#EDFBF4",
  card4Bg: "#FFFBEE",
  // quick actions
  qa1: "#EBF3FF",
  qa2: "#EEF2FF",
  qa3: "#F2EEFF",
  qa4: "#F0EEFF",
  qa5: "#EDFAF3",
  qa6: "#FFF9EE",
  qa7: "#F0F4FA",
  // badge
  badgeNowBg: "rgba(26,158,90,0.09)",
  badgeNowBd: "rgba(26,158,90,0.22)",
  badgeNowC: "#1A7A48",
  badgeSoonBg: "rgba(192,112,16,0.08)",
  badgeSoonBd: "rgba(192,112,16,0.22)",
  badgeSoonC: "#A06010",
  // shadows
  shadowSm: {
    shadowColor: "#1A3C8C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: "#1A3C8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
  online: "#00FF94",
  danger: "#FF4D6D",
  orb1: "rgba(0,132,255,0.10)",
  orb2: "rgba(0,255,198,0.06)",
  panelTopLine: "rgba(0,212,255,0.28)",
  card1Bg: "#0A1628",
  card2Bg: "#120A28",
  card3Bg: "#0A2018",
  card4Bg: "#281A08",
  qa1: "#0D1E38",
  qa2: "#101B38",
  qa3: "#160E32",
  qa4: "#141232",
  qa5: "#0A1E16",
  qa6: "#1E1608",
  qa7: "#121218",
  badgeNowBg: "rgba(0,255,148,0.08)",
  badgeNowBd: "rgba(0,255,148,0.20)",
  badgeNowC: "#00FF94",
  badgeSoonBg: "rgba(255,170,0,0.08)",
  badgeSoonBd: "rgba(255,170,0,0.20)",
  badgeSoonC: "#FFAA00",
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

// Per-theme icon/accent colors (same keys for light & dark)
const ICON_COLORS = {
  light: {
    blue: "#1A6FD4",
    blueBg: "rgba(26,111,212,0.09)",
    blueBd: "rgba(26,111,212,0.22)",
    purple: "#6B3FA8",
    purpleBg: "rgba(107,63,168,0.09)",
    purpleBd: "rgba(107,63,168,0.22)",
    green: "#1A8A4A",
    greenBg: "rgba(26,138,74,0.09)",
    greenBd: "rgba(26,138,74,0.22)",
    amber: "#C07010",
    amberBg: "rgba(192,112,16,0.09)",
    amberBd: "rgba(192,112,16,0.22)",
    gray: "#3A5070",
  },
  dark: {
    blue: "#4AB0FF",
    blueBg: "rgba(0,132,255,0.13)",
    blueBd: "rgba(0,132,255,0.25)",
    purple: "#BB88FF",
    purpleBg: "rgba(120,80,255,0.13)",
    purpleBd: "rgba(120,80,255,0.25)",
    green: "#00CC80",
    greenBg: "rgba(0,200,120,0.13)",
    greenBd: "rgba(0,200,120,0.25)",
    amber: "#FFCC44",
    amberBg: "rgba(255,170,0,0.13)",
    amberBd: "rgba(255,170,0,0.25)",
    gray: "rgba(255,255,255,0.45)",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeColors = typeof LIGHT;

// ─── Component ────────────────────────────────────────────────────────────────

export default function BerandaScreen() {
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);
  const C: ThemeColors = isDark ? DARK : LIGHT;
  const IC = isDark ? ICON_COLORS.dark : ICON_COLORS.light;

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [waitingApproval, setWaitingApproval] = useState<any[]>([]);
  const [fullname, setFullname] = useState("-");
  const [initials, setInitials] = useState("--");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const backPressCount = useRef(0);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      setIsAuthenticated(!!t);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (authChecked) SplashScreen.hideAsync();
  }, [authChecked]);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setRole(await AsyncStorage.getItem("role"));
      const [dashboardRes, profileRes] = await Promise.all([
        apiFetch("/dashboard"),
        apiFetch("/profile"),
        apiFetch("/memos/masuk"),
        apiFetch("/memos/keluar"),
        apiFetch("/undangans/masuk"),
        apiFetch("/undangans/keluar"),
      ]);
      if (dashboardRes.data) {
        const { undangan, recent_docs, fullname: fn } = dashboardRes.data;
        const name = fn ?? "-";
        setFullname(name);
        const words = name.trim().split(" ");
        const ini =
          words.length >= 2
            ? (words[0][0] + words[1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
        setInitials(ini);
        setProfileImage(
          profileRes?.profile_image ?? profileRes?.data?.profile_image ?? null,
        );
        setUpcomingMeetings(
          (undangan ?? []).map((u: any) => ({
            title: u.judul,
            date: formatTanggalID(u.tgl_rapat),
            day: new Date(u.tgl_rapat).getDate(),
            month: new Date(u.tgl_rapat)
              .toLocaleString("id-ID", { month: "short" })
              .toUpperCase(),
            time: u.waktu ?? "-",
            room: u.tempat ?? "-",
            id: u.id_undangan,
            diff: u.selisih_hari,
          })),
        );
        setWaitingApproval(
          (recent_docs ?? []).map((doc: any) => ({
            title: doc.judul,
            date: formatTanggalID(doc.tgl_dokumen),
            type: doc.tipe,
            id: doc.id,
          })),
        );
      }
    } catch (err) {
      console.error("Gagal ambil data dashboard:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated, fetchDashboardData]);

  const onRefresh = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    const handleBackPress = () => {
      if (backPressCount.current === 0) {
        backPressCount.current = 1;
        setShowExitModal(true);
        setTimeout(() => {
          backPressCount.current = 0;
          setShowExitModal(false);
        }, 2000);
        return true;
      }
      BackHandler.exitApp();
      return true;
    };
    const h = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => h.remove();
  }, []);

  if (!authChecked) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getApvStyle = (type: string) => {
    switch (type) {
      case "memo":
        return { c: IC.blue, bg: IC.blueBg, bd: IC.blueBd };
      case "undangan":
        return { c: IC.purple, bg: IC.purpleBg, bd: IC.purpleBd };
      case "risalah":
        return { c: IC.green, bg: IC.greenBg, bd: IC.greenBd };
      default:
        return { c: IC.gray, bg: IC.blueBg, bd: IC.blueBd };
    }
  };

  const getIconForType = (type: string): any => {
    switch (type) {
      case "memo":
        return "envelope";
      case "undangan":
        return "calendar-check";
      case "risalah":
        return "file-lines";
      default:
        return "file";
    }
  };

  const navigateApproval = (item: any) => {
    switch (item.type) {
      case "memo":
        router.push(`/memo/memo-detail?id=${item.id}`);
        break;
      case "undangan":
        router.push(`/undangan/undangan-detail?id=${item.id}`);
        break;
      case "risalah":
        router.push(`/risalah/risalah-detail?id=${item.id}`);
        break;
    }
  };

  // ─── Quick action rows ──────────────────────────────────────────────────────

  const quickActions = [
    {
      label: "Memo\nMasuk",
      icon: "envelope-open" as const,
      color: IC.blue,
      bg: C.qa1,
      route: "/memo/memo-masuk",
    },
    {
      label: "Memo\nKeluar",
      icon: "envelope" as const,
      color: IC.blue,
      bg: C.qa2,
      route: "/memo/memo-keluar",
    },
    {
      label: "Undangan\nMasuk",
      icon: "calendar-plus" as const,
      color: IC.purple,
      bg: C.qa3,
      route: "/undangan/undangan-masuk",
    },
    {
      label: "Undangan\nKeluar",
      icon: "calendar-minus" as const,
      color: IC.purple,
      bg: C.qa4,
      route: "/undangan/undangan-keluar",
    },
    {
      label: "Risalah",
      icon: "file-lines" as const,
      color: IC.green,
      bg: C.qa5,
      route: "/risalah/risalah",
    },
    {
      label: "Disposisi",
      icon: "paper-plane" as const,
      color: IC.amber,
      bg: C.qa6,
      route: "/disposisi/disposisi",
    },
    {
      label: "Profil",
      icon: "user" as const,
      color: IC.gray,
      bg: C.qa7,
      route: "/profil/profil",
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]} edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.accent]}
            tintColor={C.accent}
          />
        }
      >
        {/* Orbs */}
        <View
          style={[s.orb1, { backgroundColor: C.orb1 }]}
          pointerEvents="none"
        />
        <View
          style={[s.orb2, { backgroundColor: C.orb2 }]}
          pointerEvents="none"
        />

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerTop}>
            {/* Avatar */}
            <View style={s.avatarWrap}>
              <View style={[s.avatarRing, { borderColor: C.accentBorder }]} />
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={s.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[s.avatarPh, { backgroundColor: C.accent }]}>
                  <Text style={s.avatarIni}>{initials}</Text>
                </View>
              )}
              <View
                style={[
                  s.onlineDot,
                  { backgroundColor: C.online, borderColor: C.bg },
                ]}
              />
            </View>

            {/* Greeting */}
            <View style={s.greetBlock}>
              <Text style={[s.greetTop, { color: C.textMuted }]}>
                SELAMAT DATANG
              </Text>
              <Text
                style={[s.greetName, { color: C.textPrimary }]}
                numberOfLines={1}
              >
                {fullname}
              </Text>
            </View>

            {/* Buttons */}
            <View style={s.hbtns}>
              {/* Theme toggle */}
              <TouchableOpacity
                style={[
                  s.hbtn,
                  { backgroundColor: C.surface, borderColor: C.borderStrong },
                  C.shadowSm,
                ]}
                onPress={() => setIsDark((v) => !v)}
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name={isDark ? "moon" : "sun"}
                  size={13}
                  color={C.textSecondary}
                />
              </TouchableOpacity>

              {/* Bell */}
              <TouchableOpacity
                style={[
                  s.hbtn,
                  { backgroundColor: C.surface, borderColor: C.borderStrong },
                  C.shadowSm,
                ]}
                onPress={() => router.push("/notifikasi/notifikasi" as any)}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="bell" size={13} color={C.textSecondary} />
                <View
                  style={[
                    s.notifDot,
                    { backgroundColor: C.danger, borderColor: C.surface },
                  ]}
                />
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                style={[
                  s.hbtn,
                  { backgroundColor: C.surface, borderColor: C.borderStrong },
                  C.shadowSm,
                ]}
                onPress={() => router.push("/profil/profil" as any)}
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name="sliders"
                  size={13}
                  color={C.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* System banner */}
          <View
            style={[
              s.sysBanner,
              { backgroundColor: C.accentBg, borderColor: C.accentBorder },
            ]}
          >
            <View style={[s.sysDot, { backgroundColor: C.accent }]} />
            <Text style={[s.sysText, { color: C.accent }]} numberOfLines={1}>
              Sistem SIPO aktif — {dateStr}
            </Text>
            <Text style={[s.sysOnline, { color: C.textTertiary }]}>Online</Text>
          </View>
        </View>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <View style={s.content}>
          {/* Doc cards */}
          <SectionDivider label="RINGKASAN DOKUMEN" C={C} />
          <View style={s.docGrid}>
            {[
              {
                label: "Memo",
                sub: "Surat menyurat internal",
                icon: "envelope" as const,
                c: IC.blue,
                bg: IC.blueBg,
                bd: IC.blueBd,
                cardBg: C.card1Bg,
                glowBg: IC.blueBg,
                route: "",
              },
              {
                label: "Undangan",
                sub: "Jadwal & undangan rapat",
                icon: "calendar-check" as const,
                c: IC.purple,
                bg: IC.purpleBg,
                bd: IC.purpleBd,
                cardBg: C.card2Bg,
                glowBg: IC.purpleBg,
                route: "",
              },
              {
                label: "Risalah",
                sub: "Notulensi & catatan rapat",
                icon: "file-lines" as const,
                c: IC.green,
                bg: IC.greenBg,
                bd: IC.greenBd,
                cardBg: C.card3Bg,
                glowBg: IC.greenBg,
                route: "",
              },
              {
                label: "Disposisi",
                sub: "Pendelegasian dokumen",
                icon: "paper-plane" as const,
                c: IC.amber,
                bg: IC.amberBg,
                bd: IC.amberBd,
                cardBg: C.card4Bg,
                glowBg: IC.amberBg,
                route: "",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  s.docCard,
                  { backgroundColor: item.cardBg, borderColor: C.borderStrong },
                  C.shadowSm,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  item.route ? router.push(item.route as any) : null
                }
              >
                <View style={[s.docGlow, { backgroundColor: item.glowBg }]} />
                <View
                  style={[
                    s.docIconWrap,
                    { backgroundColor: item.bg, borderColor: item.bd },
                  ]}
                >
                  <FontAwesome6 name={item.icon} size={16} color={item.c} />
                </View>
                <Text style={[s.docName, { color: C.textPrimary }]}>
                  {item.label}
                </Text>
                <Text style={[s.docSub, { color: C.textTertiary }]}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick actions */}
          <SectionDivider label="AKSES CEPAT" C={C} />
          <View style={s.quickGrid}>
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={s.qaItem}
                activeOpacity={0.75}
                onPress={() => router.push(item.route as any)}
              >
                <View
                  style={[
                    s.qaIconWrap,
                    { backgroundColor: item.bg, borderColor: C.borderStrong },
                    C.shadowSm,
                  ]}
                >
                  <FontAwesome6 name={item.icon} size={18} color={item.color} />
                </View>
                <Text
                  style={[s.qaLabel, { color: C.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meetings */}
          <SectionDivider label="RAPAT MENDATANG" C={C} />
          <View
            style={[
              s.panel,
              { backgroundColor: C.surface, borderColor: C.borderStrong },
              C.shadowSm,
            ]}
          >
            <View
              style={[s.panelTopLine, { backgroundColor: C.panelTopLine }]}
            />
            <View style={s.panelHeader}>
              <View style={s.panelHeaderLeft}>
                <View
                  style={[
                    s.panelIcon,
                    {
                      backgroundColor: C.accentBg,
                      borderColor: C.accentBorder,
                    },
                  ]}
                >
                  <FontAwesome6
                    name="calendar-days"
                    size={12}
                    color={C.accent}
                  />
                </View>
                <View>
                  <Text style={[s.panelTitle, { color: C.textPrimary }]}>
                    Rapat Mendatang
                  </Text>
                  <Text style={[s.panelSub, { color: C.textTertiary }]}>
                    Jadwal terdekat Anda
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  s.panelBtn,
                  { backgroundColor: C.accentBg, borderColor: C.accentBorder },
                ]}
                onPress={() => router.push("/undangan/undangan-masuk" as any)}
              >
                <Text style={[s.panelBtnText, { color: C.accent }]}>Lihat</Text>
                <FontAwesome6 name="chevron-right" size={8} color={C.accent} />
              </TouchableOpacity>
            </View>

            {upcomingMeetings.length === 0 ? (
              <EmptyState
                icon="calendar-xmark"
                title="Tidak Ada Rapat"
                desc="Tidak ada jadwal dalam waktu dekat"
                C={C}
              />
            ) : (
              upcomingMeetings.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.id}-${idx}`}
                  style={[
                    s.miItem,
                    idx > 0 && {
                      borderTopWidth: 0.5,
                      borderTopColor: C.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(`/undangan/undangan-detail?id=${item.id}`)
                  }
                >
                  <View style={s.miDate}>
                    <Text style={[s.miDay, { color: C.accent }]}>
                      {item.day}
                    </Text>
                    <Text style={[s.miMonth, { color: C.accent2 }]}>
                      {item.month}
                    </Text>
                  </View>
                  <View
                    style={[s.miSep, { backgroundColor: C.borderStrong }]}
                  />
                  <View style={s.miContent}>
                    <Text
                      style={[s.miTitle, { color: C.textPrimary }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <View style={s.miMeta}>
                      <View
                        style={[
                          s.miTag,
                          {
                            backgroundColor: C.accentBg,
                            borderColor: C.accentBorder,
                          },
                        ]}
                      >
                        <Text style={[s.miTagText, { color: C.accent }]}>
                          {item.time}
                        </Text>
                      </View>
                      <Text
                        style={[s.miInfo, { color: C.textTertiary }]}
                        numberOfLines={1}
                      >
                        {item.room}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      s.miBadge,
                      item.diff === 0
                        ? {
                            backgroundColor: C.badgeNowBg,
                            borderColor: C.badgeNowBd,
                          }
                        : {
                            backgroundColor: C.badgeSoonBg,
                            borderColor: C.badgeSoonBd,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        s.miBadgeText,
                        { color: item.diff === 0 ? C.badgeNowC : C.badgeSoonC },
                      ]}
                    >
                      {item.diff === 0 ? "Hari Ini" : `${item.diff}h`}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="chevron-right"
                    size={10}
                    color={C.textMuted}
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Approval (role 3) */}
          {role === "3" && (
            <>
              <SectionDivider label="MENUNGGU APPROVAL" C={C} />
              <View
                style={[
                  s.panel,
                  { backgroundColor: C.surface, borderColor: C.borderStrong },
                  C.shadowSm,
                ]}
              >
                <View
                  style={[s.panelTopLine, { backgroundColor: C.panelTopLine }]}
                />
                <View style={s.panelHeader}>
                  <View style={s.panelHeaderLeft}>
                    <View
                      style={[
                        s.panelIcon,
                        {
                          backgroundColor: C.accentBg,
                          borderColor: C.accentBorder,
                        },
                      ]}
                    >
                      <FontAwesome6
                        name="shield-halved"
                        size={12}
                        color={C.accent}
                      />
                    </View>
                    <View>
                      <Text style={[s.panelTitle, { color: C.textPrimary }]}>
                        Menunggu Approval
                      </Text>
                      <Text style={[s.panelSub, { color: C.textTertiary }]}>
                        Dokumen perlu ditinjau
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      s.panelBtn,
                      {
                        backgroundColor: C.accentBg,
                        borderColor: C.accentBorder,
                      },
                    ]}
                    onPress={() => router.push("/approval/approval" as any)}
                  >
                    <Text style={[s.panelBtnText, { color: C.accent }]}>
                      Lihat
                    </Text>
                    <FontAwesome6
                      name="chevron-right"
                      size={8}
                      color={C.accent}
                    />
                  </TouchableOpacity>
                </View>

                {waitingApproval.length === 0 ? (
                  <EmptyState
                    icon="circle-check"
                    title="Semua Beres"
                    desc="Semua dokumen telah disetujui"
                    C={C}
                  />
                ) : (
                  waitingApproval.map((item, idx) => {
                    const st = getApvStyle(item.type);
                    return (
                      <TouchableOpacity
                        key={`${item.type}-${item.id}-${idx}`}
                        style={[
                          s.apvItem,
                          idx > 0 && {
                            borderTopWidth: 0.5,
                            borderTopColor: C.border,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => navigateApproval(item)}
                      >
                        <View
                          style={[
                            s.apvIcon,
                            { backgroundColor: st.bg, borderColor: st.bd },
                          ]}
                        >
                          <FontAwesome6
                            name={getIconForType(item.type)}
                            size={15}
                            color={st.c}
                          />
                        </View>
                        <View style={s.apvContent}>
                          <Text
                            style={[s.apvTitle, { color: C.textPrimary }]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <View style={s.apvMeta}>
                            <View
                              style={[
                                s.apvPill,
                                { backgroundColor: st.bg, borderColor: st.bd },
                              ]}
                            >
                              <Text style={[s.apvPillText, { color: st.c }]}>
                                {item.type.toUpperCase()}
                              </Text>
                            </View>
                            <Text
                              style={[s.apvDate, { color: C.textTertiary }]}
                            >
                              {item.date}
                            </Text>
                          </View>
                        </View>
                        <FontAwesome6
                          name="chevron-right"
                          size={10}
                          color={C.textMuted}
                        />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* ── EXIT MODAL ───────────────────────────────────────────────────────── */}
      {showExitModal && (
        <View style={s.modalOverlay}>
          <View
            style={[
              s.modalBox,
              { backgroundColor: C.surface, borderColor: C.borderStrong },
              C.shadowMd,
            ]}
          >
            <View
              style={[s.modalTopLine, { backgroundColor: C.accentBorder }]}
            />
            <View
              style={[
                s.modalIconWrap,
                { backgroundColor: C.accentBg, borderColor: C.accentBorder },
              ]}
            >
              <FontAwesome6
                name="right-from-bracket"
                size={20}
                color={C.accent}
              />
            </View>
            <Text style={[s.modalTitle, { color: C.textPrimary }]}>
              Keluar dari SIPO?
            </Text>
            <Text style={[s.modalDesc, { color: C.textTertiary }]}>
              Tekan keluar untuk menutup aplikasi
            </Text>
            <View style={s.modalBtnRow}>
              <TouchableOpacity
                style={[
                  s.modalCancelBtn,
                  { backgroundColor: C.surface3, borderColor: C.borderStrong },
                ]}
                onPress={() => {
                  setShowExitModal(false);
                  backPressCount.current = 0;
                }}
              >
                <Text style={[s.modalCancelText, { color: C.textSecondary }]}>
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.modalExitBtn,
                  { backgroundColor: C.accentBg, borderColor: C.accentBorder },
                ]}
                onPress={() => BackHandler.exitApp()}
              >
                <Text style={[s.modalExitText, { color: C.accent }]}>
                  Keluar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider({ label, C }: { label: string; C: ThemeColors }) {
  return (
    <View style={div.wrap}>
      <View style={[div.line, { backgroundColor: C.borderStrong }]} />
      <Text style={[div.text, { color: C.textMuted }]}>{label}</Text>
      <View style={[div.line, { backgroundColor: C.borderStrong }]} />
    </View>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  C,
}: {
  icon: string;
  title: string;
  desc: string;
  C: ThemeColors;
}) {
  return (
    <View style={empty.wrap}>
      <View
        style={[
          empty.ring,
          { borderColor: C.borderStrong, backgroundColor: C.surface2 },
        ]}
      >
        <FontAwesome6 name={icon as any} size={20} color={C.textMuted} />
      </View>
      <Text style={[empty.title, { color: C.textTertiary }]}>{title}</Text>
      <Text style={[empty.desc, { color: C.textMuted }]}>{desc}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  orb1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -90,
    right: -90,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: 200,
    left: -70,
  },

  // Header
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 14 },

  avatarWrap: { width: 48, height: 48, position: "relative", marginRight: 12 },
  avatarRing: {
    position: "absolute",
    top: -3,
    left: -3,
    width: 54,
    height: 54,
    borderRadius: 17,
    borderWidth: 1.5,
  },
  avatarPh: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 48, height: 48, borderRadius: 14 },
  avatarIni: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  onlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
  },

  greetBlock: { flex: 1, minWidth: 0 },
  greetTop: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 3,
  },
  greetName: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },

  hbtns: { flexDirection: "row", gap: 8 },
  hbtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
  },

  sysBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sysDot: { width: 7, height: 7, borderRadius: 4 },
  sysText: { flex: 1, fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
  sysOnline: { fontSize: 10, fontWeight: "600" },

  content: { paddingHorizontal: 14 },

  // Doc grid
  docGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  docCard: {
    width: "47.5%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    position: "relative",
  },
  docGlow: {
    position: "absolute",
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 0.5,
  },
  docName: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  docSub: { fontSize: 9.5, fontWeight: "500", letterSpacing: 0.2 },

  // Quick grid
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  qaItem: { width: "22%", alignItems: "center", gap: 7 },
  qaIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  qaLabel: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 12,
    letterSpacing: 0.3,
  },

  // Panel
  panel: {
    borderWidth: 0.5,
    borderRadius: 18,
    padding: 14,
    marginBottom: 0,
    overflow: "hidden",
    position: "relative",
  },
  panelTopLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  panelHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  panelIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: { fontSize: 13, fontWeight: "800", letterSpacing: -0.2 },
  panelSub: { fontSize: 10, fontWeight: "500", marginTop: 1 },
  panelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 0.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  panelBtnText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2 },

  // Meeting
  miItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  miDate: { width: 34, alignItems: "center" },
  miDay: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  miMonth: { fontSize: 8.5, fontWeight: "700", letterSpacing: 0.5 },
  miSep: { width: 0.5, height: 38 },
  miContent: { flex: 1, minWidth: 0 },
  miTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  miMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  miTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
  },
  miTagText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },
  miInfo: { fontSize: 10, fontWeight: "500", flex: 1 },
  miBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
  },
  miBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.2 },

  // Approval
  apvItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  apvIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    flexShrink: 0,
  },
  apvContent: { flex: 1, minWidth: 0 },
  apvTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  apvMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  apvPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  apvPillText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  apvDate: { fontSize: 10, fontWeight: "500" },

  // Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,20,50,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalBox: {
    width: "82%",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 0.5,
    overflow: "hidden",
  },
  modalTopLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalDesc: { fontSize: 12, textAlign: "center", marginBottom: 22 },
  modalBtnRow: { flexDirection: "row", gap: 10, width: "100%" },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "700" },
  modalExitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: "center",
  },
  modalExitText: { fontSize: 14, fontWeight: "700" },
});

const div = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 18,
  },
  line: { flex: 1, height: 0.5 },
  text: { fontSize: 9, fontWeight: "700", letterSpacing: 2 },
});

const empty = StyleSheet.create({
  wrap: { paddingVertical: 20, alignItems: "center", gap: 5 },
  ring: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 12.5, fontWeight: "700" },
  desc: { fontSize: 11, textAlign: "center" },
});
