import Dots from "@/components/Dots";
import { Colors } from "@/constants/colors";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import Splash2 from "./splash2";
import Splash3 from "./splash3";
import Splash4 from "./splash4";

const { width } = Dimensions.get("window");

export default function SplashPager() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Navigasi otomatis ke login saat halaman terakhir
  useEffect(() => {
    if (page === 3) {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [page, router]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / width);
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Penting untuk performa
        style={styles.pager}
      >
        <View style={{ width }}>{Splash2({ active: page === 0 })}</View>
        <View style={{ width }}>{Splash3({ active: page === 1 })}</View>
        <View style={{ width }}>{Splash4({ active: page === 2 })}</View>
        <View style={[styles.lastSlide, { width }]}>
          <View style={styles.transitionCircle} />
        </View>
      </ScrollView>

      <View style={styles.dotsContainer}>
        <Dots
          total={3}
          activeIndex={page}
          color={Colors.navy}
          inactiveColor="rgba(30,65,120,0.2)"
          size={6}
          spacing={6}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  dotsContainer: {
    position: "absolute",
    bottom: 90,
    width: "100%",
    alignItems: "center",
  },
  lastSlide: {
    flex: 1,
    backgroundColor: Colors.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  transitionCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    opacity: 0.4,
  },
});