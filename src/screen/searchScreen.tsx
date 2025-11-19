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
  const insets = useSafeAreaInsets();

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
      style={{ flex: 1 }}
    >
      <YStack flex={1} bg="white" pb={insets.bottom || 16}>
        {/* Header com back e título */}
        <XStack
          jc="space-between"
          ai="center"
          px="$4"
          pt={insets.top || 16}
          pb="$3"
          borderBottomWidth={1}
          borderColor="#eee"
        >
          <XStack
            jc="center"
            ai="center"
            w={40}
            h={40}
            br={20}
            bg="#e9e9e9"
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon />
          </XStack>
          <Text fontSize={18} fontWeight="600">
            Buscar usuário
          </Text>
          <XStack w={40} /> {/* espaçador para equilibrar o header */}
        </XStack>

        {/* Área de busca */}
        <YStack px="$4" pt="$4" gap="$3">
          <XStack
            jc="flex-start"
            ai="center"
            w="100%"
            h={52}
            pl={42}
            pr="$3"
            br={14}
            bw={1}
            borderColor="#ddd"
            bg="#fafafa"
          >
            <XStack pos="absolute" jc="center" ai="center" l={14}>
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
            w="40%"
            h={44}
            alignSelf="center"
            br={14}
            bg="black"
            pressStyle={{ scale: 0.97 }}
            onPress={handleSearch}
          >
            <Text color="white" fontSize={16}>
              Search
            </Text>
          </XStack>
        </YStack>

        {/* Resultados */}
        <YStack flex={1} px="$4" pt="$4">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {searchResult ? (
              <XStack
                jc="flex-start"
                ai="center"
                w="100%"
                h={88}
                p="$3"
                gap="$3"
                br={14}
                bw={1}
                borderColor="#ddd"
                bg="#fdfdfd"
              >
                <Image
                  source={{ uri: searchResult?.photoUrl }}
                  w={60}
                  h={60}
                  br={30}
                />
                <Text fontSize={20}>{searchResult?.profileName}</Text>
              </XStack>
            ) : (
              <YStack jc="center" ai="center" py="$6" gap="$2">
                <Text color="#999">Nenhum resultado ainda</Text>
                <Text color="#bbb" fontSize={12}>
                  Busque pelo username exato
                </Text>
              </YStack>
            )}
          </ScrollView>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
