import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomModal from "../../components/filter-modal";
import { ThemedText } from "../../components/themed-text";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";
import { stylesIndex } from "../../constants/theme";
import { apiFetch } from "../../utils/api";
import { formatTanggalID } from "../../utils/date";

/* ============ Types ============ */
type Status = "pending" | "correction" | "approve" | "reject";

type MemoItem = {
  id_memo: number;
  judul: string;
  nomor_memo?: string;
  status: Status;
  nama_pembuat?: string;
  tujuan_string?: string; // dipisah ';'
  created_at?: string; // ISO
  tgl_memo?: string; // kalau ada, pakai ini untuk tanggal
  isi_memo?: string;
  kode?: string;
  lampiran_url?: string | null;

  // opsional tambahan agar seragam dengan undangan/risalah
  waktu_mulai?: string;
  waktu_selesai?: string;
  tempat?: string;
};

/* ============ Status Config (seragam) ============ */
const statusConfig: Record<
  Status,
  { label: string; color: string; soft: string }
> = {
  pending: { label: "Diproses", color: "#0B63F6", soft: "#D9E0EA" },
  correction: { label: "Dikoreksi", color: "#B58100", soft: "#D9E0EA" },
  approve: { label: "Diterima", color: "#118C4F", soft: "#D9E0EA" },
  reject: { label: "Ditolak", color: "#C62E2E", soft: "#D9E0EA" },
};

