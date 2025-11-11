import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Linking, // Import Linking
  Platform, // Import Platform
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

// Import your API functions
import { LocationAPI } from '@/services/api'; // ⚠️ Check this path!

// --- IMPORT THEME ---
import { theme } from '@/theme/theme'; // ⚠️ Check this path!

// --- HELPER FUNCTIONS ---

const formatEventDate = (dateString) => {
  if (!dateString) return 'Date not available';
  try {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString(undefined, options);
  } catch (e) {
    return dateString;
  }
};

const getEventDay = (dateString) => {
  if (!dateString) return '?';
  try {
    return new Date(dateString).getDate().toString();
  } catch (e) {
    return '?';
  }
};

// --- QUERY FUNCTION FOR USER LOCATION ---
const fetchUserLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
};

// --- OPTIMIZATION: Custom Pin Component ---
const CustomMapPin = React.memo(({ type, day, isNextEvent }) => {
  let pinStyleKey = 'defaultPin';
  let iconContent = <Text style={styles.pinText}>{day}</Text>;

  if (type === 'star') {
    pinStyleKey = 'starPin';
    iconContent = <Ionicons name="star" size={16} color="#FFFFFF" />;
  } else if (isNextEvent) {
    pinStyleKey = 'nextEventPin';
  }

  const pinStyle = styles[pinStyleKey];

  return (
    <View style={styles.pinContainer}>
      <View style={[styles.pinContent, pinStyle.content]}>{iconContent}</View>
      <View style={[styles.pinTriangle, pinStyle.triangle]} />
    </View>
  );
});

