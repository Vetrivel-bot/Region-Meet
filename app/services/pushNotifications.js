import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'; // To get the project ID

/**
 * Sets how foreground notifications are handled (e.g., show an alert).
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the app for push notifications and returns the ExpoPushToken.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  // 1. Check if we are on a physical device
  if (!Device.isDevice) {
    alert('Must use a physical device for Push Notifications');
    return null;
  }

  // 2. Request Notification Permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token! Notification permissions were denied.');
    return null;
  }

  // 3. Set up Android Notification Channel (mandatory for Android 8.0+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0033A0', // Your IIC Primary Color
    });
  }

  // 4. Get the Expo Push Token
  try {
    // Get the Project ID from your app.json/app.config.js
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      throw new Error(
        'EAS projectId not found in app.json/app.config.js. Make sure you have run "eas init"'
      );
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Your Expo Push Token:', token);
  } catch (e) {
    console.error('Error getting Expo Push Token:', e);
    return null;
  }

  return token;
}
