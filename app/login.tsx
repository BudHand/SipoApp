// app/login.tsx
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomAlert from "../components/CustomAlert";
import { apiFetch } from "../utils/api";
import { registerForPushNotificationsAsync } from "../utils/notifications";

// ─── Theme tokens (light only) ─────────────────────────────────────────────────

const T = {
  bg: "#F4F7FF",
  surface: "#FFFFFF",
  accent: "#2563EB",
  accentDark: "#1E50C8",
  accentDim: "rgba(37,99,235,0.07)",
  accentBorder: "rgba(37,99,235,0.14)",
  accentText: "rgba(37,99,235,0.70)",
  textPrimary: "#0F1E50",
  textHigh: "rgba(15,30,80,0.85)",
  textMid: "rgba(15,30,80,0.45)",
  textLow: "rgba(15,30,80,0.30)",
  textGhost: "rgba(15,30,80,0.20)",
  inputBg: "#F8FAFF",
  inputBorder: "rgba(15,30,80,0.10)",
  inputBorderFocus: "rgba(37,99,235,0.40)",
  orb1: "rgba(37,99,235,0.10)",
  orb2: "rgba(109,40,217,0.07)",
};

// ─── Inner screen ──────────────────────────────────────────────────────────────

function LoginScreenInner() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nipFocused, setNipFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertTitle, setAlertTitle] = useState("Info");
  const version = Constants.expoConfig?.version ?? "1.0.0";

  const passwordRef = useRef<TextInput>(null);

  const showAlert = (msg: string, title = "Info") => {
    setAlertMsg(msg);
    setAlertTitle(title);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!login || !password) {
      showAlert("NIP dan Password harus diisi", "Perhatian");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ login, password }),
      });

      if (res.status === "success") {
        const user = res.user;
        const apiToken = res.token;

        await AsyncStorage.multiSet([
          ["token", apiToken],
          ["user", JSON.stringify(user)],
          ["role", String(user.id_role ?? user.role ?? "")],
        ]);

        try {
          const expoToken = await registerForPushNotificationsAsync();
          if (expoToken) {
            await apiFetch("/notifikasi/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
              },
              body: JSON.stringify({ token: expoToken, platform: Platform.OS }),
            });
          }
        } catch (e) {
          console.warn("Gagal register notifikasi:", e);
        }

        showAlert(`Selamat datang, ${user.fullname}`, "Login Berhasil");
        setTimeout(() => {
          setAlertVisible(false);

          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "beranda/beranda" as never }],
            });
          }, 200); // kasih jeda sedikit sebelum pindah halaman
        }, 1000); // tampil 1.5 detik
      } else {
        showAlert(res.message ?? "NIP atau password salah", "Login Gagal");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlert("NIP atau password salah", "Login Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: T.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Background decorations */}
      <View
        style={[s.orb1, { backgroundColor: T.orb1 }]}
        pointerEvents="none"
      />
      <View
        style={[s.orb2, { backgroundColor: T.orb2 }]}
        pointerEvents="none"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.scroll, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          {/* Logo mark */}
          <View style={s.logoRing}>
            {/* <View style={s.logoInner}> */}
            {/* <FontAwesome6 name="file-lines" size={20} color="#fff" /> */}
            {/* <Image source={require("../assets/images/logo-sipo-2.png")} /> */}
            <Image
              source={require("../assets/images/logo-sipo-2.png")}
              style={s.logoImage}
            />
            {/* </View> */}
          </View>

          {/* System badge */}
          <View
            style={[
              s.sysBadge,
              { backgroundColor: T.accentDim, borderColor: T.accentBorder },
            ]}
          >
            <View style={[s.sysDot, { backgroundColor: T.accent }]} />
            <Text style={[s.sysLabel, { color: T.accentText }]}>
              SISTEM INFORMASI PERSURATAN ONLINE
            </Text>
          </View>

          {/* Heading */}
          <Text style={s.heroTitle}>
            Halo, <Text style={{ color: T.accent }}>Selamat</Text>
            {"\n"}Datang Kembali!
          </Text>

          <Text style={[s.heroSub, { color: T.textMid }]}>
            Akses dokumen dan persuratan kapan saja,{"\n"}di mana saja dengan
            mudah.
          </Text>
        </View>

        {/* Wave connector */}
        <View style={s.waveWrap}>
          <View style={s.waveCurve} />
        </View>

        {/* ── FORM CARD ─────────────────────────────────────────────────── */}
        <View style={s.card}>
          {/* Card header */}
          <View style={s.cardHeader}>
            <View
              style={[
                s.cardHeaderIcon,
                { backgroundColor: T.accentDim, borderColor: T.accentBorder },
              ]}
            >
              <FontAwesome6
                name="right-to-bracket"
                size={12}
                color={T.accent}
              />
            </View>
            <View>
              <Text style={[s.cardHeaderTitle, { color: T.textPrimary }]}>
                Masuk ke Akun
              </Text>
              <Text style={[s.cardHeaderSub, { color: T.textLow }]}>
                Gunakan NIP dan password Anda
              </Text>
            </View>
          </View>

          {/* NIP field */}
          <View style={s.fieldWrap}>
            <Text style={[s.fieldLabel, { color: T.textLow }]}>
              NOMOR INDUK PEGAWAI
            </Text>
            <View
              style={[
                s.inputWrap,
                {
                  backgroundColor: T.inputBg,
                  borderColor: nipFocused ? T.inputBorderFocus : T.inputBorder,
                },
              ]}
            >
              <FontAwesome6
                name="user"
                size={13}
                color={nipFocused ? T.accent : "rgba(15,30,80,0.28)"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, { color: T.textPrimary }]}
                placeholder="Masukkan NIP Anda..."
                placeholderTextColor="rgba(15,30,80,0.28)"
                value={login}
                onChangeText={setLogin}
                autoCapitalize="none"
                keyboardType="default"
                returnKeyType="next"
                onFocus={() => setNipFocused(true)}
                onBlur={() => setNipFocused(false)}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          {/* Password field */}
          <View style={s.fieldWrap}>
            <Text style={[s.fieldLabel, { color: T.textLow }]}>PASSWORD</Text>
            <View
              style={[
                s.inputWrap,
                {
                  backgroundColor: T.inputBg,
                  borderColor: pwFocused ? T.inputBorderFocus : T.inputBorder,
                },
              ]}
            >
              <FontAwesome6
                name="lock"
                size={13}
                color={pwFocused ? T.accent : "rgba(15,30,80,0.28)"}
                style={s.inputIcon}
              />
              <TextInput
                ref={passwordRef}
                style={[s.input, { color: T.textPrimary }]}
                placeholder="Masukkan Password Anda..."
                placeholderTextColor="rgba(15,30,80,0.28)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={s.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome6
                  name={showPassword ? "eye-slash" : "eye"}
                  size={13}
                  color="rgba(15,30,80,0.30)"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={s.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <View style={s.loginBtnHighlight} />
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={s.loginBtnText}>Masuk</Text>
                <FontAwesome6 name="arrow-right" size={14} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={s.orRow}>
            <View style={[s.orLine, { backgroundColor: T.inputBorder }]} />
            <Text style={[s.orText, { color: T.textGhost }]}>SIPO © 2025</Text>
            <View style={[s.orLine, { backgroundColor: T.inputBorder }]} />
          </View>

          <View style={s.footerNote}>
            <Text style={[s.footerText, { color: T.textMid }]}>
              Butuh bantuan? Hubungi{" "}
            </Text>
            <Text style={[s.footerLink, { color: T.accent }]}>
              Administrator
            </Text>
          </View>
        </View>

        <Text style={[s.version, { color: T.textGhost }]}>
          SIPO MOBILE v{version}
        </Text>
      </ScrollView>

      {/* Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMsg}
        onClose={() => {
          setAlertVisible(false);

          if (alertTitle === "Login Berhasil") {
            navigation.reset({
              index: 0,
              routes: [{ name: "beranda/beranda" as never }],
            });
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  return (
    <SafeAreaProvider>
      <LoginScreenInner />
    </SafeAreaProvider>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
    zIndex: 0,
  },
  orb2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 260,
    left: -80,
    zIndex: 0,
  },

  // Hero
  hero: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 0,
    alignItems: "center",
    zIndex: 2,
  },

  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "rgba(37,99,235,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#2563EB",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoInner: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  logoImage: {
    width: 52, // Sesuaikan dengan ukuran lingkaran kamu
    height: 52, // Sesuaikan dengan ukuran lingkaran kamu
    resizeMode: "contain", // Menjaga rasio gambar agar tidak gepeng
  },

  sysBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  sysDot: { width: 6, height: 6, borderRadius: 3 },
  sysLabel: { fontSize: 9.5, fontWeight: "700", letterSpacing: 0.5 },

  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F1E50",
    letterSpacing: -0.6,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },

  // Wave
  waveWrap: { height: 36, overflow: "hidden", zIndex: 2 },
  waveCurve: {
    height: 72,
    marginTop: -36,
    backgroundColor: "#fff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 8,
    zIndex: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderTitle: { fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  cardHeaderSub: { fontSize: 11, fontWeight: "500", marginTop: 1 },

  // Fields
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 13.5, fontWeight: "500", paddingVertical: 0 },
  eyeBtn: { paddingLeft: 8 },

  // Login button
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    marginTop: 8,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  loginBtnHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },

  // Footer
  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },

  footerNote: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  footerText: { fontSize: 11.5, fontWeight: "500" },
  footerLink: { fontSize: 11.5, fontWeight: "700" },

  version: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 16,
  },
});

// ─── Alert styles ──────────────────────────────────────────────────────────────

const al = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,30,80,0.45)",
  },
  box: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15,30,80,0.07)",
    shadowColor: "#0F1E50",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1.5,
    backgroundColor: "rgba(37,99,235,0.28)",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(37,99,235,0.07)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F1E50",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 13,
    color: "rgba(15,30,80,0.55)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  btn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
