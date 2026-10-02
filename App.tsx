// App.js
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import MainStackNavigator from './src/navigation/MainStackNavigator';
import { MenuProvider } from 'react-native-popup-menu';
import { store } from './src/storage/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeOneSignal } from './src/services/oneSignalService';
import { initLocalNotifications } from './src/services/localNotificationService';

const App = () => {
  useEffect(() => {
    // Initialize notification services on app start
    initializeOneSignal();
    initLocalNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <MenuProvider>
          <MainStackNavigator />
        </MenuProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;