import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSegments } from 'expo-router';
import MyTotallyCustomHeaderBar from './HeaderBar';

export default function PersistentHeader() {
  const segments = useSegments();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [segments.join('/'), progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }], opacity }]}>
      <MyTotallyCustomHeaderBar />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 999,
    elevation: 50,
  },
});
