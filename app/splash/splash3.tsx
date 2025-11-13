import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";

export default function Splash3({ active }: { active?: boolean }) {
  // 🎬 Animated Values
  const bgTranslateX = useRef(new Animated.Value(-400)).current; // background muncul dari kiri
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;

  const runAnimation = () => {
    // Reset semua nilai sebelum mulai
    bgTranslateX.setValue(-400);
    bgOpacity.setValue(0);
    imageOpacity.setValue(0);
    imageTranslateY.setValue(50);
    titleOpacity.setValue(0);
    titleTranslateY.setValue(20);
    subtitleOpacity.setValue(0);
    subtitleTranslateY.setValue(20);

    // 🔥 Urutan animasi
    Animated.sequence([
      // Background geser dari kiri dengan fade-in
      Animated.parallel([
        Animated.timing(bgTranslateX, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(300),

      // Gambar naik dengan bounce lembut
      Animated.sequence([
        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(imageTranslateY, {
            toValue: -10,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(imageTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(250),

      // Judul muncul dari bawah
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(150),

      // Subjudul muncul terakhir
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // 🔁 Jalankan ulang animasi saat aktif
  useEffect(() => {
    if (active) {
      // Reset nilai dulu agar transisi putih → animasi lebih natural
      bgTranslateX.setValue(-400);
      bgOpacity.setValue(0);
      imageOpacity.setValue(0);
      imageTranslateY.setValue(30);
      titleOpacity.setValue(0);
      titleTranslateY.setValue(20);
      subtitleOpacity.setValue(0);
      subtitleTranslateY.setValue(20);

      const timeout = setTimeout(() => {
        runAnimation();
      }, 60); // delay sedikit supaya tidak langsung pop-in

      return () => clearTimeout(timeout);
    }
  }, [active]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
      }}
    >
      {/* Background shape animasi dari kiri */}
      <Animated.View
        style={{
          position: "absolute",
          backgroundColor: "#E0EDFE",
          width: 360,
          height: 300,
          right: 45,
          borderBottomEndRadius: 150,
          borderTopRightRadius: 150,
          top: "23%",
          opacity: bgOpacity,
          transform: [{ translateX: bgTranslateX }],
        }}
      />

      {/* Gambar utama */}
      <Animated.Image
        source={require("../../assets/images/memo.png")}
        style={{
          width: 283,
          height: 283,
          marginBottom: 40,
          opacity: imageOpacity,
          transform: [{ translateY: imageTranslateY }],
        }}
        resizeMode="contain"
      />

      {/* Judul */}
      <Animated.Text
        style={[
          Fonts.header1,
          {
            color: Colors.navy,
            textAlign: "center",
            marginBottom: 10,
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        Resmi dan Efisien
      </Animated.Text>

      {/* Subjudul */}
      <Animated.Text
        style={[
          Fonts.paragraphRegularLarge,
          {
            color: Colors.textSecondary,
            textAlign: "center",
            marginBottom: 40,
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          },
        ]}
      >
        Sahkan dokumen Anda tanpa ragu{"\n"}
        dengan tanda tangan digital yang{"\n"}
        terenkripsi dan terlindungi.
      </Animated.Text>
    </View>
  );
}
