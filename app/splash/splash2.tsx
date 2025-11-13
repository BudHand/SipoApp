import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";

// Props untuk menerima status aktif dari PagerView
export default function Splash2({ active }: { active?: boolean }) {
  // 🔹 Animasi state
  const bgTranslateY = useRef(new Animated.Value(200)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageTranslateY = useRef(new Animated.Value(30)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;

  // 🔹 Jalankan animasi saat halaman aktif
  useEffect(() => {
    if (active) {
      Animated.sequence([
        // Background naik dari bawah
        Animated.parallel([
          Animated.timing(bgTranslateY, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(bgOpacity, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(200),

        // Gambar muncul naik
        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(imageTranslateY, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(200),

        // Judul muncul
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(titleTranslateY, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(150),

        // Subjudul muncul
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
    } else {
      // Reset kalau halaman tidak aktif (supaya bisa animasi ulang)
      bgTranslateY.setValue(200);
      bgOpacity.setValue(0);
      imageOpacity.setValue(0);
      imageTranslateY.setValue(30);
      titleOpacity.setValue(0);
      titleTranslateY.setValue(20);
      subtitleOpacity.setValue(0);
      subtitleTranslateY.setValue(20);
    }
  }, [active]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.white,
      }}
    >
      {/* Background muncul dari bawah */}
      <Animated.View
        style={{
          position: "absolute",
          backgroundColor: "#E0EDFE",
          width: 340,
          height: 650,
          bottom: 100,
          borderTopEndRadius: 200,
          borderTopLeftRadius: 200,
          top: "42%",
          transform: [{ translateY: active ? bgTranslateY : 0 }],
          opacity: active ? bgOpacity : 1,
        }}
      />

      {/* Gambar */}
      <Animated.Image
        source={require("../../assets/images/welcome.png")}
        style={{
          width: 283,
          height: 283,
          marginBottom: 2,
          opacity: active ? imageOpacity : 1,
          transform: [{ translateY: active ? imageTranslateY : 0 }],
        }}
        resizeMode="contain"
      />

      {/* Judul */}
      <Animated.Text
        style={[
          Fonts.header1,
          {
            textAlign: "center",
            color: Colors.navy,
            opacity: active ? titleOpacity : 1,
            transform: [{ translateY: active ? titleTranslateY : 0 }],
          },
        ]}
      >
        Semua Jadi Lebih Praktis
      </Animated.Text>

      {/* Subjudul */}
      <Animated.Text
        style={[
          Fonts.paragraphRegularLarge,
          {
            textAlign: "center",
            color: Colors.navy,
            marginTop: 10,
            opacity: active ? subtitleOpacity : 1,
            transform: [{ translateY: active ? subtitleTranslateY : 0 }],
          },
        ]}
      >
        Kelola memo, undangan, dan risalah Anda{"\n"}
        dengan mudah kapan saja dan dimana saja.
      </Animated.Text>
    </View>
  );
}
