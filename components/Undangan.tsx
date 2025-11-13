import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Undangan = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Halaman Undangan</Text>
    <Text>Selamat datang di halaman undangan aplikasi mobile Expo!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default Undangan;
