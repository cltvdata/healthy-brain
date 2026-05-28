import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="compass-outline" size={64} color="#ff8a00" />
      <Text style={styles.title}>Ruta no encontrada</Text>
      <Text style={styles.subtitle}>Esta sección aún no está disponible</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>VOLVER AL INICIO</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 10, textAlign: 'center' },
  button: { marginTop: 40, backgroundColor: '#ff8a00', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
})
