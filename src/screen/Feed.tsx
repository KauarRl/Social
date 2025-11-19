/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Image, Text, XStack, YStack } from 'tamagui';

import { SearchIcon, UserIcon } from '../components/icons';
import { auth, firestore } from '../services/firebase';

export default function Feed() {
  const navigation = useNavigation();
  const userId = auth().currentUser?.uid;

  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(doc => {
        const userData = doc.data();
        setPhotoUrl(userData?.photoURL || '');
      });

    return () => unsubscribe();
  }, [userId]);

  const Stories = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, index) => (
        <YStack key={index} ai="center" mr="$3" gap="$2">
          <XStack
            jc="center"
            ai="center"
            w={64}
            h={64}
            br={32}
            bw={2}
            bc="#e5e5e5"
            bg="#f7f7f7"
            pressStyle={{ scale: 0.95 }}
          >
            <UserIcon size={32} />
          </XStack>
        </YStack>
      )),
    [],
  );

  const Posts = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, index) => (
        <YStack
          key={index}
          w="100%"
          br={16}
          bw={1}
          borderColor="#5a5a5aff"
          bg="white"
          overflow="hidden"
          mb="$4"
          shadowColor="#000"
          shadowOpacity={0.08}
          shadowRadius={8}
        >
          <XStack jc="space-between" ai="center" px="$4" py="$3" bg="#fafafa">
            <XStack ai="center" gap="$3">
              <XStack
                w={36}
                h={36}
                br={18}
                overflow="hidden"
                bg="#f0f0f0"
                jc="center"
                ai="center"
              >
                <UserIcon size={20} />
              </XStack>
              <Text fontSize={14} fontWeight="600">
                Usuário {index + 1}
              </Text>
            </XStack>
            <Text color="#aaa">há 2h</Text>
          </XStack>

          <YStack px="$4" py="$3" bg="#fff">
            <Text color="#333" fontSize={15} lineHeight={20}>
              Post enche linguiça só para ter alguma coisa no exemplo de
              postagem do meu app e bla bla bla.
            </Text>
          </YStack>

          <YStack jc="center" ai="center" h={220} bg="#eaeaea">
            <Text color="#777">Imagem</Text>
          </YStack>

          <XStack px="$4" py="$3" jc="space-between" ai="center" bg="#fafafa">
            <Text color="#555">Curtir</Text>
            <Text color="#555">Comentar</Text>
            <Text color="#555">Salvar</Text>
          </XStack>
        </YStack>
      )),
    [],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <YStack flex={1} bg="#fff" px="$3" pt="$3">
        {/* Header */}
        <XStack jc="space-between" ai="center" mb="$3">
          <XStack
            jc="center"
            ai="center"
            w={42}
            h={42}
            br={21}
            bw={1}
            borderColor="#e5e5e5"
            bg="#f7f7f7"
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.navigate('search')}
          >
            <SearchIcon />
          </XStack>

          <Text fontSize={18} fontWeight="700">
            Feed
          </Text>

          <XStack
            jc="center"
            ai="center"
            w={42}
            h={42}
            br={21}
            bw={1}
            borderColor="#e5e5e5"
            bg="#f7f7f7"
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.navigate('Profile')}
          >
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                }}
              />
            ) : (
              <UserIcon size={24} />
            )}
          </XStack>
        </XStack>

        {/* Stories */}
        <YStack mb="$4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            <XStack>{Stories}</XStack>
          </ScrollView>
        </YStack>

        {/* Posts */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Button onPress={() => navigation.navigate('FriendProfile')}>
            <Text>FriendProfile</Text>
          </Button>
          {Posts}
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}
