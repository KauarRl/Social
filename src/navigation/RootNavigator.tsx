import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';

import CompleteProfile from '../screen/CompleteProfile';
import EditProfile from '../screen/EditProfile';
import Feed from '../screen/Feed';
import { Load } from '../screen/Load';
import Login from '../screen/Login';
import Profile from '../screen/Profile';
import Register from '../screen/Register';
import { searchScreen } from '../screen/searchScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Barra global fixada no rodapé, estilo Instagram, com botão central "+" que abre ações rápidas.
function GlobalBottomBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showActions, setShowActions] = useState(false);

  return (
    <YStack
      pos="absolute"
      l={0}
      r={0}
      b={0}
      pointerEvents="box-none" // permite o toque passar para as telas acima exceto onde tiver conteúdo
    >
      {/* Ações que aparecem ao tocar no "+" */}
      {showActions && (
        <YStack
          ai="center"
          gap="$3"
          mb={10 + (insets.bottom || 0)}
          pointerEvents="box-none"
        >
          <XStack
            jc="center"
            ai="center"
            px="$4"
            py="$3"
            br={14}
            bg="black"
            pressStyle={{ scale: 0.97 }}
            onPress={() => {
              setShowActions(false);
              navigation.navigate('CompleteProfile'); // exemplo de ação: “Postar”/“Story”
            }}
          >
            <Text color="white">Nova postagem</Text>
          </XStack>
          <XStack
            jc="center"
            ai="center"
            px="$4"
            py="$3"
            br={14}
            bg="#222"
            pressStyle={{ scale: 0.97 }}
            onPress={() => {
              setShowActions(false);
              navigation.navigate('EditProfile'); // exemplo de ação: “Story”
            }}
          >
            <Text color="white">Novo story</Text>
          </XStack>
        </YStack>
      )}

      {/* Barra principal */}
      <XStack
        jc="space-evenly"
        ai="center"
        h={74 + (insets.bottom || 0)}
        pb={insets.bottom}
        bg="white"
        borderTopWidth={1}
        borderColor="#e5e5e5"
      >
        <XStack
          jc="center"
          ai="center"
          w={60}
          h={40}
          pressStyle={{ scale: 0.97 }}
          onPress={() => navigation.navigate('Feed')}
        >
          <Text>Feed</Text>
        </XStack>

        {/* Botão central flutuante estilo Instagram */}
        <XStack
          pos="relative"
          w={72}
          h={72}
          br={36}
          bg="black"
          jc="center"
          ai="center"
          pressStyle={{ scale: 0.95 }}
          onPress={() => setShowActions(prev => !prev)}
        >
          <Text color="white" fontSize={32}>
            +
          </Text>
        </XStack>

        <XStack
          jc="center"
          ai="center"
          w={60}
          h={40}
          pressStyle={{ scale: 0.97 }}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text>Perfil</Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

export function RootNavigator() {
  return (
    <>
      <Stack.Navigator
        initialRouteName="Load"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Feed"
          component={Feed}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Load"
          component={Load}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="search"
          component={searchScreen}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CompleteProfile"
          component={CompleteProfile}
          options={{
            animation: 'none',
            headerShown: false,
          }}
        />
      </Stack.Navigator>

      {/* Componente global sempre visível sobre as telas */}
      <GlobalBottomBar />
    </>
  );
}
