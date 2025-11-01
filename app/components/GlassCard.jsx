// components/GlassCard.jsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from 'styled-components/native';

export default function GlassCard({
  children,
  style,
  tint = 'dark',
  intensity, // optional override
  pointerEvents = 'auto', // default behavior
}) {
  const theme = useTheme?.() ?? {};
  const surface = theme.colors?.surface ?? 'rgba(18,18,20,0.55)';
  const glassBorder = theme.colors?.glassBorder ?? 'rgba(255,255,255,0.06)';

  // animation
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
  }, [a]);

  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] });
  const opacity = a;

  // choose a safe default blur intensity (lower on Android)
  const defaultIntensity =
    typeof intensity === 'number' ? intensity : Platform.OS === 'android' ? 16 : 28;

  return (
    <Animated.View
      // merge incoming style first so absoluteFill is respected
      style={[style, { transform: [{ scale }], opacity }]}
      pointerEvents={pointerEvents}>
      <BlurView
        style={[styles.wrapper, { borderRadius: style?.borderRadius ?? 12 }]}
        tint={tint}
        intensity={defaultIntensity}>
        {/* overlay: tint color (semi-transparent) + border */}
        <View style={[styles.overlay, { backgroundColor: surface, borderColor: glassBorder }]} />

        {/* content placed above the overlay */}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 12,
  },
  content: {
    padding: 14,
  },
});
