//import AsyncStorage from "@react-native-async-storage/async-storage";
//import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const storage = {
  async getItem(key) {
    console.log(Platform.OS);
    //return SecureStore.getItem(key);

    //return await AsyncStorage.getItem(key);
  },

  async setItem(key, value) {
    //SecureStore.setItem(key, value);
    return;
    //return await AsyncStorage.setItem(key, value);
  },
};

export default storage;