// --- UPDATED OVERLAY CARD COMPONENT ---
const LocationCard = ({ location, onClose }) => {
  const isRegistered = location.type === 'registered';

  const onNavigate = () => {
    const { latitude, longitude, name } = location;
    if (!latitude || !longitude) {
      console.error('Navigation error: Missing coordinates');
      // In a real app, you might show a user-friendly error
      return;
    }

    // Create a platform-specific URL
    const scheme = Platform.select({ ios: 'maps://?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(name); // URL-encode the name for the query

    let url = '';
    if (Platform.OS === 'ios') {
      // Apple Maps URL format
      url = `maps://?ll=${latLng}&q=${label}`;
    } else {
      // Google Maps (Android) URL format
      url = `geo:${latLng}?q=${latLng}(${label})`;
    }

    // Attempt to open the URL
    Linking.openURL(url).catch((err) => console.error('An error occurred opening maps', err));
  };

  return (
    <View style={styles.cardContainer}>
      {/* Navigation Button */}
      <TouchableOpacity style={styles.cardNavButton} onPress={onNavigate}>
        <Ionicons name="navigate-circle-outline" size={28} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Close Button */}
      <TouchableOpacity style={styles.cardCloseButton} onPress={onClose}>
        <Ionicons name="close-circle" size={28} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {location.name}
      </Text>
      <Text style={styles.cardAddress} numberOfLines={2}>
        {location.address}
      </Text>

      {isRegistered ? (
        <>
          <Text style={styles.cardSectionTitle}>Your Schedule:</Text>
          <Text style={styles.cardDate}>{formatEventDate(location.eventDate)}</Text>
          <Text style={styles.cardInfo}>
            {location.isNextEvent
              ? `This is your next event (#${location.number})`
              : `This is your scheduled event #${location.number}`}
          </Text>
        </>
      ) : (
        <Text style={styles.cardInfo}>(Available Location)</Text>
      )}
    </View>
  );
};

// --- MAP SCREEN COMPONENT ---
export default function MapScreen() {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // State for the card

  // 1. CACHE MAP DATA (from your API)
  const {
    data: mapData,
    isLoading: isMapDataLoading,
    error: mapDataError,
  } = useQuery({
    queryKey: ['mapInfo'],
    queryFn: LocationAPI.getMapInfo,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // 2. CACHE USER LOCATION
  const { data: userLocation, error: locationError } = useQuery({
    queryKey: ['userLocation'],
    queryFn: fetchUserLocation,
    staleTime: 1000 * 60, // 1 minute
  });

  // --- Zoom to user location when data arrives ---
  useEffect(() => {
    if (userLocation && mapRef.current && !selectedLocation) {
      const { latitude, longitude } = userLocation.coords;
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  }, [userLocation, selectedLocation]);

  // --- NEW MARKER PRESS HANDLER ---
  const onMarkerPress = (locationData) => {
    // 1. Set the selected location to show the card
    setSelectedLocation(locationData);

    // 2. Animate the map to zoom out and center
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        600 // 600ms animation
      );
    }
  };

  // --- NEW ZOOM HANDLERS ---
  const handleZoomIn = async () => {
    if (mapRef.current) {
      try {
        const camera = await mapRef.current.getCamera();
        camera.zoom += 1;
        mapRef.current.animateCamera(camera, { duration: 250 });
      } catch (e) {
        console.error('Error zooming in: ', e);
      }
    }
  };

  const handleZoomOut = async () => {
    if (mapRef.current) {
      try {
        const camera = await mapRef.current.getCamera();
        camera.zoom -= 1;
        mapRef.current.animateCamera(camera, { duration: 250 });
      } catch (e) {
        console.error('Error zooming out: ', e);
      }
    }
  };

  // 3. Stabilize the marker array
  const memoizedMarkers = useMemo(() => {
    if (!mapData) return [];

    const { allLocations, registeredSchedule } = mapData;

    const registeredIds = new Set(registeredSchedule.map((reg) => reg.eventLocation._id));

    // --- Create STAR markers ---
    const starMarkers = allLocations
      .filter((loc) => !registeredIds.has(loc._id))
      .map((loc) => {
        const [longitude, latitude] = loc.location.coordinates;
        // Pass coordinates into locationData
        const locationData = {
          type: 'available',
          name: loc.name,
          address: loc.address,
          latitude: latitude, // Add latitude
          longitude: longitude, // Add longitude
        };
        return (
          <Marker
            key={`star-${loc._id}`}
            coordinate={{ latitude, longitude }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => onMarkerPress(locationData)}>
            <CustomMapPin type="star" />
          </Marker>
        );
      });

    // --- Create NUMBERED markers ---
    const registeredMarkers = registeredSchedule.map((reg, index) => {
      const { eventLocation, eventDate } = reg;
      const [longitude, latitude] = eventLocation.location.coordinates;
      const isNextEvent = index === 0;
      const day = getEventDay(eventDate);
      const number = index + 1;

      // Pass coordinates into locationData
      const locationData = {
        type: 'registered',
        name: eventLocation.name,
        address: eventLocation.address,
        eventDate: eventDate,
        number: number,
        isNextEvent: isNextEvent,
        latitude: latitude, // Add latitude
        longitude: longitude, // Add longitude
      };

      return (
        <Marker
          key={`reg-${reg._id}`}
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 1 }}
          zIndex={isNextEvent ? 100 : 1}
          onPress={() => onMarkerPress(locationData)}>
          <CustomMapPin type="number" day={day} isNextEvent={isNextEvent} />
        </Marker>
      );
    });

    return [...starMarkers, ...registeredMarkers];
  }, [mapData]);

  // --- Helper for loading and error display ---
  const loading = isMapDataLoading;
  const finalError = mapDataError || locationError;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.paragraph}>Loading map data...</Text>
      </View>
    );
  }

  if (finalError) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Error: {finalError.message}</Text>
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
        showsUserLocation={true}
        onPress={() => setSelectedLocation(null)}
        onTouchStart={() => {
          if (selectedLocation) {
            // ...
          }
        }}>
        {memoizedMarkers}
      </MapView>

      {/* --- NEW ZOOM CONTROLS --- */}
      <View style={styles.zoomControlsContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Ionicons name="add" size={26} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.zoomSeparator} />
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Ionicons name="remove" size={26} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {/* --- END ZOOM CONTROLS --- */}

      {/* --- RENDER THE CARD --- */}
      {selectedLocation && (
        <LocationCard location={selectedLocation} onClose={() => setSelectedLocation(null)} />
      )}
    </View>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // --- Pin Styles ---
  pinContainer: {
    width: 30,
    height: 38,
    alignItems: 'center',
  },
  pinContent: {
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pinText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nextEventPin: {
    content: {
      backgroundColor: '#D00000',
      borderColor: '#FFF',
      borderWidth: 1.5,
    },
    triangle: {
      borderTopColor: '#D00000',
    },
  },
  defaultPin: {
    content: {
      backgroundColor: '#007AFF',
      borderColor: '#FFF',
      borderWidth: 1.5,
    },
    triangle: {
      borderTopColor: '#007AFF',
    },
  },
  starPin: {
    content: {
      backgroundColor: '#FFC700',
      borderColor: '#FFF',
      borderWidth: 1.5,
    },
    triangle: {
      borderTopColor: '#FFC700',
    },
  },

  // --- NEW ZOOM CONTROLS STYLES ---
  zoomControlsContainer: {
    position: 'absolute',
    right: 15,
    top: '40%',
    transform: [{ translateY: -50 }], // This helps center it vertically
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    borderColor: theme.colors.glassBorder,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    overflow: 'hidden', // Ensures the border radius clips the separator
  },
  zoomButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomSeparator: {
    height: 1,
    backgroundColor: theme.colors.glassBorder,
    width: '80%',
    alignSelf: 'center',
  },

  // --- THEMED CARD STYLES ---
  cardContainer: {
    position: 'absolute',
    bottom: 100,
    left: 15,
    right: 15,
    backgroundColor: theme.colors.surface, // Themed
    borderRadius: theme.borderRadius.medium, // Themed
    padding: theme.spacing.medium, // Themed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, // Darker shadow for dark bg
    shadowRadius: 6,
    elevation: 10,
    borderColor: theme.colors.glassBorder, // Themed
    borderWidth: 1,
  },
  cardNavButton: {
    position: 'absolute',
    top: 8,
    right: 44, // Positioned next to close button
    padding: 4,
    zIndex: 1,
  },
  cardCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.textPrimary, // Themed
    maxWidth: '80%', // Ensure title doesn't overlap buttons
  },
  cardAddress: {
    fontSize: 14,
    color: theme.colors.textSecondary, // Themed
    marginBottom: 10,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary, // Themed
    marginTop: 8,
  },
  cardDate: {
    fontSize: 14,
    color: theme.colors.primary, // Themed
    fontWeight: '500',
    marginVertical: 4,
  },
  cardInfo: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.textSecondary, // Themed
    marginTop: 4,
  },
});
