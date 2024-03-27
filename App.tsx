import React, {useEffect, useState} from 'react';
import {View, Button, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';

const App = () => {
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    // Request permission for notifications and get the device token
    const requestUserPermission = async () => {
      try {
        await messaging().requestPermission();
        const token = await messaging().getToken();
        setDeviceToken(token);
        console.log('Device token:', token);

        // Handle foreground notifications
        messaging().onMessage(async remoteMessage => {
          console.log('Foreground notification:', remoteMessage);
          // Check if remoteMessage.notification exists before accessing its properties
          if (remoteMessage.notification) {
            PushNotification.localNotification({
              title: remoteMessage.notification.title || 'Notification',
              message: remoteMessage.notification.body || 'Notification body',
            });
          } else {
            // Handle the case where remoteMessage.notification is undefined
            console.warn(
              'Foreground notification received without notification payload:',
              remoteMessage,
            );
          }
        });
      } catch (error) {
        console.error('Error getting device token:', error);
      }
    };

    requestUserPermission();
  }, []);

  const sendNotification = async (notificationData: {
    to: any;
    title: any;
    body: any;
    customData: any;
  }) => {
    try {
      // FCM endpoint URL
      const apiUrl = 'https://fcm.googleapis.com/fcm/send';

      // Authorization header with your FCM server key
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'key=YOUR_SERVER_KEY', // Replace YOUR_SERVER_KEY with your actual FCM server key
      };

      // Payload for the notification
      const data = {
        to: notificationData.to, // Device token or topic to send the notification
        notification: {
          title: notificationData.title,
          body: notificationData.body,
        },
        data: notificationData.customData, // Optional custom data to include in the notification
      };

      // Make the POST request to FCM API
      const response = await axios.post(apiUrl, data, {headers});

      // Log the relevant information from the response
      console.log('Notification response:', {
        multicast_id: response.data.multicast_id,
        success: response.data.success,
        failure: response.data.failure,
        canonical_ids: response.data.canonical_ids,
        results: response.data.results,
      });

      // Handle success/failure status as needed
      if (response.data.success === 1) {
        Alert.alert('Success', 'Notification sent successfully.');
      } else {
        Alert.alert('Error', 'Failed to send notification.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleSendNotification = () => {
    if (!deviceToken) {
      Alert.alert(
        'Error',
        'Device token not available. Make sure you have permission for notifications.',
      );
      return;
    }

    const notificationData = {
      to: deviceToken, // Use the device token obtained from Firebase Messaging
      title: 'New Message',
      body: 'You have a new message!',
      customData: {
        // Optional custom data to include in the notification
        sender: 'John Doe',
        message: 'Hello from React Native!',
      },
    };

    // Call the sendNotification function with the notification data
    sendNotification(notificationData);
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Send Notification" onPress={handleSendNotification} />
    </View>
  );
};

export default App;
