import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This effect runs once when the component mounts
    (async () => {
      // 1. Ask for permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // If permission is granted, you could get location here,
      // but we'll do it in a button press
      console.log('Permission granted!');
    })();
  }, []); // The empty array [] means this effect runs only once

  const getLocation = async () => {
    if (errorMsg) {
      setErrorMsg(null); // Clear previous errors
    }
    setLoading(true);
    setLocation(null); // Clear previous location

    try {
      // 2. Get the current location
      // You can adjust accuracy as needed
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Use Balanced for good battery life
      });
      setLocation(currentLocation);
    } catch (error) {
      setErrorMsg('Error fetching location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to display content
  let text = 'Press the button to get your location.';
  if (loading) {
    text = 'Fetching location...';
  } else if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
      {loading && <ActivityIndicator size="large" />}
      <Button title="Get My Location" onPress={getLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
