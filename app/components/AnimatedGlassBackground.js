import React from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
// 1. Import your theme file directly
import { theme } from '@/theme/theme'; // Adjust path if needed

const { width, height } = Dimensions.get('window');

export default function StaticGlassBackground({
  children = null,
  tint = 'dark',
  intensity,
  pointerEvents = 'none',
}) {
  // 2. Use theme colors directly
  const surface = theme.colors?.surface ?? 'rgba(18,18,20,0.55)';
  const glassBorder = theme.colors?.glassBorder ?? 'rgba(255,255,255,0.06)';

  // 3. Intensity logic remains the same
  const defaultIntensity =
    typeof intensity === 'number' ? intensity : Platform.OS === 'android' ? 14 : 28;

  return (
    // Use className for styling
    <View className="absolute inset-0" pointerEvents={pointerEvents}>
      {/* 👇 Add a pure black base layer */}
      <View
        className="absolute inset-0 bg-black/90" // bg-black/90 is tailwind for black with 90% opacity
      />

      {/* Static blobs under the glass */}
      <View pointerEvents="none" className="absolute inset-0">
        {/* Blob 1 */}
        <View
          className="absolute -left-[8vw] -top-[12vh] h-[75vh] w-[120vw] 
                     overflow-hidden rounded-full opacity-95">
          <LinearGradient
            colors={[theme.colors.primary, 'transparent']}
            start={[0, 0]}
            end={[1, 1]}
            className="absolute inset-0"
          />
        </View>

        {/* Blob 2 */}
        <View
          className="absolute -bottom-[18vh] -right-[14vw] h-[90vh] w-[150vw] 
                     overflow-hidden rounded-full opacity-60">
          <LinearGradient
            colors={[theme.colors.accent, 'transparent']}
            start={[1, 0]}
            end={[0, 1]}
            className="absolute inset-0"
          />
        </View>

        {/* Blob 3 */}
        <View
          className="absolute -right-[30vw] top-[25vh] h-[60vh] w-[90vw] 
                     overflow-hidden rounded-full opacity-[0.08]">
          <LinearGradient
            colors={[theme.colors.error, 'transparent']}
            start={[0, 0]}
            end={[1, 1]}
            className="absolute inset-0"
          />
        </View>
      </View>

      {/* Frosted glass layer */}
      <BlurView
        className="absolute inset-0 overflow-hidden"
        tint={tint}
        intensity={defaultIntensity}
        collapsable={false}>
        {/* Assumes 'surface' and 'glassBorder' are defined in your tailwind.config.js */}
        <View className="border-glassBorder bg-surface absolute inset-0 border" />
        <View className="absolute inset-0">{children}</View>
      </BlurView>
    </View>
  );
}
