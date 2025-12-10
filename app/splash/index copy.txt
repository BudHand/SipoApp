import Dots from "@/components/Dots";
import { Colors } from "@/constants/colors";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import Splash2 from "./splash2";
import Splash3 from "./splash3";
import Splash4 from "./splash4";

export default function SplashPager() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);

  // Handle perubahan halaman
  const handlePageChange = (e: PagerViewOnPageSelectedEvent) => {
    const position = e.nativeEvent.position;
    setPage(position);

    if (position === 3) {
      // Tunggu sebentar biar animasi selesai dulu
      setTimeout(() => {
        router.replace("/login");
      }, 200); // 0.2 detik setelah sampai di slide terakhir
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <Stack.Screen options={{ headerShown: false }} />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        <View key="2">
          <Splash2 active={page === 0} />
        </View>
        <View key="3">
          <Splash3 active={page === 1} />
        </View>
        <View key="4">
          <Splash4 active={page === 2} />
        </View>

        {/* Halaman transisi ke login */}
        <View key="5" style={styles.lastSlide}>
          <View style={styles.transitionCircle} />
        </View>
      </PagerView>

      {/* Dots (4 titik: Splash2, 3, 4, dan halaman transisi) */}
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
