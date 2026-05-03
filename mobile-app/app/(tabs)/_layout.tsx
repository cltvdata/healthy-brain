import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/AppStyles';
import { Animated, Platform } from 'react-native';

const AnimatedIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons size={24} name={name} color={color} />
    </Animated.View>
  );
};

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
          tabBarIcon: ({ color, focused }) => <AnimatedIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="entrenar"
        options={{
          title: 'Entrenar',
          tabBarIcon: ({ color, focused }) => <AnimatedIcon name="barbell" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => <AnimatedIcon name="stats-chart" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="descanso"
        options={{
          title: 'Descanso',
          tabBarIcon: ({ color, focused }) => <AnimatedIcon name="moon" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ejercicios"
        options={{
          title: 'Ejercicios',
          tabBarIcon: ({ color, focused }) => <AnimatedIcon name="library" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="nutricion-ia"
        options={{
          title: 'IA Comida',
          tabBarIcon: ({ color, focused }) => <AnimatedIcon name="camera" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
