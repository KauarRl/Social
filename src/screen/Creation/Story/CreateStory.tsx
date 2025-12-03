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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Image, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon } from '../../../components/icons';
import { auth, firestore } from '../../../services/firebase';
import { uploadImageToCloudinary } from '../../../services/uploadImage';

export default function CreateStory() {
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
        text2: 'Precisamos da permissâo para escolher imagens',
      });
    }
    return granted;
  }

  async function ensureCameraPermission() {
    if (Platform.OS !== 'android') return true;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    const granted = result === PermissionsAndroid.RESULTS.GRANTED;
    if (!granted) {
      Toast.show({
        type: 'error',
        text1: 'Permita acesso á câmera',
        text2: 'Precisamos da permissão para tirar fotos',
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

  async function handleOpenCamera() {
    const permissionOk = await ensureCameraPermission();
    if (!permissionOk) return;

    try {
      const { didCancel, errorCode, assets } = await launchCamera({
        mediaType: 'photo',
        // quality: 0.85,
        maxWidth: 1000,
        maxHeight: 1000,
        cameraType: 'back',
      });

      if (errorCode) {
        console.warn('Camera error:', errorCode);
        return;
      }
      if (didCancel || !assets?.length) {
        console.log('Usuário cancelou câmera');
        return;
      }

      const uri = assets[0]?.uri;
      if (uri) setPostPicture(uri);
    } catch (err) {
      console.error('Falha ao abrir câmera', err);
    }
  }

  async function handlePublish() {
    const PictureTrimmed = postPicture.trim();

    if (!PictureTrimmed.trim()) {
      Toast.show({ type: 'error', text1: 'Selecione uma imagem' });
      return;
    }

    if (!userId) {
      Toast.show({ type: 'error', text1: 'Usuário nâo logado' });
      return;
    }

    try {
      const needUpload = (uri: string) =>
        uri.startsWith('file://') || uri.startsWith('content://');

      let storyImage = postPicture;

      if (storyImage && needUpload(storyImage)) {
        storyImage = await uploadImageToCloudinary(storyImage);
      }

      const postRef = await firestore().collection('story').doc();

      await postRef.set({
        authorId: userId,
        storyImage,
        caption: postCaption ?? '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Toast.show({ type: 'success', text1: 'Story publicado !' });
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao publicar o Story :', error);
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
        style={{ flex: 1, backgroundColor: '#fafafa' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            Create Story
          </Text>
          <XStack w={42} />
        </XStack>

        {/* Card principal */}
        <YStack
          br={20}
          overflow="hidden"
          bg="#fff"
          bw={1}
          borderColor="#e8e8e8"
          shadowColor="#000"
          shadowOpacity={0.08}
          shadowRadius={12}
        >
          <YStack h={260} bg="#f3f3f3" jc="center" ai="center">
            {postPicture ? (
              <Image
                source={{ uri: postPicture }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <YStack jc="center" ai="center" gap="$2">
                <Text color="#888" fontSize={15}>
                  Toque para adicionar mídia
                </Text>
              </YStack>
            )}
          </YStack>

          {/* Botões compactos abaixo da mídia (estilo Instagram) */}
          <XStack
            px="$4"
            py="$3"
            bg="#fff"
            borderTopWidth={1}
            borderColor="#f0f0f0"
            gap="$2"
            jc="space-between"
          >
            <XStack
              f={1}
              jc="center"
              ai="center"
              h={44}
              br={12}
              bw={1}
              borderColor="#e0e0e0"
              bg="#fafafa"
              pressStyle={{ scale: 0.97 }}
              onPress={handleSelectPicture}
            >
              <Text color="#444">Galeria</Text>
            </XStack>
            <XStack
              f={1}
              jc="center"
              ai="center"
              h={44}
              br={12}
              bg="#111"
              pressStyle={{ scale: 0.97 }}
              onPress={handleOpenCamera}
            >
              <Text color="#fff">Câmera</Text>
            </XStack>
          </XStack>

          <YStack px="$4" py="$4" gap="$3">
            <Text color="#666" fontSize={14}>
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
                placeholder="Conte algo para o seu Story..."
                placeholderTextColor="#999"
                style={{ width: '100%', height: '100%' }}
                value={postCaption}
                onChangeText={setPostCapition}
                multiline
                textAlignVertical="top"
              />
            </XStack>
          </YStack>
        </YStack>

        {/* Botão publicar */}
        <XStack mt="$4">
          <XStack
            f={1}
            jc="center"
            ai="center"
            h={54}
            br={16}
            bg="#000"
            pressStyle={{ scale: 0.97 }}
            onPress={handlePublish}
          >
            <Text color="#fff" fontSize={16} fontWeight="700">
              Publicar Story
            </Text>
          </XStack>
        </XStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
