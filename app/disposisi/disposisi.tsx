// app/disposisi/disposisi.tsx
import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/utils/api";
import { formatTanggalID } from "@/utils/date";
import { FontAwesome6 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
  accentBg: "rgba(26,111,212,0.07)",
  accentBorder: "rgba(26,111,212,0.18)",
  textPrimary: "#0D1829",
  textSecondary: "#3A5070",
  textTertiary: "#7A99BE",
  textMuted: "#A8C0D8",
  green: "#1A9E5A",
  greenBg: "rgba(26,158,90,0.09)",
  greenBd: "rgba(26,158,90,0.22)",
  danger: "#D63050",
  dangerBg: "rgba(214,48,80,0.08)",
  dangerBd: "rgba(214,48,80,0.2)",
  amber: "#C07010",
  amberBg: "rgba(192,112,16,0.09)",
  amberBd: "rgba(192,112,16,0.22)",
  purple: "#6B3FA8",
  purpleBg: "rgba(107,63,168,0.09)",
  purpleBd: "rgba(107,63,168,0.22)",
  navy: "#173B78",
  navyBg: "rgba(23,59,120,0.08)",
  orb1: "rgba(26,111,212,0.06)",
  orb2: "rgba(42,136,245,0.04)",
  panelTopLine: "rgba(26,111,212,0.25)",
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
  accentBg: "rgba(0,212,255,0.08)",
  accentBorder: "rgba(0,212,255,0.18)",
  textPrimary: "rgba(255,255,255,0.90)",
  textSecondary: "rgba(255,255,255,0.50)",
  textTertiary: "rgba(255,255,255,0.28)",
  textMuted: "rgba(255,255,255,0.15)",
  green: "#00FF94",
  greenBg: "rgba(0,255,148,0.08)",
  greenBd: "rgba(0,255,148,0.20)",
  danger: "#FF4D6D",
  dangerBg: "rgba(255,77,109,0.08)",
  dangerBd: "rgba(255,77,109,0.20)",
  amber: "#FFAA00",
  amberBg: "rgba(255,170,0,0.08)",
  amberBd: "rgba(255,170,0,0.20)",
  purple: "#BB88FF",
  purpleBg: "rgba(120,80,255,0.13)",
  purpleBd: "rgba(120,80,255,0.25)",
  navy: "#4AB0FF",
  navyBg: "rgba(74,176,255,0.10)",
  orb1: "rgba(0,132,255,0.10)",
  orb2: "rgba(0,255,198,0.06)",
  panelTopLine: "rgba(0,212,255,0.28)",
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

type TabKey = "masuk" | "keluar";
type DisposisiStatus =
  | "menunggu"
  | "diterima"
  | "diteruskan"
  | "selesai"
  | string;

interface DisposisiItem {
  id: number | string;
  document_type?: string | null;
  document_id?: number | string | null;
  judul_dokumen?: string | null;
  judul?: string | null;
  instruksi?: string | null;
  catatan?: string | null;
  deadline?: string | null;
  status?: DisposisiStatus;
  dibaca_at?: string | null;
  dibaca?: boolean | number | string | null;
  is_read?: boolean | number | string | null;
  read?: boolean | number | string | null;
  sudah_dibaca?: boolean | number | string | null;
  dari_user_id?: number | string | null;
  kepada_user_id?: number[] | string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  dari_user?: any;
  dariUser?: any;
  [key: string]: any;
}

interface PaginatedDisposisi {
  data: DisposisiItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface DisposisiApiResponse {
  status: boolean;
  message: string;
  data?: {
    belum_dibaca: number;
    masuk_count: number;
    keluar_count: number;
    masuk: PaginatedDisposisi;
    keluar: PaginatedDisposisi;
  };
}

const STATUS_OPTIONS = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "menunggu" },
  { label: "Diterima", value: "diterima" },
  { label: "Diteruskan", value: "diteruskan" },
  { label: "Selesai", value: "selesai" },
];

