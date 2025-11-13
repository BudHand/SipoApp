import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const API_URL = "https://sipo.ptrekaindo.co.id/api"; // change this

export const viewPDF = async (type: string, id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const endpoint = `/${type}/${id}/pdf`;
    const url = `${API_URL}${endpoint}`;

    if (Platform.OS === "web") {
      window.open(`${url}?token=${token}`, "_blank");
      return;
    }

    // ✅ For Android/iOS: download using FileSystem
    const fileUri = `${FileSystem.documentDirectory}${type}_${id}.pdf`;

    const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${token}`,
      },
    });

    const { uri } = await downloadResumable.downloadAsync();
    console.log("PDF downloaded to:", uri);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      alert("Sharing is not available on this device.");
    }
  } catch (error) {
    console.error("View PDF Error:", error);
  }
};
