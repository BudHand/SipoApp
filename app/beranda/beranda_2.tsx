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

// ─── Types ────────────────────────────────────────────────────────────────────

type QuickAction = {
  label: string;
  icon: string;
  bg: string;
  iconColor: string;
  route: string;
};

type DocumentSummary = {
  label: string;
  value: number;
  icon: string;
  iconColor: string;
  bg: string;
  accent: string;
  route: string;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BerandaScreen() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [waitingApproval, setWaitingApproval] = useState<any[]>([]);

  const [memoCount, setMemoCount] = useState(0);
  const [undanganCount, setUndanganCount] = useState(0);
  const [risalahCount, setRisalahCount] = useState(0);
  const [disposisiCount, setDisposisiCount] = useState(0);

  const [fullname, setFullname] = useState("-");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const backPressCount = useRef(0);
  const [showExitModal, setShowExitModal] = useState(false);

  const getCountFromResponse = (res: any) => {
    if (Array.isArray(res)) return res.length;
    if (Array.isArray(res?.data)) return res.data.length;
    if (Array.isArray(res?.data?.data)) return res.data.data.length;
    return 0;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(!!token);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked) SplashScreen.hideAsync();
  }, [authChecked]);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setRole(await AsyncStorage.getItem("role"));

      const dashboardRes = await apiFetch("/dashboard");
      const memoMasukRes = await apiFetch("/memos/masuk");
      const memoKeluarRes = await apiFetch("/memos/keluar");
      const undanganMasukRes = await apiFetch("/undangans/masuk");
      const undanganKeluarRes = await apiFetch("/undangans/keluar");
      const profileRes = await apiFetch("/profile");

      if (dashboardRes.data) {
        const { risalah_count, undangan, recent_docs, fullname } =
          dashboardRes.data;

        setFullname(fullname ?? "-");
        setProfileImage(
          profileRes?.profile_image ?? profileRes?.data?.profile_image ?? null,
        );
        setRisalahCount(risalah_count ?? 0);

        const memoTotal =
          getCountFromResponse(memoMasukRes) +
          getCountFromResponse(memoKeluarRes);
        const undanganTotal =
          getCountFromResponse(undanganMasukRes) +
          getCountFromResponse(undanganKeluarRes);

        setMemoCount(memoTotal);
        setUndanganCount(undanganTotal);
        setDisposisiCount(0); // TODO: hook ke endpoint disposisi

        const meetings = (undangan ?? []).map((u: any) => ({
          title: u.judul,
          date: formatTanggalID(u.tgl_rapat),
          time: u.waktu ?? "-",
          room: u.tempat ?? "-",
          id: u.id_undangan,
          diff: u.selisih_hari,
        }));

        const approval = (recent_docs ?? []).map((doc: any) => ({
          title: doc.judul,
          date: formatTanggalID(doc.tgl_dokumen),
          type: doc.tipe,
          id: doc.id,
        }));

        setUpcomingMeetings(meetings);
        setWaitingApproval(approval);
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
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => backHandler.remove();
  }, []);

  if (!authChecked) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  // ─── Data ──────────────────────────────────────────────────────────────────

  const documentSummaries: DocumentSummary[] = [
    {
      label: "Memo",
      value: memoCount,
      icon: "envelope",
      iconColor: "#2563EB",
      bg: "#EEF4FF",
      accent: "#BFDBFE",
      route: "",
    },
    {
      label: "Undangan",
      value: undanganCount,
      icon: "calendar-check",
      iconColor: "#7C3AED",
      bg: "#F5F0FF",
      accent: "#DDD6FE",
      route: "",
    },
    {
      label: "Risalah",
      value: risalahCount,
      icon: "file-lines",
      iconColor: "#059669",
      bg: "#ECFDF5",
      accent: "#A7F3D0",
      route: "",
    },
    {
      label: "Disposisi",
      value: disposisiCount,
      icon: "paper-plane",
      iconColor: "#D97706",
      bg: "#FFFBEB",
      accent: "#FDE68A",
      route: "",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Memo Masuk",
      icon: "envelope-open",
      bg: "#EEF4FF",
      iconColor: "#2563EB",
      route: "/memo/memo-masuk",
    },
    {
      label: "Memo Keluar",
      icon: "envelope",
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      route: "/memo/memo-keluar",
    },
    {
      label: "Undangan Masuk",
      icon: "calendar-plus",
      bg: "#F5F0FF",
      iconColor: "#7C3AED",
      route: "/undangan/undangan-masuk",
    },
    {
      label: "Undangan Keluar",
      icon: "calendar-check",
      bg: "#EDE9FE",
      iconColor: "#6D28D9",
      route: "/undangan/undangan-keluar",
    },
    {
      label: "Risalah",
      icon: "file-lines",
      bg: "#ECFDF5",
      iconColor: "#059669",
      route: "/risalah/risalah",
    },
    {
      label: "Disposisi",
      icon: "paper-plane",
      bg: "#FFFBEB",
      iconColor: "#D97706",
      route: "/approval/approval",
    },
    {
      label: "Profil",
      icon: "user",
      bg: "#F1F5F9",
      iconColor: "#475569",
      route: "/profil/profil",
    },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case "undangan":
        return "calendar-check";
      case "memo":
        return "envelope";
      case "risalah":
        return "file-lines";
      default:
        return "file";
    }
  };

  const getIconColorForType = (type: string) => {
    switch (type) {
      case "undangan":
        return "#7C3AED";
      case "memo":
        return "#2563EB";
      case "risalah":
        return "#059669";
      default:
        return "#64748B";
    }
  };

  const getIconBgForType = (type: string) => {
    switch (type) {
      case "undangan":
        return "#F5F0FF";
      case "memo":
        return "#EEF4FF";
      case "risalah":
        return "#ECFDF5";
      default:
        return "#F1F5F9";
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1F316F" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1F316F"]}
            tintColor="#1F316F"
          />
        }
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Decorative circles */}
          <View style={styles.heroCircleA} />
          <View style={styles.heroCircleB} />
          <View style={styles.heroCircleC} />

          <View style={styles.headerRow}>
            {/* Avatar + Greeting */}
            <View style={styles.profileWrap}>
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <FontAwesome6 name="user" size={22} color="#1F316F" />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Selamat datang,</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {fullname}
                </Text>
              </View>
            </View>

            {/* Header actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => router.push("/notifikasi/notifikasi" as any)}
              >
                <FontAwesome6 name="bell" size={15} color="#fff" />
                <View style={styles.notifDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => router.push("/profil/profil" as any)}
              >
                <FontAwesome6 name="gear" size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date badge */}
          <View style={styles.dateBadgeWrap}>
            <FontAwesome6
              name="calendar"
              size={11}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* ── CONTENT ───────────────────────────────────────────────────── */}
        <View style={styles.content}>
          {/* ── RINGKASAN DOKUMEN ─────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    { backgroundColor: "#EEF4FF" },
                  ]}
                >
                  <FontAwesome6 name="chart-bar" size={13} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Ringkasan Dokumen</Text>
                  <Text style={styles.cardSubtitle}>
                    Total dokumen aktif Anda
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={fetchDashboardData}
                style={styles.refreshBtn}
              >
                <FontAwesome6 name="rotate" size={12} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryGrid}>
              {documentSummaries.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.summaryItem,
                    { backgroundColor: item.bg, borderColor: item.accent },
                  ]}
                  activeOpacity={0.82}
                  onPress={() =>
                    item.route ? router.push(item.route as any) : null
                  }
                >
                  <View
                    style={[
                      styles.summaryIconCircle,
                      { backgroundColor: "#fff" },
                    ]}
                  >
                    <FontAwesome6
                      name={item.icon as any}
                      size={18}
                      color={item.iconColor}
                    />
                  </View>
                  <Text
                    style={[styles.summaryValue, { color: item.iconColor }]}
                  >
                    {item.value}
                  </Text>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── AKSES CEPAT ───────────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    { backgroundColor: "#F5F0FF" },
                  ]}
                >
                  <FontAwesome6 name="bolt" size={13} color="#7C3AED" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Akses Cepat</Text>
                  <Text style={styles.cardSubtitle}>
                    Navigasi menu utama SIPO
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.quickGrid}>
              {quickActions.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.quickItem}
                  activeOpacity={0.8}
                  onPress={() => router.push(item.route as any)}
                >
                  <View
                    style={[styles.quickIconWrap, { backgroundColor: item.bg }]}
                  >
                    <FontAwesome6
                      name={item.icon as any}
                      size={20}
                      color={item.iconColor}
                    />
                  </View>
                  <Text style={styles.quickLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── RAPAT MENDATANG ───────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    { backgroundColor: "#ECFDF5" },
                  ]}
                >
                  <FontAwesome6
                    name="calendar-days"
                    size={13}
                    color="#059669"
                  />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Rapat Mendatang</Text>
                  <Text style={styles.cardSubtitle}>Jadwal terdekat Anda</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.lihatBtn}
                onPress={() => router.push("/undangan/undangan-masuk" as any)}
              >
                <Text style={styles.lihatBtnText}>Lihat Semua</Text>
                <FontAwesome6 name="chevron-right" size={9} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {upcomingMeetings.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <FontAwesome6
                    name="calendar-xmark"
                    size={24}
                    color="#CBD5E1"
                  />
                </View>
                <Text style={styles.emptyTitle}>Tidak Ada Rapat</Text>
                <Text style={styles.emptyDesc}>
                  Tidak ada jadwal rapat dalam waktu dekat
                </Text>
              </View>
            ) : (
              <View>
                {upcomingMeetings.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.id}-${idx}`}
                    activeOpacity={0.85}
                    style={[
                      styles.listItem,
                      idx < upcomingMeetings.length - 1 &&
                        styles.listItemDivider,
                    ]}
                    onPress={() =>
                      router.push(`/undangan/undangan-detail?id=${item.id}`)
                    }
                  >
                    <View
                      style={[
                        styles.listIconWrap,
                        { backgroundColor: "#F5F0FF" },
                      ]}
                    >
                      <FontAwesome6
                        name="calendar-check"
                        size={16}
                        color="#7C3AED"
                      />
                    </View>

                    <View style={styles.listContent}>
                      <View style={styles.listTitleRow}>
                        <Text style={styles.listTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            item.diff === 0
                              ? styles.badgeToday
                              : styles.badgeSoon,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              item.diff === 0
                                ? styles.badgeTodayText
                                : styles.badgeSoonText,
                            ]}
                          >
                            {item.diff === 0 ? "Hari Ini" : `${item.diff}h`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.listMetaRow}>
                        <FontAwesome6 name="clock" size={10} color="#94A3B8" />
                        <Text style={styles.listMeta}>
                          {item.date} • {item.time}
                        </Text>
                      </View>
                      <View style={styles.listMetaRow}>
                        <FontAwesome6
                          name="location-dot"
                          size={10}
                          color="#94A3B8"
                        />
                        <Text style={styles.listMeta} numberOfLines={1}>
                          {item.room}
                        </Text>
                      </View>
                    </View>

                    <FontAwesome6
                      name="chevron-right"
                      size={12}
                      color="#CBD5E1"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── WAITING APPROVAL (role === "3") ───────────────────────────── */}
          {role === "3" && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View
                    style={[
                      styles.cardHeaderIcon,
                      { backgroundColor: "#FFFBEB" },
                    ]}
                  >
                    <FontAwesome6 name="stamp" size={13} color="#D97706" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Menunggu Approval</Text>
                    <Text style={styles.cardSubtitle}>
                      Dokumen perlu ditinjau
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.lihatBtn}
                  onPress={() => router.push("/approval/approval" as any)}
                >
                  <Text style={styles.lihatBtnText}>Lihat Semua</Text>
                  <FontAwesome6 name="chevron-right" size={9} color="#2563EB" />
                </TouchableOpacity>
              </View>

              {waitingApproval.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <FontAwesome6
                      name="circle-check"
                      size={24}
                      color="#CBD5E1"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>Semua Beres</Text>
                  <Text style={styles.emptyDesc}>
                    Semua dokumen telah disetujui
                  </Text>
                </View>
              ) : (
                <View>
                  {waitingApproval.map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.type}-${item.id}-${idx}`}
                      activeOpacity={0.85}
                      style={[
                        styles.listItem,
                        idx < waitingApproval.length - 1 &&
                          styles.listItemDivider,
                      ]}
                      onPress={() => {
                        switch (item.type) {
                          case "memo":
                            router.push(`/memo/memo-detail?id=${item.id}`);
                            break;
                          case "undangan":
                            router.push(
                              `/undangan/undangan-detail?id=${item.id}`,
                            );
                            break;
                          case "risalah":
                            router.push(
                              `/risalah/risalah-detail?id=${item.id}`,
                            );
                            break;
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.listIconWrap,
                          { backgroundColor: getIconBgForType(item.type) },
                        ]}
                      >
                        <FontAwesome6
                          name={getIconForType(item.type) as any}
                          size={16}
                          color={getIconColorForType(item.type)}
                        />
                      </View>

                      <View style={styles.listContent}>
                        <Text style={styles.listTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={styles.listMetaRow}>
                          <FontAwesome6
                            name="clock"
                            size={10}
                            color="#94A3B8"
                          />
                          <Text style={styles.listMeta}>{item.date}</Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.typePill,
                          { backgroundColor: getIconBgForType(item.type) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typePillText,
                            { color: getIconColorForType(item.type) },
                          ]}
                        >
                          {item.type}
                        </Text>
                      </View>

                      <FontAwesome6
                        name="chevron-right"
                        size={12}
                        color="#CBD5E1"
                        style={{ marginLeft: 6 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── EXIT MODAL ────────────────────────────────────────────────────── */}
      {showExitModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <FontAwesome6
                name="right-from-bracket"
                size={22}
                color="#1F316F"
              />
            </View>
            <Text style={styles.modalTitle}>Keluar dari aplikasi?</Text>
            <Text style={styles.modalDesc}>
              Tekan keluar untuk menutup SIPO
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowExitModal(false);
                  backPressCount.current = 0;
                }}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalExitBtn}
                onPress={() => BackHandler.exitApp()}
              >
                <Text style={styles.modalExitText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const NAVY = "#1F316F";
// const NAVY_DARK = "#162350";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NAVY },
  scroll: { flex: 1, backgroundColor: "#F0F4FF" },
  scrollContent: { paddingBottom: 120 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
    position: "relative",
    overflow: "hidden",
  },

  heroCircleA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.06)",
    right: -80,
    top: -70,
  },
  heroCircleB: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
    left: -50,
    bottom: 0,
  },
  heroCircleC: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: 60,
    bottom: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  profileWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },

  avatarImage: { width: 48, height: 48, borderRadius: 24 },

  greeting: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 1,
    letterSpacing: -0.3,
  },

  headerActions: { flexDirection: "row", gap: 8 },

  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notifDot: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#F87171",
    borderWidth: 1.5,
    borderColor: NAVY,
  },

  dateBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  dateText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    marginTop: -56,
    paddingHorizontal: 14,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#1F316F",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(31,49,111,0.06)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  cardSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },

  refreshBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Summary Grid ──────────────────────────────────────────────────────────
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },

  summaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  summaryLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.1,
  },

  // ── Quick Grid ────────────────────────────────────────────────────────────
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  quickItem: {
    width: "22%",
    alignItems: "center",
    gap: 7,
  },

  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  quickLabel: {
    fontSize: 10.5,
    color: "#334155",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 13,
  },

  // ── Lihat btn ─────────────────────────────────────────────────────────────
  lihatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  lihatBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  // ── List Items ────────────────────────────────────────────────────────────
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },

  listItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  listIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  listContent: { flex: 1, gap: 3 },

  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  listTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.1,
  },

  listMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  listMeta: {
    fontSize: 11.5,
    color: "#94A3B8",
    flex: 1,
  },

  // ── Badges ────────────────────────────────────────────────────────────────
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },

  badgeToday: { backgroundColor: "#FEF3C7" },
  badgeSoon: { backgroundColor: "#EEF4FF" },

  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.1,
  },

  badgeTodayText: { color: "#D97706" },
  badgeSoonText: { color: "#2563EB" },

  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  typePillText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 6,
  },

  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },

  emptyDesc: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },

  // ── Exit Modal ────────────────────────────────────────────────────────────
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalBox: {
    width: "82%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  modalDesc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 22,
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },

  modalExitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: "center",
  },

  modalExitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
