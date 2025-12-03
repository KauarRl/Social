/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Image, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon } from '../../../components/icons';
import { auth, firestore } from '../../../services/firebase';
import { uploadImageToCloudinary } from '../../../services/uploadImage';

export default function CreatePost() {
  const navigation = useNavigation();
  const userId = auth().currentUser?.uid;

  const [postPicture, setPostPicture] = useState('');
  const [postCaption, setPostCapition] = useState('');

  async function ensurePhotoPermission() {
    if (Platform.OS !== 'android') return true;

    const perm =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const result = await PermissionsAndroid.request(perm);
    const granted = result === PermissionsAndroid.RESULTS.GRANTED;

    if (!granted) {
      Toast.show({
        type: 'error',
        text1: 'Permita acesso ás fotos',
        text2: 'Precisamos da permissão para escolher imagens',
      });
    }
    return granted;
  }

  async function handleSelectPicture() {
    const permissionOk = await ensurePhotoPermission();
    if (!permissionOk) return;

    try {
      const { didCancel, errorCode, assets } = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (errorCode) {
        console.warn('ImagePicker error:', errorCode);
        return;
      }
      if (didCancel || !assets?.length) {
        console.log('Usuário cancelou');
        return;
      }

      const uri = assets[0]?.uri;
      if (uri) setPostPicture(uri);
    } catch (err) {
      console.error('Falha ao abrir galeria', err);
    }
  }

  async function handlePublish() {
    const PictureTrimmed = postPicture.trim();

    if (!PictureTrimmed.trim()) {
      Toast.show({ type: 'error', text1: 'Selecione uma imagem' });
      return;
    }

    if (!userId) {
      Toast.show({ type: 'error', text1: 'Usuário não logado' });
      return;
    }

    try {
      const needUpload = (uri: string) =>
        uri.startsWith('file://') || uri.startsWith('content://');

      let postImage = postPicture;

      if (postImage && needUpload(postImage)) {
        postImage = await uploadImageToCloudinary(postImage);
      }

      const postRef = await firestore().collection('posts').doc();

      await postRef.set({
        authorId: userId,
        postImage,
        caption: postCaption ?? '',
        likesCount: 0,
        commentsCount: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Toast.show({ type: 'success', text1: 'Post Criado !' });
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar o post :', error);
      Toast.show({ type: 'error', text1: 'Não foi possível salvar' });
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8f8f8' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com botão de voltar estilizado */}
        <XStack jc="space-between" ai="center" mb="$4">
          <XStack
            jc="center"
            ai="center"
            w={42}
            h={42}
            br={21}
            bg="#f0f0f0"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={6}
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon />
          </XStack>
          <Text fontSize={20} fontWeight="700">
            Create Post
          </Text>
          <XStack w={42} /> {/* espaçador para alinhar */}
        </XStack>

        {/* Seletor da imagem (placeholder) */}
        <YStack
          h={260}
          br={18}
          bw={1}
          borderColor="#e3e3e3"
          overflow="hidden"
          bg="#ededed"
          jc="center"
          ai="center"
          mb="$4"
          pressStyle={{ scale: 0.98 }}
          onPress={handleSelectPicture}
        >
          {postPicture ? (
            <Image
              source={{ uri: postPicture }}
              w="100%"
              h="100%"
              overflow="hidden"
            />
          ) : (
            <Text color="#777">Toque para escolher uma imagem</Text>
          )}
        </YStack>

        {/* Campo legenda */}
        <YStack gap="$2" mb="$4">
          <Text color="#555" fontSize={14}>
            Legenda
          </Text>
          <XStack
            w="100%"
            h={120}
            br={16}
            bw={1}
            borderColor="#e1e1e1"
            bg="#fff"
            px="$3"
            py="$2"
          >
            <TextInput
              placeholder="Escreva algo sobre sua foto..."
              style={{ width: '100%', height: '100%' }}
              value={postCaption}
              onChangeText={setPostCapition}
              multiline
              textAlignVertical="top"
            />
          </XStack>
        </YStack>

        {/* Grupo de botões de ação (salvar rascunho / publicar) */}
        <XStack jc="space-between" ai="center" gap="$3" mt="$2">
          <XStack
            f={1}
            jc="center"
            ai="center"
            h={52}
            br={14}
            bw={1}
            borderColor="#dcdcdc"
            bg="#fff"
            pressStyle={{ scale: 0.97 }}
          >
            <Text color="#444">Salvar rascunho</Text>
          </XStack>
          <XStack
            f={1}
            jc="center"
            ai="center"
            h={52}
            br={14}
            bg="black"
            pressStyle={{ scale: 0.97 }}
            onPress={handlePublish}
          >
            <Text color="white" fontSize={16} fontWeight="700">
              Publicar
            </Text>
          </XStack>
        </XStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
