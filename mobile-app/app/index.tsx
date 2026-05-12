import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HEALTHY + BRAIN</Text>
      <Text style={styles.subtext}>App works!</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>IR AL LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#ff8a00', marginTop: 20 }]}
        onPress={() => router.push('/micro-intervenciones')}
      >
        <Text style={styles.buttonText}>MICRO-HÁBITOS (IA)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ff8a00',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtext: {
    color: 'white',
    marginTop: 20,
  },
  button: {
    marginTop: 40,
    backgroundColor: '#00d1ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});