function getStatusMeta(status: string | undefined, C: ThemeColors) {
  switch (status) {
    case "menunggu":
      return {
        label: "Menunggu",
        c: C.amber,
        bg: C.amberBg,
        bd: C.amberBd,
        icon: "clock" as const,
      };
    case "diterima":
      return {
        label: "Diterima",
        c: C.accent,
        bg: C.accentBg,
        bd: C.accentBorder,
        icon: "circle-check" as const,
      };
    case "diteruskan":
      return {
        label: "Diteruskan",
        c: C.purple,
        bg: C.purpleBg,
        bd: C.purpleBd,
        icon: "share" as const,
      };
    case "selesai":
      return {
        label: "Selesai",
        c: C.green,
        bg: C.greenBg,
        bd: C.greenBd,
        icon: "check-double" as const,
      };
    default:
      return {
        label: status || "-",
        c: C.textSecondary,
        bg: C.surface2,
        bd: C.borderStrong,
        icon: "circle-info" as const,
      };
  }
}

function getDocMeta(type: string | undefined | null, C: ThemeColors) {
  switch (type) {
    case "memo":
      return {
        label: "Memo",
        c: C.accent,
        bg: C.accentBg,
        bd: C.accentBorder,
        icon: "envelope" as const,
      };
    case "undangan":
      return {
        label: "Undangan",
        c: C.purple,
        bg: C.purpleBg,
        bd: C.purpleBd,
        icon: "calendar-check" as const,
      };
    default:
      return {
        label: type || "Dokumen",
        c: C.textSecondary,
        bg: C.surface2,
        bd: C.borderStrong,
        icon: "file-lines" as const,
      };
  }
}

