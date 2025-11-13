// app/profil/profil.tsx
import Button from "@/components/button";
import { TextField } from "@/components/FormControl";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { apiFetch } from "@/utils/api";
import { FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login"); // ganti navigation.replace
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/profile`);

        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.white,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
        style={[
          Fonts.paragraphMediumLarge,
          {marginTop: 12, color: Colors.textSecondary},
        ]}>Memuat profil...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null; // already redirected to login
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* Header navy melengkung */}
      <View
        style={{
          backgroundColor: Colors.navy,
          paddingTop: 28,
          paddingBottom: 32,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          alignItems: "center",
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "rgba(255,255,255,0.15)", // tetap transparan supaya kontras
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {user.profile_image ? (
            <Image
              source={{ uri: user.profile_image }}
              style={{ width: 120, height: 120, borderRadius: 60 }}
              resizeMode="cover"
            />
          ) : (
            <FontAwesome6 name="user" size={56} color={Colors.white} />
          )}
        </View>

        <Text
          style={[Fonts.header1, { color: Colors.white, textAlign: "center" }]}
        >
          {user.fullname}
        </Text>
        <Text
          style={[
            Fonts.paragraphRegularSmall,
            {
              color: Colors.white,
              opacity: 0.85,
              textAlign: "center",
              marginTop: 4,
            },
          ]}
        >
          {user.position}
        </Text>
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 120, // supaya tidak ketutup bottom nav
          gap: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Semua label otomatis pakai warna dari komponenmu; 
            untuk konsistensi teks sekitar form pakai textPrimary/Secondary */}
        <TextField
          label="Email"
          placeholder="example@gmail.com"
          value={user.email}
          status="disabled"
        />

        <TextField
          label="Nama Depan"
          placeholder="-"
          value={user.firstname}
          status="disabled"
        />

        <TextField
          label="Nama Belakang"
          placeholder="-"
          value={user.lastname}
          status="disabled"
        />

        <TextField
          label="NIP"
          placeholder="NIP"
          value={user.nip}
          status="disabled"
        />

        <TextField
          label="Nomor Telepon"
          placeholder="08xxxxxxxxxx"
          value={user.phone_number}
          status="disabled"
        />

        {/* Logout */}
        <View style={{ height: 8 }} />
        <Button title="Logout" onPress={handleLogout} color={Colors.danger} />
      </ScrollView>
    </SafeAreaView>
  );
}
