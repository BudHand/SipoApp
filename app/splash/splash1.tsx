import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";
import { checkFirstLaunch } from "../../utils/AppLaunchManager";

const { width } = Dimensions.get("window");

export default function Splash1() {
  const router = useRouter();

  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateX = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");

  const titleText = "SIPO";
  const subtitleText = "Sistem Informasi\nPersuratan Online";

  useEffect(() => {
  const runAnimation = async () => {
    // 🔹 Cek apakah ini pertama kali aplikasi dijalankan
    const firstTime = await checkFirstLaunch();
    const token = await AsyncStorage.getItem("token");

    // 🔹 Jalankan animasi logo
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1.6,
          friction: 3,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.9,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateX, {
          toValue: -width * 0.18,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      typeTitle(); // tetap jalan seperti sebelumnya
    });

    // 🔹 Tentukan navigasi berdasarkan hasil pengecekan
    const timer = setTimeout(() => {
      if (firstTime) {
        // pertama kali install → ke splash2 atau onboarding
        // router.replace("/splash/splash2");
        router.push("/splash");
      } else if (!token) {
        // sudah pernah buka tapi belum login / logout
        router.replace("/login");
        // router.replace("/splash");
      } else {
        // sudah login → langsung ke beranda
        router.replace("/beranda/beranda");
        // router.replace("/splash");
      }
    }, 6000); // sesuai durasi animasi logo

    return () => clearTimeout(timer);
  };

  runAnimation();
}, []);

  const typeTitle = () => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(titleText.slice(0, i));
      i++;
      if (i > titleText.length) {
        clearInterval(interval);
        setTimeout(typeSubtitle, 200); // jeda sebelum lanjut ke subtitle
      }
    }, 80);
  };

  const typeSubtitle = () => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedSubtitle(subtitleText.slice(0, i));
      i++;
      if (i > subtitleText.length) clearInterval(interval);
    }, 30);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* LOGO */}
      <Animated.Image
        source={require("../../assets/images/Logo-SIPO.png")}
        style={{
          width: 150,
          height: 150,
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { translateX: logoTranslateX }],
        }}
        resizeMode="contain"
      />

      {/* TEKS */}
      <Animated.View
        style={{
          position: "absolute",
          left: width * 0.5,
          justifyContent: "center",
        }}
      >
        {/* Judul Bold */}
        <Text
          style={[
            Fonts.header1,
            {
              color: Colors.navy,
              fontWeight: "900",
              lineHeight: 44,
              letterSpacing: 0.5,
            },
          ]}
        >
          {typedTitle}
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            Fonts.paragraphRegularLarge,
            {
              color: Colors.navy,
              marginTop: 0,
              fontWeight: "500",
              lineHeight: 20,
            },
          ]}
        >
          {typedSubtitle}
        </Text>
      </Animated.View>

      {/* DOTS */}
      {/* <View
        style={{
          position: "absolute",
          bottom: height * 0.12,
          alignSelf: "center",
        }}
      >
        <Dots
          total={4}
          activeIndex={0}
          color={Colors.navy}
          inactiveColor="rgba(30,65,120,0.2)"
        />
      </View> */}
    </View>
  );
}
