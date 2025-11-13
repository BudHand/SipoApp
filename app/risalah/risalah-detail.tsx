// app/risalah/detail.tsx
import CustomAlert from "@/components/CustomAlert";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { apiFetch, viewPDF } from "@/utils/api";
import { formatTanggalID } from "@/utils/date";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Status = "pending" | "correction" | "approve" | "reject";

const STATUS_STYLE: Record<
  Status,
  { label: string; color: string; bg: string }
> = {
  approve: { label: "Diterima", color: "#065F46", bg: "#D1FAE5" },
  reject: { label: "Ditolak", color: "#991B1B", bg: "#FEE2E2" },
  correction: { label: "Dikoreksi", color: "#92400E", bg: "#FEF3C7" },
  pending: { label: "Diproses", color: Colors.primary, bg: "#E6F0FF" },
};

const TABBAR_HEIGHT_GUESS = Platform.select({
  ios: 49,
  android: 56,
  default: 56,
})!;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={[
      Fonts.paragraphMediumSmall,
      { color: Colors.textPrimary, marginBottom: 6 },
    ]}
  >
    {children}
  </Text>
);

function normalizeStatus(raw: any): Status {
  const s = String(raw ?? "")
    .toLowerCase()
    .trim();
  if (["pending", "diproses", "process", "0"].includes(s)) return "pending";
  if (["approve", "approved", "diterima", "1"].includes(s)) return "approve";
  if (["reject", "rejected", "ditolak", "2"].includes(s)) return "reject";
  if (["correction", "dikoreksi", "3"].includes(s)) return "correction";
  return "pending";
}

