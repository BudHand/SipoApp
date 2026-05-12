// app/_layout.tsx
import BottomNav from "@/components/BottomNav";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import {
  Stack,
  useGlobalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { BackHandler, ToastAndroid, View } from "react-native";

export const unstable_settings = { anchor: "login" };

const groupsWithBottomNav = [
  "/beranda",
  "/notifikasi",
  "/memo",
  "/profil",
  "/undangan",
  "/approval",
  "/risalah",
  "/disposisi",
];

// ─── Inner layout (has access to ThemeContext) ────────────────────────────────

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      console.log("BACK:", pathname);

      if (pathname == "/login" || pathname.startsWith("/splash")) {
        return true;
      }

      if (pathname === "/beranda/beranda") {
        if (
          global.lastBackPressed &&
          Date.now() - global.lastBackPressed < 2000
        ) {
          BackHandler.exitApp();
          return true;
        }

        global.lastBackPressed = Date.now();
        ToastAndroid.show("Tekan sekali lagi untuk keluar", ToastAndroid.SHORT);
        return true;
      }

      if (router.canGoBack()) {
        router.back();
        return true;
      }

      BackHandler.exitApp();
      return true;
    });

    return () => sub.remove();
  }, [pathname]);

  const showBottomNav = groupsWithBottomNav.some((p) => pathname.startsWith(p));

  return (
    <NavThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack
          initialRouteName="splash/splash1"
          screenOptions={{
            gestureEnabled: false,
            animation: "default",
          }}
        >
          {/* Beranda */}
          <Stack.Screen
            name="beranda/beranda"
            options={{ headerShown: false }}
          />

          {/* Notifikasi */}
          <Stack.Screen
            name="notifikasi/notifikasi"
            options={{ headerShown: false }}
          />

          {/* Splash */}
          <Stack.Screen
            name="splash/splash1"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="splash/splash2"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="splash/splash3"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="splash/splash4"
            options={{ headerShown: false }}
          />

          {/* Main */}
          <Stack.Screen
            name="login"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen name="memo/memos" options={{ headerShown: false }} />
          <Stack.Screen
            name="memo/memo-detail"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="undangan/undangan"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="undangan/undangan-detail"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="risalah/risalah"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="risalah/risalah-detail"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="approval/approval"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="profil/profil" options={{ headerShown: false }} />
        </Stack>

        <StatusBar style="auto" />

        {/* BottomNav menerima isDark dari Context */}
        {showBottomNav && (
          <View
            pointerEvents="box-none"
            style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
          >
            <BottomNav isDark={isDark} />
          </View>
        )}
      </View>
    </NavThemeProvider>
  );
}

// ─── Root (wraps everything with ThemeProvider & font loading) ────────────────

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
