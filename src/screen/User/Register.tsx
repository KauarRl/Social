/* eslint-disable react-native/no-inline-styles */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';

export default function Register() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    // Validação básica
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos',
      });
      return;
    }
    try {
      // 1. Criar conta no Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const userId = userCredential.user.uid;

      // 2. Salvar dados completos no Firestore
      await firestore()
        .collection('users')
        .doc(userId)
        .set(
          {
            email: email || '',
            bio: '',
            photoURL: '',
            profileName: '',
            profileCompleted: false,
            BigImageProfile: '',
            createdAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Conta criada!',
      });
      navigation.navigate('Login');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Email já cadastrado!',
        });
      } else if (error.code === 'auth/weak-password') {
        Toast.show({
          type: 'info',
          text1: 'Aviso',
          text2: 'Senha muito fraca! Mínimo 6 caracteres',
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
          text1: 'não sei',
          text2: 'algum erro deu',
        });
      }
    }
  }

  return (
    <YStack flex={1} jc="center" ai="center" bg="white">
      <YStack jc="flex-start" ai="center" w="80%" h="70%" bw={1} br={30}>
        <Text mt="$10" fontSize={32} fontWeight="700">
          Register
        </Text>
        <YStack jc="center" ai="center" mt="$10" gap="$6">
          <XStack w="70%" h={60} pl={10} bw={1} br={10}>
            <TextInput
              placeholder="email"
              value={email}
              onChangeText={setEmail}
              style={{ width: '90%' }}
            />
          </XStack>
          <XStack w="70%" h={60} pl={10} bw={1} br={10}>
            <TextInput
              placeholder="password"
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
          onPress={handleRegister}
        >
          <Text color="white">Register</Text>
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
          <Text>have account? </Text>
          <Text color="#227beeff" onPress={() => navigation.goBack()}>
            Login
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
