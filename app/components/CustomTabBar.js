// components/CustomTabBar.js
import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();

  // Responsive metrics (clamped)
  const horizontalPadding = Math.min(24, Math.max(12, width * 0.03));
  const safeLeftRight = horizontalPadding;
  const barHeight = Math.min(110, Math.max(72, width * 0.18));
  const containerHeight = Math.min(84, Math.max(56, width * 0.12));
  const ctaSize = Math.min(96, Math.max(60, width * 0.18));
  const ctaInnerSize = Math.round(ctaSize * 0.72);
  const iconWrapperSize = Math.min(64, Math.max(44, width * 0.14));
  const iconElevSize = Math.round(iconWrapperSize * 0.78);
  const ringSizePct = '78%';
  const ctaBottomOffset = Math.round(barHeight * 0);

  // animations: one Animated.Value per route
  const scales = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const pressIn = (i) =>
    Animated.spring(scales[i], {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  const pressOut = (i) =>
    Animated.spring(scales[i], {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

  const handleCTAPress = () => {
    const exists = state.routes.find(
      (r) => r.name.toLowerCase() === 'qrscreen' || r.name.toLowerCase() === 'scan'
    );
    if (exists) navigation.navigate(exists.name);
    else navigation.navigate(state.routes[Math.floor(state.routes.length / 2)].name);
  };

  // dynamic styles using computed sizes
  const dynamicStyles = {
    safe: {
      position: 'absolute',
      left: safeLeftRight,
      right: safeLeftRight,
      bottom: Math.max(12, safeLeftRight),
      height: barHeight,
      zIndex: 200,
      borderRadius: 999,
      overflow: 'visible',
    },
    blur: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.09)',
      shadowColor: '#000',
      shadowOpacity: 0.34,
      shadowOffset: { width: 0, height: 18 },
      shadowRadius: 28,
      elevation: 18,
      overflow: 'hidden',
    },
    container: {
      flexDirection: 'row',
      height: containerHeight,
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: Math.round(horizontalPadding * 0.5),
      marginTop: Math.round(barHeight * 0.16),
    },
    iconWrapper: {
      width: iconWrapperSize,
      height: iconWrapperSize,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    iconElev: {
      width: iconElevSize,
      height: iconElevSize,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(10,40,90,0.72)',
      shadowColor: '#000',
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      elevation: 6,
    },
    ctaWrapper: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: ctaBottomOffset,
      zIndex: 220,
      alignItems: 'center',
    },
    ctaButton: {
      width: ctaSize,
      height: ctaSize,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.34,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 28,
      elevation: 26,
    },
    ctaGradient: {
      width: Math.round(ctaSize * 0.92),
      height: Math.round(ctaSize * 0.92),
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    ctaInnerRing: {
      width: ctaInnerSize,
      height: ctaInnerSize,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(10,40,90,0.92)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
    },
  };

  // Layout helper: split into left/right with center spacer for CTA
  const total = state.routes.length;
  const half = Math.floor(total / 2);
  const left = state.routes.slice(0, half);
  const right = state.routes.slice(half);
  const spacerWidth = Math.round(ctaSize * 0.9);

  const renderTab = (route, index) => {
    const focused = state.index === index;
    const rn = route.name.toLowerCase();

    let iconName = 'ellipse';
    if (rn.includes('home') || rn.includes('(home)')) iconName = focused ? 'home' : 'home-outline';
    else if (rn.includes('search')) iconName = focused ? 'search' : 'search-outline';
    else if (rn.includes('profile')) iconName = focused ? 'person' : 'person-outline';
    else if (rn.includes('settings')) iconName = focused ? 'settings' : 'settings-outline';

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <TouchableOpacity
        key={route.key}
        activeOpacity={0.95}
        onPressIn={() => pressIn(index)}
        onPressOut={() => pressOut(index)}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={route.name}
        style={styles.tabButton}>
        <Animated.View style={[dynamicStyles.iconWrapper, { transform: [{ scale: scales[index] }] }]}>
          <View
            style={[
              styles.iconRing,
              focused && styles.iconRingActive,
              { width: ringSizePct, height: ringSizePct },
            ]}
          />
          <View style={[dynamicStyles.iconElev, focused && styles.iconElevActive]}>
            <Ionicons
              name={iconName}
              size={Math.round(iconElevSize * 0.48)}
              color={focused ? '#fff' : 'rgba(255,255,255,0.88)'}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={dynamicStyles.safe}>
      <BlurView intensity={70} tint="default" style={dynamicStyles.blur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.035)', 'rgba(255,255,255,0.01)']}
          start={[0, 0]}
          end={[1, 1]}
          style={StyleSheet.absoluteFill}
        />
      </BlurView>

      <View pointerEvents="none" style={styles.innerRim} />

      {/* CTA (central FAB) */}
      <View style={dynamicStyles.ctaWrapper} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.94}
          onPress={handleCTAPress}
          accessibilityRole="button"
          accessibilityLabel="Scan QR"
          style={dynamicStyles.ctaButton}>
          <LinearGradient
            colors={['#728aceff', '#0b173aff']}
            start={[0, 0]}
            end={[1, 1]}
            style={dynamicStyles.ctaGradient}>
            <View style={dynamicStyles.ctaInnerRing}>
              <Ionicons name="qr-code" size={Math.round(ctaInnerSize * 0.48)} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Tabs row with central spacer */}
      <View style={dynamicStyles.container}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
          {left.map((r, i) => renderTab(r, i))}
        </View>

        <View style={{ width: spacerWidth }} pointerEvents="none" />

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
          {right.map((r, i) => renderTab(r, i + half))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerRim: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 6,
    bottom: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  iconRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    opacity: 0.95,
  },
  iconRingActive: {
    borderColor: 'rgba(255,255,255,0.18)',
  },
  iconElevActive: {
    backgroundColor: 'rgba(10,40,90,0.95)',
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.36,
    shadowOffset: { width: 0, height: 12 },
  },
});
