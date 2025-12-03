/* eslint-disable react-native/no-inline-styles */
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { RootStackParamList } from '../../../navigation/types';
import { firestore } from '../../../services/firebase';

export default function StorysView() {
  const navigation = useNavigation();

  const route = useRoute<RouteProp<RootStackParamList, 'storysView'>>();
  const { storyId, storyImage, caption, createdAt, authorId } = route.params;

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'há pouco';

  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');

  useEffect(() => {
    if (!storyId) return;

    let isMounted = true;

    async function fetchAuthor() {
      try {
        const postDoc = await firestore()
          .collection('posts')
          .doc(storyId)
          .get();
        const postData = postDoc.data();
        if (!postData?.authorId) {
          if (isMounted) setAuthorName('Sem nome');
          return;
        }

        const userDoc = await firestore()
          .collection('users')
          .doc(postData.authorId)
          .get();
        const userData = userDoc.data();

        if (isMounted) {
          setAuthorName(userData?.profileName || 'Sem nome');
          setAuthorAvatar(userData?.photoURL);
        }
      } catch (error) {
        console.error('Erro ao buscar autor:', error);
        if (isMounted) {
          setAuthorName('Sem nome');
          setAuthorAvatar(undefined);
        }
      }
    }

    fetchAuthor();

    return () => {
      isMounted = false;
    };
  }, [storyId]);

  return (
    <YStack flex={1} bg="#000">
      {/* Barra superior com fundo translúcido */}
      <YStack px="$4" pt={40} pb="$3" bg="rgba(0,0,0,0.55)">
        <XStack jc="space-between" ai="center">
          <XStack ai="center" gap="$2">
            <XStack
              w={36}
              h={36}
              br={18}
              overflow="hidden"
              bg="#222"
              jc="center"
              ai="center"
            >
              {authorAvatar ? (
                <Image
                  source={{ uri: authorAvatar }}
                  style={{ width: 36, height: 36 }}
                  resizeMode="cover"
                />
              ) : (
                <Text>teste</Text>
              )}
            </XStack>
            <YStack>
              <Text color="#fff" fontWeight="700">
                {authorName}
              </Text>
              <Text color="#ccc" fontSize={12}>
                {formattedTime}
              </Text>
            </YStack>
          </XStack>

          <XStack gap="$3" ai="center">
            <Text color="#fff">•••</Text>
            <XStack
              jc="center"
              w={36}
              h={36}
              br={18}
              bg="rgba(255,255,255,0.1)"
              pressStyle={{ scale: 0.95 }}
              onPress={() => navigation.goBack()}
            >
              <Text color="white" textAlign="center" fontSize={24}>
                x
              </Text>
            </XStack>
          </XStack>
        </XStack>
      </YStack>

      {/* Conteúdo do story */}
      <YStack f={1} bg="#000" jc="center" ai="center">
        <Image
          source={{ uri: storyImage }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </YStack>
      <XStack jc="flex-start" ai="center" pl={20}>
        <Text color="white">teste</Text>
      </XStack>
      {/* Barra inferior para ações */}
      <YStack px="$4" pb="$5" pt="$3" bg="rgba(0,0,0,0.55)">
        <XStack jc="space-between" ai="center">
          <Text color="#fff">Responder</Text>
          <Text color="#fff">❤</Text>
        </XStack>
      </YStack>
    </YStack>
  );
}
