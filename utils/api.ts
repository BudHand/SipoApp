import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

const API_URL = "https://sipo.ptrekaindo.co.id/api";
// const API_URL = "http://127.0.0.1:8000/api";

export const apiFetch = async (endpoint: string, options: any = {}) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error("❌ API Error Response:", data);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("❌ API Fetch Error:", error);
    throw error;
  }
};

export async function viewPDF(type: string, id: number) {
  try {
    const data = await apiFetch(`/${type}/${id}/pdf`, { method: "GET" });
    Linking.openURL(data.url);
  } catch (error) {
    console.error("View PDF Error:", error);
  }
}
