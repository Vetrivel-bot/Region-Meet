import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSegments } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import MyTotallyCustomHeaderBar from './HeaderBar'; // your header UI

export default function PersistentHeader() {
  const segments = useSegments();
  const navigation = useNavigation(); // provide navigation to the header
  const progress = useRef(new Animated.Value(0)).current;

  // animate when segments change (use joined string so effect runs only when path changes)
  useEffect(() => {
    // small bounce/pulse animation
    const anim = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    anim.start();
    // cleanup in case component unmounts while anim running
    return () => anim.stop();
  }, [segments.join('/') /* runs only when route path changes */, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }], opacity }]}>
      {/* pass navigation into header so it can call canGoBack / back */}
      <MyTotallyCustomHeaderBar navigation={navigation} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 999,
    elevation: 50,
  },
});
