import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Platform, Text, View } from "react-native";

type LampiranItem = {
  id: string;
  url: string;
};

export default function LampiranScreen() {
  const params = useLocalSearchParams();
  const id_memo = String(params.id_memo ?? params.id ?? "");

  const [items, setItems] = useState<LampiranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id_memo) return;

    const fetchLampiran = async () => {
      try {
        const res = await fetch(`https://example.com/api/memos/${id_memo}/lampiran`);
        const json = await res.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          const data: LampiranItem[] = json.data.map((url: string, i: number) => ({
            id: `${i}`,
            url,
          }));
          setItems(data);
        } else {
          Alert.alert("Info", "Lampiran tidak ditemukan.");
        }
      } catch (err) {
        console.error("Fetch lampiran error:", err);
        Alert.alert("Error", "Gagal memuat lampiran.");
      } finally {
        setLoading(false);
      }
    };

    fetchLampiran();
  }, [id_memo]);

  const downloadAll = async () => {
    if (!id_memo) return;
    const url = `https://sipo.ptrekaindo.co.id/api/memos/${id_memo}/lampiran/downloadAll`;

    if (Platform.OS === "web") {
      // web: langsung trigger download lewat browser
      window.location.href = url;
      return;
    }

    try {
      setDownloading(true);
      const fileUri = FileSystem.documentDirectory + `lampiran-${id_memo}.pdf`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sukses", `File berhasil diunduh: ${uri}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Gagal mengunduh file.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Memuat lampiran...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Lampiran Memo #{id_memo}
      </Text>

      {items.length === 0 ? (
        <Text>Tidak ada lampiran.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 8 }}>
              <Text>{item.url}</Text>
            </View>
          )}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title={downloading ? "Mengunduh..." : "Download Semua Lampiran"}
          onPress={downloadAll}
          disabled={downloading}
        />
      </View>
    </View>
  );
}
