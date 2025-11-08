import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

// Your event data (unchanged)
const FAKE_EVENT_DATA = [
  {
    id: 'evt1',
    title: 'Tech Summit 2025',
    city: 'Mumbai, Maharashtra',
    coords: { latitude: 19.076, longitude: 72.8777 },
  },
  {
    id: 'evt2',
    title: 'National Developer Meetup',
    city: 'New Delhi, Delhi',
    coords: { latitude: 28.7041, longitude: 77.1025 },
  },
  {
    id: 'evt3',
    title: 'React India Conference',
    city: 'Bangalore, Karnataka',
    coords: { latitude: 12.9716, longitude: 77.5946 },
  },
  {
    id: 'evt4',
    title: 'Startup Expo',
    city: 'Chennai, Tamil Nadu',
    coords: { latitude: 13.0827, longitude: 80.2707 },
  },
];

// The ID of your special event
const SPECIAL_EVENT_ID = 'evt3';

export default function App() {
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);

  useEffect(() => {
    // ... (Your existing useEffect logic is perfect) ...
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }
      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      } catch (error) {
        console.warn('Could not get user location: ' + error.message);
      }
      setEvents(FAKE_EVENT_DATA);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.paragraph}>Finding your location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
        showsUserLocation={true}>
        {events.map((event) => {
          const isSpecial = event.id === SPECIAL_EVENT_ID;

          return (
            <Marker
              key={event.id}
              coordinate={event.coords}
              title={event.title}
              description={event.city}
              anchor={{ x: 0.5, y: 1 }} // Keep anchor at bottom-center
            >
              {/* --- Custom Pin Component --- */}
              <View style={styles.pinContainer}>
                {/* Conditional rendering: Star or Text */}
                {isSpecial ? (
                  // --- Special Event: Star ---
                  <View style={[styles.pinContent, styles.specialPinContent]}>
                    {/* --- 1. Smaller Icon Size --- */}
                    <Ionicons name="star" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  // --- Default Event: Text ---
                  <View style={[styles.pinContent, styles.defaultPinContent]}>
                    <Text style={styles.pinText}>{event.id.replace('evt', '')}</Text>
                  </View>
                )}

                {/* The triangle at the bottom */}
                <View
                  style={[
                    styles.pinTriangle,
                    isSpecial ? styles.specialPinTriangle : styles.defaultPinTriangle,
                  ]}
                />
              </View>
              {/* --- End Custom Pin Component --- */}
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

// --- 2. Styles Updated for "Sleek" Look ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    padding: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // --- Styles for the Custom Pin ---
  pinContainer: {
    width: 30, // Pin width (was 40)
    height: 38, // Total height (30 content + 8 triangle)
    alignItems: 'center',
  },
  pinContent: {
    width: 30, // Content size (was 40)
    height: 30, // Content size (was 40)
    borderRadius: 15, // Half of width/height (was 20)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Smaller shadow
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4, // Smaller elevation
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8, // Height of the triangle (was 10)
    borderLeftWidth: 5, // Half-width (was 7)
    borderLeftColor: 'transparent',
    borderRightWidth: 5, // Half-width (was 7)
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // -- Styles for the Special Event Pin --
  specialPinContent: {
    backgroundColor: '#FFC700', // Gold background
    borderColor: '#FFF',
    borderWidth: 1.5, // Thinner border (was 2)
  },
  specialPinTriangle: {
    borderTopColor: '#FFC700', // Gold triangle
  },

  // -- Styles for the Default Event Pin --
  defaultPinContent: {
    backgroundColor: '#007AFF', // Blue background
    borderColor: '#FFF',
    borderWidth: 1.5, // Thinner border (was 2)
  },
  defaultPinTriangle: {
    borderTopColor: '#007AFF', // Blue triangle
  },
  pinText: {
    color: 'white',
    fontSize: 12, // Smaller font (was 16)
    fontWeight: 'bold',
  },
});
