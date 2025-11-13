// utils/AppLaunchManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem("isFirstLaunch");
    if (value === null) {
      await AsyncStorage.setItem("isFirstLaunch", "false");
      return true; // artinya pertama kali dijalankan
    }
    return false; // sudah pernah dijalankan
  } catch (error) {
    console.log("Error checking first launch:", error);
    return false;
  }
};
