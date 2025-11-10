import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Feed from '../screen/Feed';
import Profile from '../screen/Profile';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="Feed" component={Feed} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
