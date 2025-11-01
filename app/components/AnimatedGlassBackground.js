import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from 'styled-components/native';

const { width, height } = Dimensions.get('window');

export default function StaticGlassBackground({
  children = null,
  tint = 'dark',
  intensity,
  pointerEvents = 'none',
}) {
  const theme = useTheme?.() ?? {
    colors: {
      primary: '#0033A0',
      accent: '#FFAB00',
      error: '#D50000',
      surface: 'rgba(18,18,20,0.55)',
      glassBorder: 'rgba(255,255,255,0.06)',
    },
  };

  const surface = theme.colors?.surface ?? 'rgba(18,18,20,0.55)';
  const glassBorder = theme.colors?.glassBorder ?? 'rgba(255,255,255,0.06)';
  const defaultIntensity =
    typeof intensity === 'number' ? intensity : Platform.OS === 'android' ? 14 : 28;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={pointerEvents}>
      {/* 👇 Add a pure black base layer so background never shows through */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.92)' }, // deep black with subtle transparency
        ]}
      />

      {/* Static blobs under the glass */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { left: -width * 0.08, top: -height * 0.12, opacity: 0.95 }]}>
          <LinearGradient
            colors={[theme.colors.primary, 'transparent']}
            start={[0, 0]}
            end={[1, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View
          style={[
            styles.blobLarge,
            { right: -width * 0.14, bottom: -height * 0.18, opacity: 0.6 },
          ]}>
          <LinearGradient
            colors={[theme.colors.accent, 'transparent']}
            start={[1, 0]}
            end={[0, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View
          style={[styles.blobSubtle, { right: -width * 0.3, top: height * 0.25, opacity: 0.08 }]}>
          <LinearGradient
            colors={[theme.colors.error, 'transparent']}
            start={[0, 0]}
            end={[1, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>

      {/* Frosted glass layer */}
      <BlurView
        style={styles.glassWrapper}
        tint={tint}
        intensity={defaultIntensity}
        collapsable={false}>
        <View
          style={[styles.glassOverlay, { backgroundColor: surface, borderColor: glassBorder }]}
        />
        <View style={styles.glassContent}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: width * 1.2,
    height: height * 0.75,
    borderRadius: (width * 1.2) / 2,
    overflow: 'hidden',
  },
  blobLarge: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 0.9,
    borderRadius: (width * 1.5) / 2,
    overflow: 'hidden',
  },
  blobSubtle: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: (width * 0.9) / 2,
    overflow: 'hidden',
  },
  glassWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 0,
  },
  glassContent: {
    ...StyleSheet.absoluteFillObject,
  },
});
