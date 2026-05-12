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

// ─── Types ─────────────────────────────────────────────────────────────────────

type DocCard = {
  label: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  glowColor: string;
  cardBg: string[];
  route: string;
};

type QuickAction = {
  label: string;
  icon: string;
  iconColor: string;
  bg: string;
  route: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const BG = "#060B18";
const SURFACE = "#0C1220";
const CYAN = "#00D4FF";
const CYAN_DIM = "rgba(0,212,255,0.08)";
const CYAN_BORDER = "rgba(0,212,255,0.15)";
const WHITE_HIGH = "rgba(255,255,255,0.88)";
const WHITE_MED = "rgba(255,255,255,0.45)";
const WHITE_LOW = "rgba(255,255,255,0.25)";
const WHITE_GHOST = "rgba(255,255,255,0.06)";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function BerandaScreenV2() {
  const router = useRouter();

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

  const getCountFromResponse = (res: any) => {
    if (Array.isArray(res)) return res.length;
    if (Array.isArray(res?.data)) return res.data.length;
    if (Array.isArray(res?.data?.data)) return res.data.data.length;
    return 0;
  };

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

      const [dashboardRes, profileRes, , , ,] = await Promise.all([
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

        const meetings = (undangan ?? []).map((u: any) => ({
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
    const h = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => h.remove();
  }, []);

  if (!authChecked) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  // ─── Data ────────────────────────────────────────────────────────────────────

  const docCards: DocCard[] = [
    {
      label: "Memo",
      subtitle: "Surat menyurat internal",
      icon: "envelope",
      iconColor: "#00AAFF",
      iconBg: "rgba(0,132,255,0.15)",
      iconBorder: "rgba(0,132,255,0.25)",
      glowColor: "rgba(0,132,255,0.2)",
      cardBg: ["#0A1628", "#0D2040"],
      route: "",
    },
    {
      label: "Undangan",
      subtitle: "Jadwal & undangan rapat",
      icon: "calendar-check",
      iconColor: "#AA77FF",
      iconBg: "rgba(120,80,255,0.15)",
      iconBorder: "rgba(120,80,255,0.25)",
      glowColor: "rgba(120,80,255,0.2)",
      cardBg: ["#120A28", "#1E0D40"],
      route: "",
    },
    {
      label: "Risalah",
      subtitle: "Notulensi & catatan rapat",
      icon: "file-lines",
      iconColor: "#00CC80",
      iconBg: "rgba(0,200,120,0.15)",
      iconBorder: "rgba(0,200,120,0.25)",
      glowColor: "rgba(0,200,120,0.2)",
      cardBg: ["#0A2018", "#0D3025"],
      route: "",
    },
    {
      label: "Disposisi",
      subtitle: "Pendelegasian dokumen",
      icon: "paper-plane",
      iconColor: "#FFAA00",
      iconBg: "rgba(255,160,0,0.15)",
      iconBorder: "rgba(255,160,0,0.25)",
      glowColor: "rgba(255,160,0,0.2)",
      cardBg: ["#281A08", "#3D2808"],
      route: "",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Memo Masuk",
      icon: "envelope-open",
      iconColor: "#00AAFF",
      bg: "#0D1E38",
      route: "/memo/memo-masuk",
    },
    {
      label: "Memo Keluar",
      icon: "envelope",
      iconColor: "#5599FF",
      bg: "#101B38",
      route: "/memo/memo-keluar",
    },
    {
      label: "Undangan Masuk",
      icon: "calendar-plus",
      iconColor: "#AA77FF",
      bg: "#160E32",
      route: "/undangan/undangan-masuk",
    },
    {
      label: "Undangan Keluar",
      icon: "calendar-minus",
      iconColor: "#8855EE",
      bg: "#141232",
      route: "/undangan/undangan-keluar",
    },
    {
      label: "Risalah",
      icon: "file-lines",
      iconColor: "#00CC80",
      bg: "#0A1E16",
      route: "/risalah/risalah",
    },
    {
      label: "Disposisi",
      icon: "paper-plane",
      iconColor: "#FFAA00",
      bg: "#1E1608",
      route: "/approval/approval",
    },
    {
      label: "Profil",
      icon: "user",
      iconColor: "#88AACC",
      bg: "#121218",
      route: "/profil/profil",
    },
  ];

  const getApprovalStyle = (type: string) => {
    switch (type) {
      case "memo":
        return {
          iconColor: "#00AAFF",
          iconBg: "rgba(0,132,255,0.1)",
          iconBorder: "rgba(0,132,255,0.2)",
          pillColor: "#00AAFF",
          pillBg: "rgba(0,132,255,0.1)",
          pillBorder: "rgba(0,132,255,0.2)",
        };
      case "undangan":
        return {
          iconColor: "#AA77FF",
          iconBg: "rgba(120,80,255,0.1)",
          iconBorder: "rgba(120,80,255,0.2)",
          pillColor: "#AA77FF",
          pillBg: "rgba(120,80,255,0.1)",
          pillBorder: "rgba(120,80,255,0.2)",
        };
      case "risalah":
        return {
          iconColor: "#00CC80",
          iconBg: "rgba(0,200,120,0.1)",
          iconBorder: "rgba(0,200,120,0.2)",
          pillColor: "#00CC80",
          pillBg: "rgba(0,200,120,0.1)",
          pillBorder: "rgba(0,200,120,0.2)",
        };
      default:
        return {
          iconColor: "#88AACC",
          iconBg: "rgba(136,170,204,0.1)",
          iconBorder: "rgba(136,170,204,0.2)",
          pillColor: "#88AACC",
          pillBg: "rgba(136,170,204,0.1)",
          pillBorder: "rgba(136,170,204,0.2)",
        };
    }
  };

  const getIconForType = (type: string) => {
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

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[CYAN]}
            tintColor={CYAN}
          />
        }
      >
        {/* ── Grid background overlay ── */}
        <View style={styles.gridOverlay} pointerEvents="none" />
        <View style={styles.orb1} pointerEvents="none" />
        <View style={styles.orb2} pointerEvents="none" />

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Top row */}
          <View style={styles.headerTop}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing} />
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>

            {/* Greeting */}
            <View style={styles.greetBlock}>
              <Text style={styles.greetTop}>SELAMAT DATANG</Text>
              <Text style={styles.greetName} numberOfLines={1}>
                {fullname}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.hbtns}>
              <TouchableOpacity
                style={styles.hbtn}
                onPress={() => router.push("/notifikasi/notifikasi" as any)}
              >
                <FontAwesome6
                  name="bell"
                  size={14}
                  color="rgba(255,255,255,0.55)"
                />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hbtn}
                onPress={() => router.push("/profil/profil" as any)}
              >
                <FontAwesome6
                  name="sliders"
                  size={14}
                  color="rgba(255,255,255,0.55)"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* System banner */}
          <View style={styles.sysBanner}>
            <View style={styles.sysDot} />
            <Text style={styles.sysText}>Sistem SIPO aktif — {dateStr}</Text>
            <Text style={styles.sysOnline}>Online</Text>
          </View>
        </View>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <View style={styles.content}>
          {/* Section label */}
          <SectionDivider label="RINGKASAN DOKUMEN" />

          {/* Doc Cards 2x2 */}
          <View style={styles.docGrid}>
            {docCards.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.docCard}
                activeOpacity={0.8}
                onPress={() =>
                  item.route ? router.push(item.route as any) : null
                }
              >
                {/* Glow */}
                <View
                  style={[styles.docGlow, { backgroundColor: item.glowColor }]}
                />
                {/* Icon */}
                <View
                  style={[
                    styles.docIconWrap,
                    {
                      backgroundColor: item.iconBg,
                      borderColor: item.iconBorder,
                    },
                  ]}
                >
                  <FontAwesome6
                    name={item.icon as any}
                    size={16}
                    color={item.iconColor}
                  />
                </View>
                <Text style={styles.docName}>{item.label}</Text>
                <Text style={styles.docSub}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionDivider label="AKSES CEPAT" />

          {/* Quick actions */}
          <View style={styles.quickGrid}>
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.qaItem}
                activeOpacity={0.75}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.qaIconWrap, { backgroundColor: item.bg }]}>
                  <FontAwesome6
                    name={item.icon as any}
                    size={18}
                    color={item.iconColor}
                  />
                </View>
                <Text style={styles.qaLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionDivider label="RAPAT MENDATANG" />

          {/* Meetings panel */}
          <View style={styles.panel}>
            <View style={styles.panelTopLine} />
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderLeft}>
                <View style={styles.panelIcon}>
                  <FontAwesome6 name="calendar-days" size={12} color={CYAN} />
                </View>
                <View>
                  <Text style={styles.panelTitle}>Rapat Mendatang</Text>
                  <Text style={styles.panelSub}>Jadwal terdekat Anda</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.panelBtn}
                onPress={() => router.push("/undangan/undangan-masuk" as any)}
              >
                <Text style={styles.panelBtnText}>Lihat</Text>
                <FontAwesome6 name="chevron-right" size={8} color={CYAN} />
              </TouchableOpacity>
            </View>

            {upcomingMeetings.length === 0 ? (
              <EmptyState
                icon="calendar-xmark"
                title="Tidak Ada Rapat"
                desc="Tidak ada jadwal dalam waktu dekat"
              />
            ) : (
              upcomingMeetings.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.id}-${idx}`}
                  style={[styles.meetingItem, idx > 0 && styles.itemDivider]}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(`/undangan/undangan-detail?id=${item.id}`)
                  }
                >
                  <View style={styles.miDateBlock}>
                    <Text style={styles.miDay}>{item.day}</Text>
                    <Text style={styles.miMonth}>{item.month}</Text>
                  </View>
                  <View style={styles.miSep} />
                  <View style={styles.miContent}>
                    <Text style={styles.miTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.miMeta}>
                      <View style={styles.miTag}>
                        <Text style={styles.miTagText}>{item.time}</Text>
                      </View>
                      <Text style={styles.miInfo} numberOfLines={1}>
                        {item.room}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.miBadge,
                      item.diff === 0 ? styles.miBadgeNow : styles.miBadgeSoon,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miBadgeText,
                        item.diff === 0
                          ? styles.miBadgeNowText
                          : styles.miBadgeSoonText,
                      ]}
                    >
                      {item.diff === 0 ? "Hari Ini" : `${item.diff}h`}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="chevron-right"
                    size={10}
                    color="rgba(255,255,255,0.2)"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Approval (role 3) */}
          {role === "3" && (
            <>
              <SectionDivider label="MENUNGGU APPROVAL" />
              <View style={styles.panel}>
                <View style={styles.panelTopLine} />
                <View style={styles.panelHeader}>
                  <View style={styles.panelHeaderLeft}>
                    <View style={styles.panelIcon}>
                      <FontAwesome6
                        name="shield-halved"
                        size={12}
                        color={CYAN}
                      />
                    </View>
                    <View>
                      <Text style={styles.panelTitle}>Menunggu Approval</Text>
                      <Text style={styles.panelSub}>
                        Dokumen perlu ditinjau
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.panelBtn}
                    onPress={() => router.push("/approval/approval" as any)}
                  >
                    <Text style={styles.panelBtnText}>Lihat</Text>
                    <FontAwesome6 name="chevron-right" size={8} color={CYAN} />
                  </TouchableOpacity>
                </View>

                {waitingApproval.length === 0 ? (
                  <EmptyState
                    icon="circle-check"
                    title="Semua Beres"
                    desc="Semua dokumen telah disetujui"
                  />
                ) : (
                  waitingApproval.map((item, idx) => {
                    const st = getApprovalStyle(item.type);
                    return (
                      <TouchableOpacity
                        key={`${item.type}-${item.id}-${idx}`}
                        style={[styles.apvItem, idx > 0 && styles.itemDivider]}
                        activeOpacity={0.8}
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
                            styles.apvIcon,
                            {
                              backgroundColor: st.iconBg,
                              borderColor: st.iconBorder,
                            },
                          ]}
                        >
                          <FontAwesome6
                            name={getIconForType(item.type) as any}
                            size={15}
                            color={st.iconColor}
                          />
                        </View>
                        <View style={styles.apvContent}>
                          <Text style={styles.apvTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <View style={styles.apvMeta}>
                            <View
                              style={[
                                styles.apvPill,
                                {
                                  backgroundColor: st.pillBg,
                                  borderColor: st.pillBorder,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.apvPillText,
                                  { color: st.pillColor },
                                ]}
                              >
                                {item.type.toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.apvDate}>{item.date}</Text>
                          </View>
                        </View>
                        <FontAwesome6
                          name="chevron-right"
                          size={10}
                          color="rgba(255,255,255,0.2)"
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

      {/* ── EXIT MODAL ─────────────────────────────────────────────────────── */}
      {showExitModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTopLine} />
            <View style={styles.modalIconWrap}>
              <FontAwesome6 name="right-from-bracket" size={20} color={CYAN} />
            </View>
            <Text style={styles.modalTitle}>Keluar dari SIPO?</Text>
            <Text style={styles.modalDesc}>
              Tekan keluar untuk menutup aplikasi
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

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <View style={divStyles.wrap}>
      <View style={divStyles.line} />
      <Text style={divStyles.text}>{label}</Text>
      <View style={divStyles.line} />
    </View>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.ring}>
        <FontAwesome6
          name={icon as any}
          size={20}
          color="rgba(255,255,255,0.15)"
        />
      </View>
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.desc}>{desc}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 120 },

  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    opacity: 1,
  },

  orb1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,132,255,0.12)",
    top: -70,
    right: -90,
  },

  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0,255,198,0.07)",
    top: 180,
    left: -70,
  },

  // Header
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16 },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  avatarWrap: {
    width: 46,
    height: 46,
    position: "relative",
    marginRight: 12,
  },

  avatarRing: {
    position: "absolute",
    inset: -3,
    width: 52,
    height: 52,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(0,212,255,0.4)",
    top: -3,
    left: -3,
  },

  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },

  avatarInitials: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },

  onlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00FF94",
    borderWidth: 2,
    borderColor: BG,
  },

  greetBlock: { flex: 1 },

  greetTop: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1.5,
    marginBottom: 3,
  },

  greetName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.4,
  },

  hbtns: { flexDirection: "row", gap: 8 },

  hbtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: WHITE_GHOST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "#FF4D6D",
    borderWidth: 1.5,
    borderColor: BG,
  },

  sysBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CYAN_DIM,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  sysDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: CYAN,
  },

  sysText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(0,212,255,0.8)",
    letterSpacing: 0.3,
  },

  sysOnline: {
    fontSize: 10,
    fontWeight: "500",
    color: WHITE_LOW,
  },

  content: { paddingHorizontal: 14 },

  // Doc grid
  docGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 0,
  },

  docCard: {
    width: "47.5%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#0A1628",
    borderWidth: 1,
    borderColor: WHITE_GHOST,
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
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },

  docName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: WHITE_HIGH,
    letterSpacing: -0.2,
    marginBottom: 3,
  },

  docSub: {
    fontSize: 10,
    color: WHITE_LOW,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // Quick grid
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 0,
  },

  qaItem: {
    width: "22%",
    alignItems: "center",
    gap: 7,
  },

  qaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WHITE_GHOST,
  },

  qaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: WHITE_MED,
    textAlign: "center",
    lineHeight: 12,
    letterSpacing: 0.3,
  },

  // Panel
  panel: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: WHITE_GHOST,
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
    backgroundColor: "rgba(0,212,255,0.3)",
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  panelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  panelIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: CYAN_DIM,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  panelTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.2,
  },

  panelSub: {
    fontSize: 10,
    color: WHITE_LOW,
    fontWeight: "500",
    marginTop: 1,
  },

  panelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CYAN_DIM,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  panelBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: CYAN,
    letterSpacing: 0.2,
  },

  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  // Meeting
  meetingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },

  miDateBlock: {
    width: 32,
    alignItems: "center",
  },

  miDay: {
    fontSize: 16,
    fontWeight: "900",
    color: CYAN,
    letterSpacing: -0.5,
    lineHeight: 18,
  },

  miMonth: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "rgba(0,212,255,0.5)",
    letterSpacing: 0.5,
  },

  miSep: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  miContent: { flex: 1, minWidth: 0 },

  miTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: WHITE_HIGH,
    letterSpacing: -0.2,
    marginBottom: 4,
  },

  miMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  miTag: {
    backgroundColor: CYAN_DIM,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  miTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(0,212,255,0.7)",
    letterSpacing: 0.3,
  },

  miInfo: {
    fontSize: 10,
    color: WHITE_LOW,
    fontWeight: "500",
    flex: 1,
  },

  miBadge: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },

  miBadgeNow: {
    backgroundColor: "rgba(0,255,148,0.1)",
    borderColor: "rgba(0,255,148,0.2)",
  },

  miBadgeSoon: {
    backgroundColor: "rgba(255,170,0,0.08)",
    borderColor: "rgba(255,170,0,0.2)",
  },

  miBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  miBadgeNowText: { color: "#00FF94" },
  miBadgeSoonText: { color: "#FFAA00" },

  // Approval
  apvItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },

  apvIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },

  apvContent: { flex: 1, minWidth: 0 },

  apvTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: -0.2,
    marginBottom: 4,
  },

  apvMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  apvPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },

  apvPillText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  apvDate: {
    fontSize: 10,
    color: WHITE_LOW,
    fontWeight: "500",
  },

  // Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6,11,24,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalBox: {
    width: "82%",
    backgroundColor: SURFACE,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: WHITE_GHOST,
    overflow: "hidden",
  },

  modalTopLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: "rgba(0,212,255,0.35)",
  },

  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CYAN_DIM,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  modalDesc: {
    fontSize: 12,
    color: WHITE_LOW,
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
    backgroundColor: WHITE_GHOST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: WHITE_MED,
  },

  modalExitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CYAN_DIM,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    alignItems: "center",
  },

  modalExitText: {
    fontSize: 14,
    fontWeight: "700",
    color: CYAN,
  },
});

const divStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  text: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 2,
  },
});

const emptyStyles = StyleSheet.create({
  wrap: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 5,
  },
  ring: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.25)",
  },
  desc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.15)",
    textAlign: "center",
  },
});
