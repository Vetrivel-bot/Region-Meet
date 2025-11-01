import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CustomHeaderLogo({
  onMenuPress = () => {},
  onLogoPress = () => {},
  onSearchPress = () => {},
  onBellPress = () => {},
  onProfilePress = () => {},
  logoSource = require('@/assets/favicon.png'),
  logoWidth = 120,
  logoHeight = 40,
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left: Hamburger / menu */}
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.leftButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="menu" size={26} />
        </TouchableOpacity>

        {/* Center: Logo */}
        <TouchableOpacity onPress={onLogoPress} activeOpacity={0.8} style={styles.logoWrapper}>
          <Image
            source={logoSource}
            style={[styles.logo, { width: logoWidth, height: logoHeight }]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right: Icons */}
        <View style={styles.rightGroup}>
          <TouchableOpacity
            onPress={onSearchPress}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="search" size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBellPress}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="notifications-outline" size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.profileButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {/* Example circular avatar placeholder — replace with real avatar if available */}
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>VS</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  leftButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // width/height controlled via props
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    marginLeft: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
