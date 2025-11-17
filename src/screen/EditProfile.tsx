/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Image, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon } from '../components/icons';
import { auth, firestore } from '../services/firebase';
import { uploadImageToCloudinary } from '../services/uploadImage';

export default function EditProfile() {
  const navigation = useNavigation();

  const [photoUrl, setPhotoUrl] = useState('');
  const [bigPhotoUrl, setBigPhotoUrl] = useState('');
  const [profileName, setProfileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bio, setBio] = useState('');

  const userId = auth().currentUser?.uid;

  async function handleSave() {
    const trimmed = profileName.trim();
    const bioTrimed = bio.trim();

    if (!photoUrl.trim()) {
      Toast.show({ type: 'error', text1: 'Selecione uma imagem' });
      return;
    }
    if (!bioTrimed) {
      Toast.show({ type: 'error', text1: 'Escreva uma Bios' });
      return;
    }

    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Informe um nome' });
      return;
    }

    if (!userId) {
      Toast.show({ type: 'error', text1: 'Usuário nãso logado' });
      return;
    }

    try {
      setIsSubmitting(true);
      setSaving(true);

      const needUpload = (uri: string) =>
        uri.startsWith('file://') || uri.startsWith('content://');

      let BigImageProfile = bigPhotoUrl;
      let photoURL = photoUrl;

      if (BigImageProfile && needUpload(BigImageProfile)) {
        BigImageProfile = await uploadImageToCloudinary(BigImageProfile);
      }

      if (photoURL && needUpload(photoURL)) {
        photoURL = await uploadImageToCloudinary(photoURL);
      }

      await firestore().collection('users').doc(userId).update({
        profileName: trimmed,
        bio: bioTrimed,
        photoURL,
        BigImageProfile,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      setPhotoUrl(photoURL);
      setBigPhotoUrl(BigImageProfile);

      Toast.show({ type: 'success', text1: 'Perfil Atualizado!' });
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      Toast.show({ type: 'error', text1: 'Não foi possível salvar' });
    } finally {
      setSaving(false);
      setIsSubmitting(false);
    }
  }
  async function handleSelectBigPhoto() {
    try {
      const result = await ImagePicker.openPicker({
        cropping: true, // abre a UI de recorte
        width: 1200, // defina o aspecto do banner
        height: 500,
        mediaType: 'photo',
        cropperToolbarTitle: 'Ajuste sua imagem',
      });

      setBigPhotoUrl(result.path); // já vem recortada
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Toast.show({ type: 'error', text1: 'Erro ao escolher imagem' });
      }
    }
  }

  async function handleSelectProfilePhoto() {
    const result = await launchImageLibrary({
      mediaType: 'photo',

      quality: 0.8, // 80% de qualidade (reduz tamanho)
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.assets && result.assets[0]) {
      const photo = result.assets[0];
      if (photo.uri) {
        setPhotoUrl(photo.uri); // Salva o caminho da foto
      }
    }
  }

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(doc => {
        const userData = doc.data();
        setPhotoUrl(userData?.photoURL || '');
        setBigPhotoUrl(userData?.BigImageProfile || '');
        setProfileName(userData?.profileName || 'User');
        setBio(userData?.bio || '');
      });

    return () => unsubscribe();
  }, [userId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <XStack
            jc="flex-start"
            ai="center"
            w="100%"
            h="$5"
            pl={10}
            gap={20}
            bw={1}
          >
            <XStack
              jc="center"
              ai="center"
              w={40}
              h={40}
              bg="#e4e4e4ff"
              br={20}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeftIcon />
            </XStack>
            <Text fontSize={22}>Edit Profile</Text>
          </XStack>
          <YStack flex={1} jc="center" ai="center">
            <YStack
              ai="center"
              w="90%"
              br={24}
              bw={1}
              bg="white"
              py="$6"
              gap="$5"
            >
              <YStack
                pos="absolute"
                jc="center"
                ai="center"
                w="100%"
                h={120}
                bw={1}
                br={20}
                overflow="hidden"
                onPress={handleSelectBigPhoto}
              >
                {bigPhotoUrl ? (
                  <Image source={{ uri: bigPhotoUrl }} w="100%" h="100%" />
                ) : (
                  <Text>Select your Image</Text>
                )}
              </YStack>

              <YStack jc="center" ai="center" gap="$3">
                <YStack
                  w={120}
                  h={120}
                  br={80}
                  overflow="hidden"
                  bw={2}
                  bc="#e4e2e2ff"
                  bg="white"
                  onPress={handleSelectProfilePhoto}
                >
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : null}
                </YStack>
              </YStack>

              <YStack gap="$3" w="100%" ai="center">
                <XStack w="80%" h={60} br={20} bw={1} px="$3" ai="center">
                  <TextInput
                    value={profileName}
                    onChangeText={setProfileName}
                    placeholder="userName"
                    style={{ width: '100%' }}
                  />
                </XStack>
              </YStack>
              <YStack gap="$3" w="100%" ai="center">
                <XStack w="80%" h={60} br={20} bw={1} px="$3" ai="center">
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="ex: I love Alay app"
                    style={{ width: '100%' }}
                  />
                </XStack>
              </YStack>

              <XStack
                jc="center"
                ai="center"
                w="60%"
                h={56}
                br={20}
                bg="black"
                pressStyle={{ scale: 0.97 }}
                opacity={saving ? 0.6 : 1}
                pointerEvents={saving ? 'none' : 'auto'}
                onPress={handleSave}
              >
                <Text color="white" fontSize={20}>
                  {saving ? 'Salvando...' : 'Save'}
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
