import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

const App = () => {
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    requestUserPermission();
    const requestToken = async () => {
      const token = await messaging().getToken();
      setFcmToken(token);
    };

    requestToken();

    // Listen for token refresh (optional)
    const unsubscribe = messaging().onTokenRefresh(requestToken);

    return unsubscribe;
  }, []);

  return <View>{fcmToken && <Text>Device Token: {fcmToken}</Text>}</View>;
};

export default App;