export default function MemoScreen() {
  const router = useRouter();

  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // <-- NEW

  // ====== Filter (match Undangan & Risalah) ======
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [divisi, setDivisi] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<"status" | "divisi" | null>(
    null
  );

  const { approval } = useLocalSearchParams<{ approval?: string }>();

  const [divisiOptions, setDivisiOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const statusOptions = [
    { label: "Diproses", value: "pending" },
    { label: "Dikoreksi", value: "correction" },
    { label: "Diterima", value: "approve" },
    { label: "Ditolak", value: "reject" },
  ];

  const handleReset = () => {
    setStatus(null);
    setDivisi(null);
  };

  const handleSelect = (type: "status" | "divisi", value: string) => {
    if (type === "status") setStatus(value);
    else setDivisi(value);
    setOpenDropdown(null);
  };

  // fetch opsi divisi/kode
  useEffect(() => {
    const fetchDivisiOptions = async () => {
      try {
        const raw = await apiFetch("/memos/kode");
        const data = Array.isArray(raw) ? raw : raw.data;
        const formatted = data.map((item: any) => ({
          label: item,
          value: item,
        }));
        setDivisiOptions(formatted);
      } catch (err) {
        console.error("Gagal ambil opsi divisi/kode:", err);
      }
    };
    fetchDivisiOptions();
  }, []);

  // === Fetch Memo Function (agar bisa dipanggil ulang saat refresh) ===
  const fetchMemos = useCallback(async () => {
    try {
      let url = "/memos";

      if (approval === "1") {
        url = "/memos?status=pending";
      } else {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (divisi) params.append("kode", divisi);
        if ([...params].length > 0) url += `?${params.toString()}`;
      }
      const res = await apiFetch(url);
      const arr: MemoItem[] = Array.isArray(res) ? res : res?.data ?? [];
      setMemos(arr);
    } catch (err) {
      console.error("Gagal ambil memos:", err);
      Alert.alert("Gagal memuat memo");
    } finally {
      setLoading(false);
      setRefreshing(false); // <-- NEW
    }
  }, [status, divisi]);

  useEffect(() => {
    fetchMemos();
  }, [status, divisi]);

  // === Refresh Handler ===
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMemos();
  }, [fetchMemos]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors?.primary ?? "#0B3B82"} />
        <Text style={[Fonts.paragraphRegularSmall, styles.loadingText]}>
          Sedang memuat memo...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[stylesIndex.container, { backgroundColor: "#F7F8FA" }]}
      edges={["top"]}
    >
      {/* Header (seragam) */}
      <View style={stylesIndex.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.replace("/beranda/beranda")}
            hitSlop={10}
            style={{ padding: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
          >
            <FontAwesome6
              name="chevron-left"
              size={20}
              color={Colors.textPrimary}
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <ThemedText style={[Fonts.header1, { color: Colors.navy }]}>
              Memo
            </ThemedText>
            <ThemedText
              style={[
                Fonts.paragraphRegularLarge,
                { color: Colors.textSecondary },
              ]}
            >
              Daftar memo yang diterima
            </ThemedText>
          </View>

          {approval !== "1" && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ padding: 8, marginLeft: 8 }}
            >
              <FontAwesome6 name="sliders" size={22} color={Colors.navy} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal Filter (Status & Divisi) */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View>
          {/* Close */}
          <TouchableOpacity
            style={{ position: "absolute", right: 0, padding: 4 }}
            onPress={() => setModalVisible(false)}
          >
            <FontAwesome6 name="xmark" size={24} color={Colors.gray} />
          </TouchableOpacity>

          <Text
            style={[
              Fonts.header5,
              { marginBottom: 12, color: Colors.navy, textAlign: "center" },
            ]}
          >
            FILTER
          </Text>

          {/* Status */}
          <Text style={[Fonts.paragraphMediumLarge, { color: Colors.navy }]}>
            Status
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setOpenDropdown(openDropdown === "status" ? null : "status")
            }
            style={styles.dropdownButton}
          >
            <Text
              style={[
                Fonts.paragraphRegularLarge,
                { color: status ? "#000" : "#777" },
              ]}
            >
              {status
                ? statusOptions.find((opt) => opt.value === status)?.label
                : "Select Option"}
            </Text>
            <FontAwesome6
              name={openDropdown === "status" ? "chevron-up" : "chevron-down"}
              size={16}
              color="#777"
            />
          </TouchableOpacity>

          {openDropdown === "status" && (
            <View style={styles.dropdownList}>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSelect("status", opt.value)}
                  style={styles.dropdownItem}
                >
                  <Text style={{ color: "#000" }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Divisi / Kode */}
          <Text style={[Fonts.paragraphMediumLarge, { color: Colors.navy }]}>
            Divisi
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setOpenDropdown(openDropdown === "divisi" ? null : "divisi")
            }
            style={styles.dropdownButton}
          >
            <Text
              style={[
                Fonts.paragraphRegularLarge,
                { color: divisi ? "#000" : "#777" },
              ]}
            >
              {divisi
                ? divisiOptions.find((o) => o.value === divisi)?.label
                : "Select Option"}
            </Text>
            <FontAwesome6
              name={openDropdown === "divisi" ? "chevron-up" : "chevron-down"}
              size={14}
              color="#777"
            />
          </TouchableOpacity>

          {openDropdown === "divisi" && (
            <View style={styles.dropdownList}>
              {divisiOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSelect("divisi", opt.value)}
                  style={styles.dropdownItem}
                >
                  <Text style={{ color: "#000" }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Buttons */}
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: "#FA7268" }]}
              onPress={handleReset}
            >
              <Text style={[Fonts.paragraphMediumLarge, styles.filterBtnText]}>
                Atur Ulang
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: "#1F316F" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[Fonts.paragraphMediumLarge, styles.filterBtnText]}>
                Pakai
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>

      {/* List (kartu seragam) */}
      <ScrollView
        contentContainerStyle={stylesIndex.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary ?? "#0B63F6"]}
            tintColor={Colors.primary ?? "#0B63F6"}
          />
        }
      >
        {memos.map((item) => {
          const cfg = statusConfig[item.status] ?? statusConfig.pending;

          // pilih tanggal yang paling relevan
          const tanggal = item.tgl_memo
            ? formatTanggalID(item.tgl_memo)
            : item.created_at
            ? formatTanggalID(item.created_at)
            : "-";

          const tujuanList = item.tujuan_string || "";

          return (
            <TouchableOpacity
              key={item.id_memo}
              activeOpacity={0.85}
              onPress={() =>
                router.push(`/memo/memo-detail?id=${item.id_memo}`)
              }
              style={[stylesIndex.card]}
            >
              {/* Judul */}
              <ThemedText
                style={[
                  Fonts.paragraphMediumLarge,
                  { marginBottom: 8, color: Colors.navy },
                ]}
              >
                {item.judul}
              </ThemedText>

              {/* Tanggal */}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, Fonts.paragraphRegularSmall]}>
                  Tanggal :
                </Text>
                <Text style={[styles.infoValue, Fonts.paragraphRegularSmall]}>
                  {tanggal}
                </Text>
              </View>

              {/* Kode */}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, Fonts.paragraphRegularSmall]}>
                  Divisi :
                </Text>
                <Text style={[styles.infoValue, Fonts.paragraphRegularSmall]}>
                  {item.kode || "-"}
                </Text>
              </View>

              {/* Pembuat */}
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, Fonts.paragraphRegularSmall]}>
                  Pembuat :
                </Text>
                <Text style={[styles.infoValue, Fonts.paragraphRegularSmall]}>
                  {item.nama_pembuat || "-"}
                </Text>
              </View>

              {/* Status */}
              <View style={styles.statusRow}>
                <Text style={[styles.infoLabel, Fonts.paragraphRegularSmall]}>
                  Status :
                </Text>
                <Text
                  style={[
                    styles.statusValue,
                    Fonts.paragraphMediumSmall,
                    { color: cfg.color },
                  ]}
                >
                  {cfg.label}
                </Text>
              </View>

              {/* Soft highlight bar */}
              <View style={[styles.softBg, { backgroundColor: cfg.soft }]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============ Styles (seragam dengan undangan/risalah) ============ */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
  },
  loadingText: {
    marginTop: 8,
    color: "#475569",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  infoLabel: {
    width: 100,
    color: Colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    color: Colors.textSecondary,
  },
  statusValue: {
    flex: 1,
    fontWeight: "700",
  },
  softBg: {
    height: 6,
    borderRadius: 8,
    marginTop: 10,
  },

  // modal filter
  dropdownButton: {
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownList: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  resetBtn: {
    paddingVertical: 10,
    borderRadius: 20,
    width: "45%",
  },
  applyBtn: {
    paddingVertical: 10,
    borderRadius: 20,
    width: "45%",
  },
  filterBtnText: {
    color: "white",
    textAlign: "center",
  },
});
