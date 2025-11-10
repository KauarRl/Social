/**
 * Vex App
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { RootNavigator } from './src/navigation';
import config from './tamagui.config';

function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <TamaguiProvider
        config={config}
        defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
      >
        <NavigationContainer>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          />
          <RootNavigator />
        </NavigationContainer>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

export default App;
