/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Image, ScrollView, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon, SearchIcon } from '../components/icons';
import { auth, firestore } from '../services/firebase';

export function searchScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // para respeitar a área segura no footer

  const userId = auth().currentUser?.uid;

  const [searchText, setSearchText] = useState(''); // Texto digitado na busca
  const [searchResult, setSearchResult] = useState<{
    id: string;
    profileName: string;
    photoUrl: string;
  } | null>(null); // Usuário encontrado

  async function handleSearch() {
    // 1. Verifica se digitou algo
    if (!searchText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Digite um username',
        text2: 'Ex: joao_silva',
      });
      return;
    }

    try {
      const profileName = searchText.trim();

      // 4. Busca no Firestore
      const result = await firestore()
        .collection('users') // Abre a gaveta "users"
        .where('profileName', '==', profileName) // Procura onde username = "joao"
        .get(); // Pega os dados

      // 5. Verifica se encontrou alguém
      if (result.empty) {
        // NÃO encontrou ninguém
        Toast.show({
          type: 'error',
          text1: 'Usuário não encontrado',
          text2: 'Verifique se o usuário existe',
        });
        setSearchResult(null); // Limpa resultado anterior
      } else {
        // ENCONTROU alguém!
        const userData = result.docs[0].data(); // Pega os dados do primeiro resultado
        const foundUserId = result.docs[0].id; // Pega o ID dele

        // Guarda o resultado
        setSearchResult({
          id: foundUserId,
          profileName: userData.profileName,
          photoUrl: userData.photoURL || '',
        });

        Toast.show({
          type: 'success',
          text1: 'Usuário encontrado!',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar',
        text2: 'Tente novamente',
      });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={{ flex: 1, height: '100%' }}
    >
      <YStack flexGrow={1} ai="center" bg="white">
        <XStack
          jc="flex-start"
          ai="center"
          w="100%"
          p={10}
          borderBottomWidth={1}
        >
          <XStack
            jc="center"
            ai="center"
            w={40}
            h={40}
            br={30}
            bg="#e9e9e9ff"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon />
          </XStack>
        </XStack>
        <YStack jc="center" ai="center" w="100%" mt={20}>
          <XStack
            jc="flex-start"
            ai="center"
            w="80%"
            h={50}
            pl={40}
            br={10}
            bw={1}
          >
            <XStack pos="absolute" jc="center" ai="center" l={10}>
              <SearchIcon />
            </XStack>
            <TextInput
              placeholder="Search"
              value={searchText}
              onChangeText={setSearchText}
              style={{ width: '100%', height: '100%' }}
            />
          </XStack>
          <XStack
            jc="center"
            ai="center"
            w={100}
            h={40}
            mt={20}
            br={10}
            bg="black"
            onPress={handleSearch}
          >
            <Text color="white" fontSize={18}>
              Search
            </Text>
          </XStack>
        </YStack>
        <YStack
          jc="center"
          ai="center"
          w="100%"
          h="86%"
          mt={40}
          borderTopWidth={1}
        >
          <YStack w="90%" h="100%" p={20} gap={10} pb={20}>
            <ScrollView w="100%" h="100%">
              {searchResult ? (
                <XStack
                  jc="flex-start"
                  ai="center"
                  w="100%"
                  h={80}
                  mb={20}
                  pl={10}
                  gap={18}
                  br={10}
                  bw={1}
                  bc="black"
                >
                  <Image
                    source={{ uri: searchResult?.photoUrl }}
                    w={60}
                    h={60}
                    br={30}
                  />
                  <Text fontSize={20}>{searchResult?.profileName}</Text>
                </XStack>
              ) : null}
            </ScrollView>
          </YStack>
        </YStack>

        {/* Footer fixo com botão "+" centralizado.
            Usamos posição absoluta e padding inferior com o safe area
            para não colidir com os botões de navegação do sistema. */}
        <YStack
          pos="absolute"
          l={0}
          r={0}
          b={0}
          pb={insets.bottom || 12}
          bg="rgba(255,255,255,0.95)"
          borderTopWidth={1}
          borderColor="#e5e5e5"
        >
          <XStack jc="center" ai="center" h={72}>
            <XStack
              w={68}
              h={68}
              br={34}
              bg="black"
              jc="center"
              ai="center"
              pressStyle={{ scale: 0.95 }}
              // onPress={() => navigation.navigate('AlgumaRota')}
            >
              <Text color="white" fontSize={32}>
                +
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
