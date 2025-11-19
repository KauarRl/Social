import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';

import { RootStackScreenProps } from '../navigation/types';
import { auth, firestore } from '../services/firebase';

type LoadProps = RootStackScreenProps<'Load'>;

export function Load({ navigation }: LoadProps) {
  useEffect(() => {
    // Listener que detecta mudanças no estado de autenticação
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        // Verifica se completou o perfil
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();

          const userData = userDoc.data();

          if (userData?.profileCompleted) {
            // Perfil completo -> navega para MainTabs
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          } else {
            // Perfil incompleto → vai para InfoComplements
            navigation.reset({
              index: 0,
              routes: [{ name: 'CompleteProfile' }],
            });
          }
        } catch (error) {
          console.error('Erro ao verificar perfil:', error);
          // Em caso de erro, vai para Login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } else {
        // Usuário NÃO está logado → vai para Login
        console.log('Usuário não logado');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });

    // Cleanup
    return unsubscribe;
  }, [navigation]);

  return (
    <YStack flex={1} jc="center" ai="center" backgroundColor="$background">
      <ActivityIndicator size="large" color="#000" />
      <Text mt={20} fontSize={16} color="$gray11">
        Carregando...
      </Text>
    </YStack>
  );
}



