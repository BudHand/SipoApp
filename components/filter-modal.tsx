import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function CustomModal({
  visible,
  onClose,
  children,
}: CustomModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {children ? (
            children
          ) : (
            <>
              <Text style={styles.title}>Default Modal</Text>
              <Text style={styles.body}>You can pass custom content here.</Text>
              <Pressable style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});