export default function RisalahDetail() {
  const router = useRouter();
  const { id, notif_id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("role").then((r) => setRole(r));
  }, []);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        try {
          if (notif_id) {
            await apiFetch(`/notifikasi/${notif_id}/read`, { method: "POST" });
          }
        } catch (e) {
          console.log(e);
        }
        const raw = await apiFetch(`/risalahs/${id}`);
        const data = raw?.data ?? raw;
        console.log(data);
        setDetail(data);
      } catch (error) {
        console.log("Error:", error);
        Alert.alert("Gagal", "Tidak dapat memuat detail risalah.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary ?? "#0B3B82"} />
        <Text style={[Fonts.paragraphRegularSmall, styles.loadingText]}>
          Sedang memuat risalah...
        </Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text style={[Fonts.paragraphMediumSmall]}>
          Data risalah tidak ditemukan.
        </Text>
      </View>
    );
  }

  const statusNow: Status = normalizeStatus(detail.status);
  const isNoteRequired =
    selectedStatus === "reject" || selectedStatus === "correction";
  const isSaveDisabled =
    !selectedStatus ||
    ((selectedStatus === "reject" || selectedStatus === "correction") &&
      !catatan.trim());

  async function submitApproval() {
    if (isSaveDisabled) return;
    try {
      setSubmitting(true);
      await apiFetch(`/risalahs/${id}/update-status?_method=PUT`, {
        method: "POST",
        body: JSON.stringify({
          status: selectedStatus,
          catatan: isNoteRequired ? catatan.trim() : null,
        }),
      });
      setDetail((prev: any) => ({ ...prev, status: selectedStatus }));
      setShowApprove(false);
      setSelectedStatus(null);
      setCatatan("");
      setShowAlert(true);
    } catch (e: any) {
      console.log(e);
      Alert.alert("Gagal", e?.message ?? "Gagal mengirim persetujuan.");
    } finally {
      setSubmitting(false);
    }
  }

  const bottomOffset = insets.bottom + TABBAR_HEIGHT_GUESS + 8;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.pageBg }}>
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: Colors.white,
          marginTop: Platform.OS === "android" ? insets.top : 10,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{ padding: 6 }}
        >
          <FontAwesome5
            name="chevron-left"
            size={18}
            color={Colors.textPrimary}
          />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={[Fonts.header6, { color: Colors.textPrimary, marginTop: 2 }]}
            numberOfLines={2}
          >
            {detail.judul}
          </Text>
          <Text style={[Fonts.paragraphMediumSmall, { color: Colors.primary }]}>
            {STATUS_STYLE[statusNow]?.label ?? "Status"}
          </Text>
        </View>
      </View>

      {/* KONTEN */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24 + bottomOffset + 64,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Pop up berhasil */}
          <CustomAlert
            visible={showAlert}
            onClose={() => setShowAlert(false)}
            title="Berhasil"
            message="Persetujuan berhasil dikirim."
          />

          <View style={styles.card}>
            <View style={styles.cardStrip} />
            <View style={{ padding: 14 }}>
              <Text
                style={[
                  Fonts.paragraphRegularSmall,
                  { color: Colors.textPrimary, opacity: 0.8, marginBottom: 6 },
                ]}
              >
                {detail.nomor_risalah}
              </Text>

              <Text
                style={[
                  Fonts.header6,
                  { color: Colors.textPrimary, marginBottom: 4 },
                ]}
              >
                {detail.judul}
              </Text>

              <Text
                style={[
                  Fonts.paragraphRegularSmall,
                  { color: Colors.textPrimary },
                ]}
              >
                Dibuat oleh{" "}
                <Text style={[Fonts.paragraphMediumSmall]}>
                  {detail.nama_pembuat ?? detail.kode}
                </Text>
              </Text>
              <Text
                style={[
                  Fonts.paragraphRegularSmall,
                  { color: Colors.textPrimary },
                ]}
              >
                pada {detail.tgl_rapat}
                <Text style={[Fonts.paragraphMediumSmall]}>
                  {formatTanggalID(detail.tgl_rapat)}
                </Text>{" "}
              </Text>
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.textPrimary, marginBottom: 12 },
                ]}
              >
                Status :{STATUS_STYLE[statusNow]?.label ?? "Status"}
              </Text>
              {Array.isArray(detail.tujuan_string) &&
                detail.tujuan_string.length > 0 && (
                  <>
                    <SectionTitle>Ditujukan untuk :</SectionTitle>
                    <View style={{ gap: 6, marginBottom: 12 }}>
                      {detail.tujuan_string.map((t: string, idx: number) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <Text
                            style={[
                              Fonts.paragraphRegularSmall,
                              { color: Colors.textPrimary, marginTop: 1 },
                            ]}
                          >
                            {idx + 1}.
                          </Text>
                          <Text
                            style={[
                              Fonts.paragraphRegularSmall,
                              { color: Colors.textPrimary, flex: 1 },
                            ]}
                          >
                            {t}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              <SectionTitle>Detail Risalah :</SectionTitle>
              <Pressable
                onPress={() => viewPDF("risalahs", detail.id_risalah)}
                style={styles.pdfButton}
              >
                <FontAwesome5 name="file-pdf" size={14} color={Colors.white} />
                <Text
                  style={[Fonts.paragraphMediumSmall, { color: Colors.white }]}
                >
                  View PDF
                </Text>
              </Pressable>

              {/* Catatan dari server */}
              {(detail.status === "correction" || detail.status === "reject") &&
                detail.catatan && (
                  <>
                    <SectionTitle>Catatan :</SectionTitle>
                    <Text
                      style={[
                        Fonts.paragraphMediumSmall,
                        {
                          color: Colors.textPrimary,
                          backgroundColor: "#F9FAFB",
                          borderRadius: 8,
                          padding: 10,
                        },
                      ]}
                    >
                      {detail.catatan}
                    </Text>
                  </>
                )}
            </View>
          </View>
        </ScrollView>

        {/* Tombol Persetujuan */}
        {statusNow === "pending" && role === "3" && (
          <View
            style={[styles.bottomButtonContainer, { bottom: bottomOffset }]}
          >
            <Pressable
              onPress={() => setShowApprove(true)}
              style={styles.approveBtn}
            >
              <Text
                style={[Fonts.paragraphMediumSmall, { color: Colors.white }]}
              >
                Persetujuan
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* MODAL APPROVAL */}
      <Modal
        visible={showApprove}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApprove(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            setShowApprove(false);
            setShowOptions(false);
          }}
        />
        <View style={styles.modalCard}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={[Fonts.header4, { color: Colors.textPrimary }]}>
              PERSETUJUAN RISALAH
            </Text>
            <Pressable
              onPress={() => {
                setShowApprove(false);
                setShowOptions(false);
              }}
              hitSlop={10}
              style={{ padding: 6 }}
            >
              <FontAwesome5 name="times" size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <Text
            style={[
              Fonts.paragraphMediumSmall,
              { color: Colors.textPrimary, marginBottom: 6 },
            ]}
          >
            Status
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Pressable
              onPress={() => setShowOptions((v) => !v)}
              style={styles.selectBox}
            >
              <Text
                style={[
                  Fonts.paragraphMediumLarge,
                  { color: Colors.textPrimary },
                ]}
              >
                {selectedStatus
                  ? STATUS_STYLE[selectedStatus].label
                  : "Pilih Status"}
              </Text>
              <FontAwesome5
                name={showOptions ? "chevron-up" : "chevron-down"}
                size={14}
                color={Colors.textPrimary}
              />
            </Pressable>

            {showOptions && (
              <View style={styles.dropdown}>
                {(["approve", "reject", "correction"] as Status[]).map(
                  (value) => (
                    <Pressable
                      key={value}
                      onPress={() => {
                        setSelectedStatus(value);
                        setShowOptions(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && { backgroundColor: "#F3F4F6" },
                      ]}
                    >
                      <Text
                        style={[
                          Fonts.paragraphMediumLarge,
                          { color: Colors.textPrimary },
                        ]}
                      >
                        {STATUS_STYLE[value].label}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            )}
          </View>

          {(selectedStatus === "reject" || selectedStatus === "correction") && (
            <>
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.textPrimary, marginBottom: 6 },
                ]}
              >
                Catatan
              </Text>
              <TextInput
                placeholder="Catatan wajib diisi..."
                value={catatan}
                onChangeText={setCatatan}
                editable
                multiline
                style={styles.noteInput}
              />
            </>
          )}

          <Pressable
            disabled={isSaveDisabled || submitting}
            onPress={submitApproval}
            style={[
              styles.submitBtn,
              (isSaveDisabled || submitting) && { opacity: 0.6 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.white, textAlign: "center" },
                ]}
              >
                Simpan
              </Text>
            )}
          </Pressable>
        </View>
      </Modal>
      {/* <BottomNav /> */}
    </SafeAreaView>
  );
}

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
  card: {
    marginTop: 15,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7ECEF",
    overflow: "hidden",
  },
  cardStrip: { height: 8, backgroundColor: "#F3F6F9" },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: Colors.pdf,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bottomButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 20,
    elevation: 20,
  },
  approveBtn: {
    backgroundColor: Colors.navy ?? Colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalCard: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "20%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  selectBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E7ECEF",
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7ECEF",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    marginBottom: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E7ECEF",
  },
  submitBtn: {
    backgroundColor: Colors.navy ?? Colors.primary,
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: "center",
  },
});
