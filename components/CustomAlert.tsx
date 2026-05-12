import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function CustomAlert({
  visible,
  onClose,
  title,
  message,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(15,30,80,0.45)",
  },
  container: {
    width: "82%",
    maxWidth: 320,
    minWidth: 280,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 22,
    alignItems: "center",
    shadowColor: "#0F1E50",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    transform: [{ translateY: -20 }],
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    color: "#0F1E50",
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
    color: "#64748B",
  },
  button: {
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