function getSenderName(item: DisposisiItem) {
  const user = item.dari_user ?? item.dariUser;
  if (!user) return "-";
  if (user.nama) return user.nama;
  if (user.name) return user.name;
  return `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "-";
}

function getTitle(item: DisposisiItem) {
  return (
    item.judul_dokumen ??
    item.judul ??
    item.dokumen?.judul ??
    item.document?.judul ??
    "Dokumen disposisi"
  );
}

function getDate(value?: string | null) {
  if (!value) return "-";
  try {
    return formatTanggalID(value);
  } catch {
    return value;
  }
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");

  return query ? `?${query}` : "";
}

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
    <View
      style={[
        emp.wrap,
        { backgroundColor: C.surface, borderColor: C.borderStrong },
      ]}
    >
      <View
        style={[
          emp.ring,
          { backgroundColor: C.surface2, borderColor: C.borderStrong },
        ]}
      >
        <FontAwesome6 name={icon as any} size={22} color={C.textMuted} />
      </View>
      <Text style={[emp.title, { color: C.textTertiary }]}>{title}</Text>
      <Text style={[emp.desc, { color: C.textMuted }]}>{desc}</Text>
    </View>
  );
}

function isItemUnread(item: DisposisiItem, tab: TabKey): boolean {
  if (tab !== "masuk") return false;

  if ("dibaca_at" in item) {
    return item.dibaca_at === null || item.dibaca_at === undefined;
  }

  if ("dibaca" in item) {
    const v = item.dibaca;
    if (v === null || v === undefined) return false;
    const sudah = v === true || v === 1 || v === "1" || v === "true";
    return !sudah;
  }

  return false;
}

function DisposisiCard({
  item,
  tab,
  C,
  onPress,
}: {
  item: DisposisiItem;
  tab: TabKey;
  C: ThemeColors;
  onPress: () => void;
}) {
  const statusMeta = getStatusMeta(item.status, C);
  const docMeta = getDocMeta(item.document_type, C);
  const isUnread = isItemUnread(item, tab);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        card.wrap,
        {
          backgroundColor: C.surface,
          borderColor: isUnread ? C.accentBorder : C.borderStrong,
        },
        C.shadowSm,
        pressed && { opacity: 0.84 },
      ]}
    >
      {isUnread && (
        <View style={[card.unreadStrip, { backgroundColor: C.accent }]} />
      )}

      <View style={card.inner}>
        <View
          style={[
            card.docIcon,
            { backgroundColor: docMeta.bg, borderColor: docMeta.bd },
          ]}
        >
          <FontAwesome6 name={docMeta.icon} size={16} color={docMeta.c} />
        </View>

        <View style={card.body}>
          <View style={card.badgeRow}>
            <View
              style={[
                card.pill,
                { backgroundColor: docMeta.bg, borderColor: docMeta.bd },
              ]}
            >
              <Text style={[card.pillText, { color: docMeta.c }]}>
                {docMeta.label}
              </Text>
            </View>

            <View
              style={[
                card.pill,
                { backgroundColor: statusMeta.bg, borderColor: statusMeta.bd },
              ]}
            >
              <FontAwesome6
                name={statusMeta.icon}
                size={9}
                color={statusMeta.c}
              />
              <Text style={[card.pillText, { color: statusMeta.c }]}>
                {statusMeta.label}
              </Text>
            </View>

            {isUnread && (
              <View style={[card.unreadDot, { backgroundColor: C.danger }]} />
            )}
          </View>

          <Text
            style={[card.title, { color: C.textPrimary }]}
            numberOfLines={2}
          >
            {getTitle(item)}
          </Text>

          <Text
            style={[card.instruksi, { color: C.textSecondary }]}
            numberOfLines={2}
          >
            {item.instruksi || "Tidak ada instruksi."}
          </Text>

          {!!item.catatan && (
            <Text
              style={[card.catatan, { color: C.textTertiary }]}
              numberOfLines={1}
            >
              Catatan: {item.catatan}
            </Text>
          )}

          <View style={card.metaRow}>
            <View style={card.metaItem}>
              <View style={[card.metaIcon, { backgroundColor: C.surface2 }]}>
                <FontAwesome6 name="user" size={9} color={C.textTertiary} />
              </View>
              <Text
                style={[card.metaText, { color: C.textTertiary }]}
                numberOfLines={1}
              >
                {tab === "masuk"
                  ? `Dari ${getSenderName(item)}`
                  : "Disposisi keluar"}
              </Text>
            </View>

            <View style={card.metaItem}>
              <View style={[card.metaIcon, { backgroundColor: C.surface2 }]}>
                <FontAwesome6
                  name="calendar-days"
                  size={9}
                  color={C.textTertiary}
                />
              </View>
              <Text
                style={[card.metaText, { color: C.textTertiary }]}
                numberOfLines={1}
              >
                {getDate(item.updated_at ?? item.created_at)}
              </Text>
            </View>
          </View>

          {!!item.deadline && (
            <View
              style={[
                card.deadlineRow,
                { backgroundColor: C.amberBg, borderColor: C.amberBd },
              ]}
            >
              <FontAwesome6 name="hourglass-half" size={10} color={C.amber} />
              <Text style={[card.deadlineText, { color: C.amber }]}>
                Deadline: {getDate(item.deadline)}
              </Text>
            </View>
          )}
        </View>

        <FontAwesome6
          name="chevron-right"
          size={11}
          color={C.textMuted}
          style={{ marginLeft: 4 }}
        />
      </View>
    </Pressable>
  );
}

export default function DisposisiScreen() {
  const router = useRouter();
  const { isDark, toggleDark } = useTheme();
  const C: ThemeColors = isDark ? DARK : LIGHT;

  const [activeTab, setActiveTab] = useState<TabKey>("masuk");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [belumDibaca, setBelumDibaca] = useState(0);
  const [masukCount, setMasukCount] = useState(0);
  const [keluarCount, setKeluarCount] = useState(0);

  const [masuk, setMasuk] = useState<DisposisiItem[]>([]);
  const [keluar, setKeluar] = useState<DisposisiItem[]>([]);

  const [masukPage, setMasukPage] = useState(1);
  const [keluarPage, setKeluarPage] = useState(1);
  const [masukLastPage, setMasukLastPage] = useState(1);
  const [keluarLastPage, setKeluarLastPage] = useState(1);

  const currentItems = activeTab === "masuk" ? masuk : keluar;
  const currentPage = activeTab === "masuk" ? masukPage : keluarPage;
  const currentLastPage =
    activeTab === "masuk" ? masukLastPage : keluarLastPage;
  const hasMore = currentPage < currentLastPage;

  const tabInfo = useMemo(() => {
    if (activeTab === "masuk") {
      return {
        title: "Disposisi Masuk",
        sub: `${masukCount} disposisi diterima`,
      };
    }

    return {
      title: "Disposisi Keluar",
      sub: `${keluarCount} disposisi dikirim`,
    };
  }, [activeTab, masukCount, keluarCount]);

  const fetchDisposisi = useCallback(
    async ({
      pageMasuk = 1,
      pageKeluar = 1,
      append = false,
    }: {
      pageMasuk?: number;
      pageKeluar?: number;
      append?: boolean;
    } = {}) => {
      try {
        const query = buildQuery({
          per_page: 15,
          status: statusFilter,
          masuk_page: pageMasuk,
          keluar_page: pageKeluar,
        });

        const res = (await apiFetch(
          `/disposisi${query}`,
        )) as DisposisiApiResponse;

        if (!res?.status || !res?.data) {
          Alert.alert("Error", res?.message || "Gagal memuat disposisi.");
          return;
        }

        const data = res.data;

        setBelumDibaca(Number(data.belum_dibaca ?? 0));
        setMasukCount(Number(data.masuk_count ?? 0));
        setKeluarCount(Number(data.keluar_count ?? 0));

        const masukData = Array.isArray(data.masuk?.data)
          ? data.masuk.data
          : [];
        const keluarData = Array.isArray(data.keluar?.data)
          ? data.keluar.data
          : [];

        setMasuk((prev) =>
          append && pageMasuk > 1 ? [...prev, ...masukData] : masukData,
        );
        setKeluar((prev) =>
          append && pageKeluar > 1 ? [...prev, ...keluarData] : keluarData,
        );

        setMasukPage(Number(data.masuk?.current_page ?? pageMasuk));
        setKeluarPage(Number(data.keluar?.current_page ?? pageKeluar));
        setMasukLastPage(Number(data.masuk?.last_page ?? 1));
        setKeluarLastPage(Number(data.keluar?.last_page ?? 1));
      } catch {
        Alert.alert("Error", "Gagal memuat data disposisi.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [statusFilter],
  );

  const refreshData = useCallback(() => {
    setRefreshing(true);
    fetchDisposisi({ pageMasuk: 1, pageKeluar: 1, append: false });
  }, [fetchDisposisi]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    if (activeTab === "masuk") {
      fetchDisposisi({
        pageMasuk: masukPage + 1,
        pageKeluar: keluarPage,
        append: true,
      });
    } else {
      fetchDisposisi({
        pageMasuk: masukPage,
        pageKeluar: keluarPage + 1,
        append: true,
      });
    }
  }, [activeTab, fetchDisposisi, hasMore, keluarPage, loadingMore, masukPage]);

  useEffect(() => {
    setLoading(true);
    fetchDisposisi({ pageMasuk: 1, pageKeluar: 1, append: false });
  }, [fetchDisposisi]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <SafeAreaView
          style={[s.loadingWrap, { backgroundColor: C.bg }]}
          edges={["top"]}
        >
          <StatusBar
            barStyle={isDark ? "light-content" : "dark-content"}
            backgroundColor={C.bg}
          />

          <View
            style={[
              s.loadingIcon,
              { backgroundColor: C.accentBg, borderColor: C.accentBorder },
            ]}
          >
            <ActivityIndicator size="large" color={C.accent} />
          </View>

          <Text style={[s.loadingText, { color: C.textTertiary }]}>
            Memuat disposisi...
          </Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]} edges={["top"]}>
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
                s.hBtn,
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
              <FontAwesome6 name="paper-plane" size={16} color={C.accent} />
            </View>

            <View>
              <Text style={[s.headerTitle, { color: C.textPrimary }]}>
                Disposisi
              </Text>
              <Text style={[s.headerSub, { color: C.textTertiary }]}>
                Masuk & keluar
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              s.hBtn,
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
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshData}
              colors={[C.accent]}
              tintColor={C.accent}
              progressBackgroundColor={C.surface}
            />
          }
        >
          <View
            style={[
              s.summaryCard,
              { backgroundColor: C.surface, borderColor: C.borderStrong },
              C.shadowMd,
            ]}
          >
            <View
              style={[s.summaryTopLine, { backgroundColor: C.panelTopLine }]}
            />

            <View style={s.summaryTop}>
              <View
                style={[
                  s.summaryIconWrap,
                  { backgroundColor: C.accentBg, borderColor: C.accentBorder },
                ]}
              >
                <FontAwesome6 name="paper-plane" size={20} color={C.accent} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[s.summaryLabel, { color: C.textTertiary }]}>
                  Belum Dibaca
                </Text>

                <View style={s.summaryNumRow}>
                  <Text style={[s.summaryNum, { color: C.textPrimary }]}>
                    {belumDibaca}
                  </Text>

                  {belumDibaca > 0 && (
                    <View
                      style={[
                        s.unreadPill,
                        {
                          backgroundColor: C.dangerBg,
                          borderColor: C.dangerBd,
                        },
                      ]}
                    >
                      <View
                        style={[s.unreadDot, { backgroundColor: C.danger }]}
                      />
                      <Text style={[s.unreadPillText, { color: C.danger }]}>
                        Baru
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={[s.summaryDivider, { backgroundColor: C.border }]} />

            <View style={s.summaryStats}>
              {[
                {
                  label: "Masuk",
                  value: masukCount,
                  icon: "inbox",
                  c: C.accent,
                  bg: C.accentBg,
                  bd: C.accentBorder,
                },
                {
                  label: "Keluar",
                  value: keluarCount,
                  icon: "paper-plane",
                  c: C.purple,
                  bg: C.purpleBg,
                  bd: C.purpleBd,
                },
              ].map((stat, idx) => (
                <React.Fragment key={stat.label}>
                  {idx > 0 && (
                    <View
                      style={[s.statSep, { backgroundColor: C.borderStrong }]}
                    />
                  )}

                  <View style={s.statItem}>
                    <View
                      style={[
                        s.statIcon,
                        { backgroundColor: stat.bg, borderColor: stat.bd },
                      ]}
                    >
                      <FontAwesome6
                        name={stat.icon as any}
                        size={11}
                        color={stat.c}
                      />
                    </View>

                    <View>
                      <Text style={[s.statNum, { color: C.textPrimary }]}>
                        {stat.value}
                      </Text>
                      <Text style={[s.statLabel, { color: C.textTertiary }]}>
                        {stat.label}
                      </Text>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          <View
            style={[
              s.tabWrap,
              { backgroundColor: C.surface, borderColor: C.borderStrong },
              C.shadowSm,
            ]}
          >
            {(["masuk", "keluar"] as TabKey[]).map((tab) => {
              const active = activeTab === tab;

              return (
                <TouchableOpacity
                  key={tab}
                  style={[s.tabBtn, active && { backgroundColor: C.accent }]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <FontAwesome6
                    name={tab === "masuk" ? "inbox" : "paper-plane"}
                    size={12}
                    color={active ? "#fff" : C.textTertiary}
                  />

                  <Text
                    style={[
                      s.tabText,
                      { color: active ? "#fff" : C.textTertiary },
                    ]}
                  >
                    {tab === "masuk" ? "Masuk" : "Keluar"}
                  </Text>

                  {tab === "masuk" && belumDibaca > 0 && (
                    <View
                      style={[
                        s.tabBadge,
                        {
                          backgroundColor: active
                            ? "rgba(255,255,255,0.25)"
                            : C.dangerBg,
                          borderColor: active
                            ? "rgba(255,255,255,0.3)"
                            : C.dangerBd,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.tabBadgeText,
                          { color: active ? "#fff" : C.danger },
                        ]}
                      >
                        {belumDibaca}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
          >
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.value;

              return (
                <TouchableOpacity
                  key={opt.value || "all"}
                  onPress={() => setStatusFilter(opt.value)}
                  activeOpacity={0.8}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: active ? C.accentBg : C.surface,
                      borderColor: active ? C.accentBorder : C.borderStrong,
                    },
                    C.shadowSm,
                  ]}
                >
                  <Text
                    style={[
                      s.filterChipText,
                      { color: active ? C.accent : C.textTertiary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <SectionDivider label={tabInfo.title.toUpperCase()} C={C} />

          <View style={s.sectionSubRow}>
            <Text style={[s.sectionSub, { color: C.textTertiary }]}>
              {tabInfo.sub}
            </Text>
          </View>

          {currentItems.length === 0 ? (
            <EmptyState
              icon={activeTab === "masuk" ? "inbox" : "paper-plane"}
              title={
                activeTab === "masuk"
                  ? "Belum Ada Disposisi Masuk"
                  : "Belum Ada Disposisi Keluar"
              }
              desc={
                activeTab === "masuk"
                  ? "Disposisi yang Anda terima akan tampil di sini."
                  : "Disposisi yang Anda kirim akan tampil di sini."
              }
              C={C}
            />
          ) : (
            <View style={s.list}>
              {currentItems.map((item, index) => (
                <DisposisiCard
                  key={`${activeTab}-${item.id}-${index}`}
                  item={item}
                  tab={activeTab}
                  C={C}
                  onPress={() =>
                    router.push({
                      pathname: "/disposisi/disposisi-detail" as any,
                      params: { id: String(item.id) },
                    })
                  }
                />
              ))}
            </View>
          )}

          {currentItems.length > 0 && (
            <TouchableOpacity
              disabled={!hasMore || loadingMore}
              onPress={loadMore}
              activeOpacity={0.8}
              style={[
                s.loadMoreBtn,
                {
                  backgroundColor: hasMore ? C.accentBg : C.surface2,
                  borderColor: hasMore ? C.accentBorder : C.borderStrong,
                },
              ]}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={C.accent} />
              ) : (
                <>
                  <Text
                    style={[
                      s.loadMoreText,
                      { color: hasMore ? C.accent : C.textMuted },
                    ]}
                  >
                    {hasMore
                      ? "Muat Lebih Banyak"
                      : "Semua data sudah ditampilkan"}
                  </Text>

                  {hasMore && (
                    <FontAwesome6
                      name="chevron-down"
                      size={11}
                      color={C.accent}
                    />
                  )}
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { fontSize: 13, fontWeight: "600" },
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
    top: 260,
    left: -70,
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  headerSub: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  hBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    paddingTop: 16,
    gap: 0,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: "hidden",
    position: "relative",
    marginBottom: 14,
  },
  summaryTopLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    paddingBottom: 14,
  },
  summaryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryNumRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryNum: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
  },
  unreadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  unreadPillText: { fontSize: 10, fontWeight: "800" },
  summaryDivider: { height: 0.5, marginHorizontal: 16 },
  summaryStats: { flexDirection: "row", padding: 14, paddingTop: 12, gap: 0 },
  statItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  statNum: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 21,
  },
  statLabel: { fontSize: 10, fontWeight: "600", marginTop: 1 },
  statSep: { width: 0.5, marginHorizontal: 14, alignSelf: "stretch" },
  tabWrap: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabText: { fontSize: 12, fontWeight: "800" },
  tabBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "900" },
  filterRow: { gap: 8, paddingBottom: 4, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  filterChipText: { fontSize: 11, fontWeight: "700" },
  sectionSubRow: { marginBottom: 10 },
  sectionSub: { fontSize: 11, fontWeight: "600" },
  list: { gap: 10 },
  loadMoreBtn: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadMoreText: { fontSize: 12, fontWeight: "700" },
});

const card = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  unreadStrip: { height: 2.5, width: "100%" },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0, gap: 5 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: { fontSize: 10, fontWeight: "800" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 2 },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  instruksi: { fontSize: 11.5, lineHeight: 17, fontWeight: "500" },
  catatan: { fontSize: 11, fontWeight: "500", fontStyle: "italic" },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 2 },
  metaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 0,
  },
  metaIcon: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  metaText: { fontSize: 10.5, fontWeight: "600", flex: 1 },
  deadlineRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 2,
  },
  deadlineText: { fontSize: 10.5, fontWeight: "800" },
});

const div = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 14,
  },
  line: { flex: 1, height: 0.5 },
  text: { fontSize: 9, fontWeight: "700", letterSpacing: 2 },
});

const emp = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 0.5,
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  desc: {
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 17,
    fontWeight: "500",
  },
});
