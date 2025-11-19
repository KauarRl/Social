import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import CreatePost from '../screen/Creation/Posts/CreatePost';
import PostDetails from '../screen/Creation/Posts/PostDetails';
import Feed from '../screen/Feed';
import { Load } from '../screen/Load';
import { searchScreen } from '../screen/searchScreen';
import CompleteProfile from '../screen/User/CompleteProfile';
import EditProfile from '../screen/User/EditProfile';
import FriendProfile from '../screen/User/FriendProfile';
import Login from '../screen/User/Login';
import Profile from '../screen/User/Profile';
import Register from '../screen/User/Register';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * Tab bar minimalista com apenas um botão central “+”.
 * Troque o onPress para a ação/rota que quiser abrir.
 */
function PlusTabBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [creationStackVisible, setCreationStackVisible] = useState(false);

  return (
    <XStack
      jc="center"
      ai="center"
      h={74 + (insets.bottom || 0)}
      pb={insets.bottom || 0}
      bg="#72727273"
    >
      <XStack
        w={68}
        h={68}
        br={34}
        bg="black"
        jc="center"
        ai="center"
        pressStyle={{ scale: 0.95 }}
        onPress={() => {
          setCreationStackVisible(prev => !prev);
        }}
      >
        <Text color="white" fontSize={32}>
          +
        </Text>
      </XStack>
      {creationStackVisible ? (
        <YStack pos="absolute" b={100} jc="center" ai="center" w={100} gap={10}>
          <XStack
            jc="center"
            ai="center"
            bg="black"
            w="100%"
            h={40}
            br={8}
            pressStyle={{ scale: 0.98 }}
          >
            <Text color="white">Add Story</Text>
          </XStack>
          <XStack
            jc="center"
            ai="center"
            bg="black"
            w="100%"
            h={40}
            br={8}
            pressStyle={{ scale: 0.98 }}
            onPress={() => {
              navigation.navigate('CreatePost');
              setCreationStackVisible(false);
            }}
          >
            <Text color="white">Create Post</Text>
          </XStack>
        </YStack>
      ) : null}
    </XStack>
  );
}

/**
 * Tabs onde a barra inferior deve aparecer.
 * Aqui vão apenas as telas que precisam da barra.
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={() => <PlusTabBar />}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Profile" component={Profile} />

      {/* Adicione mais tabs se precisar que apareçam na barra */}
    </Tab.Navigator>
  );
}

/**
 * Stack raiz: telas sem barra ficam fora do TabNavigator.
 * A tela MainTabs carrega o TabNavigator com a barra “+”.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      {/* Telas sem bottom tab */}
      <Stack.Screen name="Load" component={Load} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="PostDetails" component={PostDetails} />
      <Tab.Screen name="FriendProfile" component={FriendProfile} />

      {/* Telas com bottom tab: basta navegar para MainTabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Outras telas que não mostram a barra */}
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="search" component={searchScreen} />
    </Stack.Navigator>
  );
}
