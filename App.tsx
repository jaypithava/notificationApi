import React, {useState, useEffect} from 'react';
import {View, Button, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';

const App = () => {
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    const requestUserPermission = async () => {
      try {
        await messaging().requestPermission();
        const token = await messaging().getToken();
        setDeviceToken(token);
        console.log('Device token:', token);

        // Handle foreground notifications
        messaging().onMessage(async remoteMessage => {
          console.log('Foreground notification:', remoteMessage);
          PushNotification.localNotification({
            title: remoteMessage.notification.title || 'Notification',
            message: remoteMessage.notification.body || 'Notification body',
          });
        });
      } catch (error) {
        console.error('Error getting device token:', error);
      }
    };

    requestUserPermission();
  }, []);

  const sendNotification = async notificationData => {
    try {
      // FCM endpoint URL
      const apiUrl = 'https://fcm.googleapis.com/fcm/send';

      const headers = {
        'Content-Type': 'application/json',
        Authorization:
          'key=AAAA7SZ-H4U:APA91bGEZDV2tCsN4u4yU1PfwzO2AtWBd4CEAON3SiS78c10DP0PbIXWdEiWXfpPg1eos6JiR6EDu0fje1jVj_t0HYy_CMk6UYOj0uxVy4Wz_rwY7lcBlwrU7XSExxd7U65Rp9VdovS4', // Replace YOUR_SERVER_KEY with your actual FCM server key
      };

      const data = {
        to: notificationData.to,
        notification: {
          title: notificationData.title,
          body: notificationData.body,
        },
        data: notificationData.customData,
      };

      const response = await axios.post(apiUrl, data, {headers});

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
      to: deviceToken,
      title: 'New Message',
      body: 'You have a new message!',
      customData: {
        sender: 'John Doe',
        message: 'Hello from React Native!',
      },
    };
    sendNotification(notificationData);
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Send Notification" onPress={handleSendNotification} />
    </View>
  );
};

export default App;
