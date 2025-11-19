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

import { ArrowLeftIcon, UserIcon } from '../components/icons';
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
      Toast.show({ type: 'error', text1: 'Usuário não logado' });
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
        cropping: true,
        width: 1200,
        height: 500,
        mediaType: 'photo',
        cropperToolbarTitle: 'Ajuste sua imagem',
      });

      setBigPhotoUrl(result.path);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Toast.show({ type: 'error', text1: 'Erro ao escolher imagem' });
      }
    }
  }

  async function handleSelectProfilePhoto() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.assets && result.assets[0]) {
      const photo = result.assets[0];
      if (photo.uri) {
        setPhotoUrl(photo.uri);
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
        setProfileName(userData?.profileName || 'User');
        setBio(userData?.bio || '');
        setBigPhotoUrl(userData?.BigImageProfile || '');
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} bg="#f8f8f8">
            {/* Header */}
            <XStack
              jc="space-between"
              ai="center"
              px="$4"
              pt="$5"
              pb="$3"
              borderBottomWidth={1}
              borderColor="#ececec"
              bg="white"
            >
              <XStack
                jc="center"
                ai="center"
                w={44}
                h={44}
                br={22}
                bg="#f1f1f1"
                pressStyle={{ scale: 0.95 }}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeftIcon />
              </XStack>
              <Text fontSize={18} fontWeight="700">
                Edit Profile
              </Text>
              <XStack w={44} h={44} />
            </XStack>

            <YStack ai="center" px="$4" pt="$4">
              <YStack
                w="100%"
                br={24}
                bg="white"
                shadowColor="#000"
                shadowOpacity={0.08}
                shadowRadius={12}
                overflow="hidden"
              >
                {/* Banner */}
                <YStack
                  h={160}
                  bg="#e4e4e4"
                  jc="center"
                  ai="center"
                  onPress={handleSelectBigPhoto}
                >
                  {bigPhotoUrl ? (
                    <Image
                      source={{ uri: bigPhotoUrl }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Text color="#777">Selecione o banner</Text>
                  )}
                </YStack>

                {/* Avatar */}
                <YStack ai="center" mt={-50} mb="$3">
                  <YStack
                    jc="center"
                    ai="center"
                    w={120}
                    h={120}
                    br={60}
                    overflow="hidden"
                    bw={3}
                    bc="#fff"
                    bg="#f6f6f6"
                    onPress={handleSelectProfilePhoto}
                  >
                    {photoUrl ? (
                      <Image
                        source={{ uri: photoUrl }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <UserIcon size={90} />
                    )}
                  </YStack>
                </YStack>

                {/* Inputs */}
                <YStack gap="$3" px="$4" pb="$4">
                  <YStack gap="$2">
                    <Text color="#666">userName</Text>
                    <XStack
                      w="100%"
                      h={56}
                      br={16}
                      bw={1}
                      borderColor="#e0e0e0"
                      px="$3"
                      ai="center"
                      bg="#fafafa"
                    >
                      <TextInput
                        value={profileName}
                        onChangeText={setProfileName}
                        placeholder="userName"
                        style={{ width: '100%' }}
                      />
                    </XStack>
                  </YStack>

                  <YStack gap="$2">
                    <Text color="#666">Bio</Text>
                    <XStack
                      w="100%"
                      h={100}
                      br={16}
                      bw={1}
                      borderColor="#e0e0e0"
                      px="$3"
                      pt={8}
                      bg="#fafafa"
                    >
                      <TextInput
                        value={bio}
                        onChangeText={setBio}
                        placeholder="ex: I love Alay app"
                        style={{ width: '100%', height: '100%' }}
                        multiline
                      />
                    </XStack>
                  </YStack>

                  <XStack
                    jc="center"
                    ai="center"
                    w="100%"
                    h={56}
                    br={18}
                    bg="black"
                    pressStyle={{ scale: 0.97 }}
                    opacity={saving ? 0.6 : 1}
                    pointerEvents={saving ? 'none' : 'auto'}
                    onPress={handleSave}
                  >
                    <Text color="white" fontSize={18}>
                      {saving ? 'Salvando...' : 'Save'}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
