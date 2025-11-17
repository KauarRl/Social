/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, XStack, YStack } from 'tamagui';

import { SearchIcon, UserIcon } from '../components/icons';
import { auth, firestore } from '../services/firebase';

export default function Feed() {
  const navigation = useNavigation();
  const userId = auth().currentUser?.uid;

  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (!userId) return;

    // Listener em tempo real
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(doc => {
        // ← Fica escutando mudanças
        const userData = doc.data();
        setPhotoUrl(userData?.photoURL || '');
      });

    // Cleanup - IMPORTANTE!
    return () => unsubscribe();
  }, [userId]);

  const Stories = Array.from({ length: 6 }).map((_, index) => (
    <XStack
      key={index}
      jc="center"
      ai="center"
      w={60}
      h={60}
      br={30}
      bg="#ccc"
      bw={1}
      bc="green"
      mr={10}
      pressStyle={{ scale: 0.97 }}
    />
  ));

  const Post = Array.from({ length: 6 }).map((_, index) => (
    <YStack
      key={index}
      jc="flex-start"
      ai="center"
      w="90%"
      mt={10}
      h={300}
      br={10}
      bg="#555555ff"
      mb={60}
    >
      <XStack bg="#444444ff" w="100%" br={10}>
        <Text color="white" fontSize={16} p={10} textAlign="left">
          Post enche linguiça só para ter alguma coisa no exemplo de postagem do
          meu app e bla bla bla
        </Text>
      </XStack>
      <YStack jc="center" ai="center" w="100%" h="74%">
        <Text color="white">Imagem</Text>
      </YStack>
    </YStack>
  ));

  return (
    <YStack flex={1} jc="center" ai="center">
      {/* Header com stories, SearchBar e Profile image*/}
      {/* SearchBar e ProfileImage */}
      <XStack jc="space-between" ai="center" pl={10} h="8%" w="100%">
        <XStack
          jc="center"
          ai="center"
          w={40}
          h={40}
          bw={1}
          br={30}
          onPress={() => navigation.navigate('search')}
        >
          <SearchIcon />
        </XStack>
        <XStack w={50} h={50} />
        <XStack
          jc="center"
          ai="center"
          w="15%"
          h="50%"
          ml={10}
          pressStyle={{ scale: 0.95 }}
          onPress={() => navigation.navigate('Profile')}
        >
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 70,
                borderWidth: 2,
              }}
            />
          ) : (
            <UserIcon size={90} />
          )}
        </XStack>
      </XStack>

      {/* --------- */}
      {/* Stories */}
      <YStack
        jc="flex-end"
        h="10%"
        w="100%"
        zi={99}
        borderTopWidth={2}
        borderBlockWidth={2}
      >
        <XStack jc="flex-start" ai="center" h="100%">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} ml={2}>
            <XStack>{Stories}</XStack>
          </ScrollView>
        </XStack>
      </YStack>
      {/* -------- */}
      {/* Posts */}
      <YStack jc="center" ai="center" h="80%" w="100%" overflow="hidden">
        <ScrollView w="100%" showsVerticalScrollIndicator={false}>
          <YStack jc="center" ai="center">
            {Post}
          </YStack>
        </ScrollView>
      </YStack>
      {/* ------ */}
    </YStack>
  );
}
// function setPhotoUrl(arg0: any) {
//   throw new Error('Function not implemented.');
// }
