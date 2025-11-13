import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // pakai router
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login"); // ganti navigation.replace
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {user ? (
        <>
          <Text style={{ fontSize: 20, marginBottom: 20 }}>
            Selamat datang, {user.fullname}
          </Text>
          <Button title="Lihat Memo" onPress={() => router.push("/memo/memos")} />

          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <Text>Memuat data user...</Text>
      )}
    </View>
  );
}
