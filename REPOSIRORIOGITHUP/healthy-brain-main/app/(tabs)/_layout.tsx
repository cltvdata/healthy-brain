import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/AppStyles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.primaryOrange,
        tabBarInactiveTintColor: AppColors.textGray,
        tabBarStyle: {
          backgroundColor: AppColors.surfaceDark,
          borderTopColor: AppColors.borderGlass,
          paddingBottom: 5,
        },
        headerStyle: {
          backgroundColor: AppColors.backgroundDark,
        },
        headerTintColor: AppColors.textWhite,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="entrenar"
        options={{
          title: 'Entrenar',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="barbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="stats-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="descanso"
        options={{
          title: 'Descanso',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="moon" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ejercicios"
        options={{
          title: 'Ejercicios',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="library" color={color} />,
        }}
      />
    </Tabs>
  );
}
