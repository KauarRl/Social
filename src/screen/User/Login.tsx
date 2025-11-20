/* eslint-disable react-native/no-inline-styles */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha email e senha!',
      });
      return;
    }

    try {
      // 1. Fazer login
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const userId = userCredential.user.uid;

      // 2. Buscar dados do usuário no Firestore
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();

      // 3. Verificar se completou o perfil
      if (userData?.profileCompleted) {
        // Perfil completo → vai para tela principal
        Toast.show({
          type: 'success',
          text1: 'Bem-vindo',
          text2: `Olá, ${userData.profileName}!`,
        });
        navigation.navigate('MainTabs', { screen: 'Feed' });
      } else {
        // Perfil incompleto → vai para CompleteProfile
        Toast.show({
          type: 'info',
          text1: 'Complete seu perfil',
          text2: 'Adicione sua foto e bio!',
        });
        navigation.navigate('CompleteProfile');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Usuário não encontrado!',
        });
      } else if (error.code === 'auth/wrong-password') {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Senha incorreta!',
        });
      } else if (error.code === 'auth/invalid-email') {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Email inválido!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: error.message,
        });
      }
    }
  }

  return (
    <YStack flex={1} jc="center" ai="center" bg="white">
      <YStack jc="flex-start" ai="center" w="80%" h="70%" bw={1} br={30}>
        <Text mt="$10" fontSize={32} fontWeight="700">
          Login
        </Text>
        <YStack jc="center" ai="center" mt="$10" gap="$6">
          <XStack w="70%" h={60} pl={10} bw={1} br={10}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={{ width: '90%' }}
            />
          </XStack>
          <XStack w="70%" h={60} pl={10} bw={1} br={10}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={{ width: '90%' }}
            />
          </XStack>
        </YStack>
        <XStack
          jc="center"
          ai="center"
          w="50%"
          h={50}
          mt="$9"
          br={10}
          bg="black"
          onPress={handleLogin}
        >
          <Text color="white">Login</Text>
        </XStack>

        <XStack
          jc="center"
          ai="center"
          w="80%"
          h={2}
          mt="$5"
          br={10}
          bg="black"
        >
          <XStack
            pos="absolute"
            jc="center"
            ai="center"
            br={30}
            w={50}
            bg="white"
          >
            <Text>Or</Text>
          </XStack>
        </XStack>
        <XStack jc="center" ai="center" mt="$5">
          <Text>No have account? </Text>
          <Text
            color="#227beeff"
            onPress={() => navigation.navigate('Register')}
          >
            Register
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
