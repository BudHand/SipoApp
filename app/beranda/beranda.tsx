import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { apiFetch } from "@/utils/api";
import { formatTanggalID } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Redirect, SplashScreen, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BerandaScreen() {
  // ✅ SEMUA HOOK DI ATAS — TANPA PENGECUALIAN
  const router = useRouter(); // 👈 dipindahkan ke atas
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Semua state yang sebelumnya di bawah
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [waitingApproval, setWaitingApproval] = useState<any[]>([]);
  const [memoCount, setMemoCount] = useState(0);
  const [risalahCount, setRisalahCount] = useState(0);
  const [undanganCount, setUndanganCount] = useState(0);
  const [fullname, setFullname] = useState("-");
  const [role, setRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const backPressCount = useRef(0);
  const [showExitModal, setShowExitModal] = useState(false);

  // Efek untuk cek auth
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(!!token);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked) {
      SplashScreen.hideAsync();
    }
  }, [authChecked]);

  // 🔁 Pindahkan fetchDashboardData ke sini (sebagai useCallback)
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return; // hindari fetch jika tidak login
    try {
      setRole(await AsyncStorage.getItem("role"));
      const res = await apiFetch("/dashboard");
      const json = res;
      if (json.data) {
        const {
          memo_count,
          undangan_count,
          risalah_count,
          undangan,
          recent_docs,
          fullname,
        } = json.data;

        setFullname(fullname);
        setMemoCount(memo_count);
        setUndanganCount(undangan_count);
        setRisalahCount(risalah_count);

        const meetings = undangan.map((u: any) => ({
          title: u.judul,
          date: formatTanggalID(u.tgl_rapat),
          time: u.waktu ?? "-",
          room: u.tempat ?? "-",
          id: u.id_undangan,
          diff: u.selisih_hari,
        }));

        const approval = recent_docs.map((doc: any) => ({
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
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const onRefresh = async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "undangan":
        return require("@/assets/icons/undangan/undangan_navy.png");
      case "memo":
        return require("@/assets/icons/memo/memo_navy.png");
      case "risalah":
        return require("@/assets/icons/risalah/risalah_navy.png");
      default:
        return require("@/assets/icons/memo/memo_navy.png");
    }
  };

  // 🔸 [TAMBAHAN] useEffect untuk BackHandler — ditempatkan di sini (setelah semua useState/useRef, sebelum conditional return)
  useEffect(() => {
  const handleBackPress = () => {
    if (backPressCount.current === 0) {
      backPressCount.current = 1;
      setShowExitModal(true); // Tampilkan modal

      setTimeout(() => {
        backPressCount.current = 0;
        setShowExitModal(false); // Sembunyikan setelah 2 detik
      }, 2000);

      return true; // mencegah exit
    } else {
      BackHandler.exitApp();
      return true;
    }
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackPress
  );

  return () => backHandler.remove();
}, []);


  // ✅ Baru lakukan conditional render di akhir
  if (!authChecked) {
    return null; // atau loading
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }


  // Render UI
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F5F8FB" }}
      edges={["top"]}
    >
      <StatusBar
        barStyle="dark-content" // 👈 membuat ikon jadi hitam
        backgroundColor="#F5F8FB" // 👈 warna latar belakang status bar
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 16,
          paddingTop: 10,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.navy]} // warna spinner Android
            tintColor={Colors.navy} // warna spinner iOS
          />
        } // 👈 Tambahan untuk fitur tarik-refresh
      >
        {/* ===== Card 1: Header + Quick Stats(Counter) ===== */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={[Fonts.header6, { color: Colors.navy }]}>Halo,</Text>
              <Text style={[Fonts.header1, { color: Colors.navy }]}>
                {fullname}
              </Text>
            </View>
            <Image
              source={require("@/assets/images/Logo-SIPO.png")}
              style={{ width: 38, height: 38, resizeMode: "contain" }}
            />
          </View>

          {/* Quick stats */}
          <View style={styles.quickStatContainer}>
            <TouchableOpacity style={{ flex: 2 }} onPress={() => router.push("/memo/memos")}>
            <View style={[styles.quickCard, { backgroundColor: "#EAF0FF" }]}>
              <Image
                source={require("@/assets/icons/memo/memo_blue.png")}
                style={styles.quickIcon}
              />
              <Text style={[Fonts.header2, { color: Colors.memo_card_icon }]}>
                {memoCount}
              </Text>
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.memo_card_icon },
                ]}
              >
                Memo
              </Text>
            </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 2 }} onPress={() => router.push("/undangan/undangan")}>
            <View style={[styles.quickCard, { backgroundColor: "#F2ECFF" }]}>
              <Image
                source={require("@/assets/icons/undangan/undangan_purple.png")}
                style={styles.quickIcon}
              />
              <Text
                style={[Fonts.header2, { color: Colors.undangan_card_icon }]}
              >
                {undanganCount}
              </Text>
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.undangan_card_icon },
                ]}
              >
                Undangan
              </Text>
            </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 2 }} onPress={() => router.push("/risalah/risalah")}>  
            <View style={[styles.quickCard, { backgroundColor: "#E7FAEE" }]}>
              <Image
                source={require("@/assets/icons/risalah/risalah_green.png")}
                style={styles.quickIcon}
              />
              <Text
                style={[Fonts.header2, { color: Colors.risalah_card_icon }]}
              >
                {risalahCount}
              </Text>
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.risalah_card_icon },
                ]}
              >
                Risalah
              </Text>
            </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== Card 2: Menu 4 Ikon  ===== */}
        <View style={styles.card}>
          <View style={styles.menuRow}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/memo/memos")}
            >
              <Image
                source={require("@/assets/icons/memo/memo_fill_blue.png")}
                style={styles.menuIcon}
              />
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.navy },
                  styles.menuText,
                ]}
              >
                Memo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/undangan/undangan")}
            >
              <Image
                source={require("@/assets/icons/undangan/undangan_fill_purple.png")}
                style={styles.menuIcon}
              />
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.navy },
                  styles.menuText,
                ]}
              >
                Undangan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/risalah/risalah")}
            >
              <Image
                source={require("@/assets/icons/risalah/risalah_fill_green.png")}
                style={styles.menuIcon}
              />
              <Text
                style={[
                  Fonts.paragraphMediumSmall,
                  { color: Colors.navy },
                  styles.menuText,
                ]}
              >
                Risalah
              </Text>
            </TouchableOpacity>
            {/* {role === "3" && ( */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/approval/approval")}
              >
                <Image
                  source={require("@/assets/icons/signature/signature_fill_yellow.png")}
                  style={[styles.menuIcon]} // override style
                />

                <Text
                  style={[
                    Fonts.paragraphMediumSmall,
                    { color: Colors.navy },
                    styles.menuText,
                  ]}
                >
                  Approval
                </Text>
              </TouchableOpacity>
            {/* )} */}
          </View>
        </View>

        {/* ===== Card 3: Rapat Mendatang ===== */}
        <View style={styles.card}>
          <Text
            style={[
              Fonts.header6,
              { color: Colors.textPrimary, marginBottom: 6 },
            ]}
          >
            Rapat Mendatang
          </Text>

          {upcomingMeetings.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text
                style={[
                  Fonts.paragraphRegularSmall,
                  { color: Colors.textSecondary },
                ]}
              >
                Tidak ada rapat dalam waktu dekat
              </Text>
            </View>
          ) : (
            upcomingMeetings.map((item, idx) => {
              const isLast = idx === upcomingMeetings.length - 1;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.itemRow, !isLast && styles.itemDivider]}
                  onPress={() =>
                    router.push(`/undangan/undangan-detail?id=${item.id}`)
                  }
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#fff",
                      paddingVertical: 10,
                    }}
                  >
                    <View style={{ width: 40, alignItems: "center" }}>
                      <Image
                        // source={require("@/assets/icons/undangan/undangan_navy.png")}
                        // style={{ width: 20, height: 20 }}
                        // resizeMode="contain"
                        source={require("@/assets/icons/undangan/undangan_navy.png")}
                        style={{ width: 25, height: 25 }}
                        contentFit="contain" // ganti resizeMode jadi contentFit
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={[
                            Fonts.paragraphMediumSmall,
                            { color: Colors.navy, flexShrink: 1 },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            Fonts.paragraphRegularSmall,
                            { color: Colors.navy, marginLeft: 8 },
                          ]}
                        >
                          {item.diff === 0 ? "Hari Ini" : `${item.diff} Hari`}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginTop: 2,
                          gap: 10,
                        }}
                      >
                        <Text
                          style={[
                            Fonts.paragraphRegularSmall,
                            { color: Colors.textSecondary },
                          ]}
                        >
                          {item.date}
                        </Text>
                        <Text
                          style={[
                            Fonts.paragraphRegularSmall,
                            { color: Colors.textSecondary },
                          ]}
                        >
                          {item.time}
                        </Text>
                      </View>

                      <Text
                        style={[
                          Fonts.paragraphRegularSmall,
                          { color: Colors.textSecondary, marginTop: 2 },
                        ]}
                      >
                        {item.room}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ===== Card 4: Menunggu Approval ===== */}
        {role === "3" && (
          <View style={styles.card}>
            <Text
              style={[
                Fonts.header6,
                { color: Colors.textPrimary, marginBottom: 6 },
              ]}
            >
              Menunggu Approval
            </Text>

            {waitingApproval.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text
                  style={[
                    Fonts.paragraphRegularSmall,
                    { color: Colors.textSecondary },
                  ]}
                >
                  Semua dokumen telah disetujui
                </Text>
              </View>
            ) : (
              waitingApproval.map((item, idx) => {
                const isLast = idx === waitingApproval.length - 1;
                return (
                  <View
                    key={idx}
                    style={[styles.itemRow, !isLast && styles.itemDivider]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingVertical: 10,
                      }}
                    >
                      <Image
                        source={getIconForType(item.type)}
                        style={{ width: 25, height: 25 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            Fonts.paragraphMediumSmall,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            Fonts.paragraphRegularSmall,
                            { color: Colors.textSecondary },
                          ]}
                        >
                          {item.date}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          switch (item.type) {
                            case "memo":
                              router.push(`/memo/memo-detail?id=${item.id}`);
                              break;
                            case "undangan":
                              router.push(
                                `/undangan/undangan-detail?id=${item.id}`
                              );
                              break;
                            case "risalah":
                              router.push(
                                `/risalah/risalah-detail?id=${item.id}`
                              );
                              break;
                            default:
                              console.log("Unknown type:", item.type);
                          }
                        }}
                      >
                        <Text
                          style={[
                            Fonts.paragraphRegularSmall,
                            {
                              color: Colors.navy,
                              textDecorationLine: "underline",
                            },
                          ]}
                        >
                          View Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
      {/* ===== Modal Konfirmasi Keluar Aplikasi ===== */}
      {/* Modal Keluar Aplikasi */}
      {showExitModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tekan lagi untuk keluar</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowExitModal(false);
                  backPressCount.current = 0;
                }}
              >
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.exitButton]}
                onPress={() => {
                  BackHandler.exitApp();
                }}
              >
                <Text style={styles.buttonText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10, // tetap mengikuti filemu; kalau mau kembali ke 20 tinggal ganti angka ini
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quickStatContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  quickCard: {
    // flex: 1,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 24,
    marginHorizontal: 4,
  },
  quickIcon: { width: 28, height: 28, marginBottom: 6 },

  menuRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 16,
  },
  menuItem: {
    alignItems: "center",
    width: 76, // fixed width so icons and labels align across items
    justifyContent: "center",
  },
  menuIcon: { width: 28, height: 28, marginBottom: 6 },
  menuText: {
    textAlign: "center",
    lineHeight: 18,
    includeFontPadding: false,
  },

  itemRow: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#D9E0EA",
  },

  // empty state
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.navy,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  exitButton: {
    backgroundColor: Colors.navy, // sesuaikan dengan warna tema Anda
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
