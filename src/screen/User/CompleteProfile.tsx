/* eslint-disable react-native/no-inline-styles */
import { useState } from 'react';
import { Image, TextInput } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';

import { UserIcon } from '../../components/icons';
import { RootStackScreenProps } from '../../navigation/types';
import { auth, firestore } from '../../services/firebase';
import { uploadImageToCloudinary } from '../../services/uploadImage';

type CompleteProfileProps = RootStackScreenProps<'CompleteProfile'>;

export default function CompleteProfile({ navigation }: CompleteProfileProps) {
  const [photoUri, setPhotoUri] = useState('');
  const [profileName, setProfileName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSelectPhoto() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8, // 80% de qualidade (reduz tamanho)
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.assets && result.assets[0]) {
      const photo = result.assets[0];
      if (photo.uri) {
        setPhotoUri(photo.uri); // Salva o caminho da foto
      }
    }
  }

  async function handleFinish() {
    // Pega o ID do usuǭrio logado
    const userId = auth().currentUser?.uid;

    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário não encontrado',
      });
      return;
    }

    // Remove espaços extras para garantir que o campo obrigatório não aceite apenas "   "
    const trimmedName = profileName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha o nome de usuario',
      });
      return; // evita seguir para o Firestore se o nome estiver vazio
    }

    if (!trimmedBio) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha a bio',
      });
      return;
    }

    try {
      setIsSubmitting(true); // desabilita o botão até a requisição terminar
      let photoUrl = photoUri;

      if (photoUri) {
        // guarda a URL retornada pelo Cloudinary para salvar junto com o perfil
        photoUrl = await uploadImageToCloudinary(photoUri);
      }
      // Atualiza o documento do usuǭrio no Firestore com os campos já validados
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          bio: trimmedBio,
          photoURL: photoUrl ?? '',
          profileName: trimmedName,
          profileCompleted: true,
        });

      Toast.show({
        type: 'success',
        text1: 'Perfil completo!',
        text2: 'Bem-vindo!',
      });

      navigation.navigate('Feed');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar perfil',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <YStack f={1} jc="center" ai="center" bg="white">
      {/* Title with screen name */}
      <XStack jc="center" ai="center" w="90%" mb={20} bw={1}>
        <Text
          pos="absolute"
          w={320}
          ta="center"
          fontFamily={'$silkscreen'}
          fontSize={24}
          bg="white"
        >
          Complete Your Profile
        </Text>
      </XStack>
      {/* ---------------------- */}

      <YStack
        jc="flex-start"
        ai="center"
        w="90%"
        h={600}
        pt="10"
        bw={1}
        br={20}
      >
        {/* UserIcon with select image button */}
        <YStack
          jc="center"
          ai="center"
          w="90%"
          // h="20%"
          borderBottomWidth={1}
        >
          {photoUri ? (
            <XStack jc="center" ai="center" onPress={handleSelectPhoto}>
              <Image
                source={{ uri: photoUri }}
                style={{ width: 140, height: 140, borderRadius: 70 }}
              />
            </XStack>
          ) : (
            <XStack jc="center" ai="center" onPress={handleSelectPhoto}>
              <UserIcon size={140} />
            </XStack>
          )}
        </YStack>
        {/* --------------------------------- */}
        {/* User Name Input / Bio Input */}
        <YStack jc="flex-start" ai="center" w="90%" h="80%" pt="$4">
          <XStack
            jc="flex-start"
            ai="center"
            w="80%"
            h={60}
            mt={30}
            pl={10}
            bw={1}
            br={10}
          >
            <Text pos="absolute" ta="center" w={80} top={-10} l={10} bg="white">
              User Name
            </Text>
            <TextInput
              placeholder="ex: Example_1"
              style={{ width: '90%' }}
              value={profileName}
              onChangeText={setProfileName}
            />
          </XStack>

          <XStack
            jc="flex-start"
            ai="center"
            w="80%"
            h={60}
            mt={30}
            pl={10}
            bw={1}
            br={10}
          >
            <Text
              pos="absolute"
              ta="center"
              w={100}
              top={-10}
              l={10}
              bg="white"
            >
              Bio (Optional)
            </Text>
            <TextInput
              placeholder="ex: Example_1"
              style={{ width: '90%' }}
              value={bio}
              onChangeText={setBio}
              maxLength={50}
              multiline
              textAlignVertical="top"
            />
          </XStack>
          {/* ----------------------- */}
          <XStack
            jc="center"
            ai="center"
            w={120}
            h={50}
            mt="$8"
            bg="black"
            br={10}
            pressStyle={{ scale: 0.97 }}
            opacity={isSubmitting ? 0.6 : 1}
            pointerEvents={isSubmitting ? 'none' : 'auto'}
            onPress={handleFinish}
          >
            <Text color="white" fontSize={20}>
              finish
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
