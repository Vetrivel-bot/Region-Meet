import React, { forwardRef, useState } from 'react';
import { Text, TouchableOpacity, View, Animated, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export const Button = forwardRef(({ title, className, onPress, ...props }, ref) => {
  const [pressed, setPressed] = useState(false);
  const scale = pressed ? 0.985 : 1;
  const translateY = pressed ? 2 : 0;

  // common shadow for iOS & Android (Android uses elevation)
  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 20,
    },
    android: {
      elevation: 8,
    },
  });

  return (
    <TouchableOpacity
      ref={ref}
      activeOpacity={0.9}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      {...props}
      accessibilityRole="button"
      className={`flex-row items-center justify-between overflow-hidden rounded-full ${className || ''}`}
      style={[
        {
          transform: [{ scale }, { translateY }],
        },
        shadowStyle,
      ]}>
      {/* Frosted glass layer */}
      <BlurView
        intensity={60}
        tint="default"
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      />

      {/* Subtle outer border / glass rim */}
      <View
        pointerEvents="none"
        className="absolute inset-0 rounded-full"
        style={{
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      />

      {/* Left spacer to keep symmetry */}
      <View className="w-14" />

      {/* Title */}
      <Text
        className="text-lg font-bold text-white"
        style={{
          textShadowColor: 'rgba(0,0,0,0.35)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}>
        {title}
      </Text>

      {/* 3D round action / icon */}
      <View className="pl-2 pr-2">
        <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
          {/* decorative ring */}
          <View
            style={{
              position: 'absolute',
              width: '82%',
              height: '82%',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
              opacity: 0.95,
            }}
          />

          {/* elevated circle with gradient */}
          <LinearGradient
            // fallback: replace LinearGradient with a View if not installed
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              // inner shadow-ish lift
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
              elevation: 6,
              backgroundColor: 'rgba(10,40,90,0.85)', // base color for very slight tint
            }}>
            <Feather name="arrow-right" size={20} color="white" />
          </LinearGradient>

          {/* tiny glossy highlight */}
          <View
            style={{
              position: 'absolute',
              left: 6,
              top: 6,
              width: 14,
              height: 8,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';
