/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon, UserIcon } from '../components/icons';

export default function Profile() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');

  const showReels = () => setActiveTab('reels');
  const showPosts = () => setActiveTab('posts');

  const reelsVisible = activeTab === 'reels';
  const postsVisible = activeTab === 'posts';

  const postagens = Array.from({ length: 21 }).map((_, index) => (
    <YStack
      key={index}
      jc="center"
      ai="center"
      w="30%"
      h={120}
      br={10}
      bg="#555555ff"
    >
      <YStack jc="center" ai="center" w="100%" h="100%">
        <Text color="white">Imagem</Text>
      </YStack>
    </YStack>
  ));

  const Reels = Array.from({ length: 5 }).map((_, index) => (
    <YStack
      key={index}
      jc="center"
      ai="center"
      w="30%"
      h={120}
      br={10}
      bg="#555555ff"
    >
      <YStack jc="center" ai="center" w="100%" h="100%">
        <Text color="white">Videos</Text>
      </YStack>
    </YStack>
  ));

  return (
    <YStack flex={1} ai="center">
      {/* Botão de goBack e nome da tela */}
      <XStack
        jc="flex-start"
        ai="flex-end"
        w="100%"
        h="10%"
        pl={10}
        pb={10}
        gap={10}
        borderBlockWidth={1}
      >
        <XStack
          jc="center"
          ai="center"
          w={40}
          h={40}
          br={20}
          bg="#c7c7c7ff"
          pressStyle={{ scale: 0.95 }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon />
        </XStack>
        <Text fontSize={24} mb={4}>
          Profile
        </Text>
      </XStack>
      {/* ------------------------------ */}
      {/* Foto de perfil, nome do usuario seguidores e seguindo*/}
      <XStack w="100%" h="30%">
        <YStack jc="center" ai="center" w="100%" h="60%" bw={1}>
          <Text>Imagem maior</Text>
          <YStack jc="center" ai="center" pos="absolute" t="60%">
            <XStack bg="white" br={50}>
              <UserIcon size={90} />
            </XStack>
            <Text fontSize={20}>@User_123</Text>
          </YStack>
          {/* Seguidores e seguindo */}
          <XStack w="100%" h="$3" b={-156}>
            <XStack jc="center" ai="center" w="50%">
              <Text>1000 Seguidores</Text>
            </XStack>
            <XStack jc="center" ai="center" w="50%">
              <Text>150 Seguindo</Text>
            </XStack>
          </XStack>
          {/* --------------------- */}
        </YStack>
      </XStack>
      {/* -------------- */}
      {/* Barra de navegação de postagens e reels */}
      <YStack ai="center" w="100%" h="60%">
        <XStack jc="space-evenly" ai="center" w="100%" h="10%">
          <XStack
            jc="center"
            ai="center"
            w="50%"
            h="100%"
            bw={1}
            pressStyle={{ scale: 0.97 }}
            onPress={showPosts}
          >
            <Text fontSize={20}>Postagens</Text>
          </XStack>
          <XStack
            jc="center"
            ai="center"
            w="50%"
            h="100%"
            bw={1}
            pressStyle={{ scale: 0.97 }}
            onPress={showReels}
          >
            <Text fontSize={20}>Reels</Text>
          </XStack>
        </XStack>
        {/* ----------------------- */}
        {/* Área de postagens e reels */}
        <XStack jc="center" ai="flex-start" w="100%" h="90%">
          <ScrollView w="100%" showsVerticalScrollIndicator={false}>
            {postsVisible ? (
              <XStack
                jc="center"
                ai="center"
                flexWrap="wrap"
                mt={10}
                pb={50}
                gap={10}
              >
                {postagens}
              </XStack>
            ) : (
              <XStack
                jc="center"
                ai="center"
                flexWrap="wrap"
                mt={10}
                pb={50}
                gap={10}
              >
                {Reels}
              </XStack>
            )}
          </ScrollView>
        </XStack>
        {/* ------------------------------- */}
      </YStack>
    </YStack>
  );
}
