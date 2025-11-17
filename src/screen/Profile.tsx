/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import { Image, ScrollView, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon, MenuIcon, UserIcon } from '../components/icons';
import { auth, firestore } from '../services/firebase';

export default function Profile() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const [photoUrl, setPhotoUrl] = useState('');
  const [profileName, setProfileName] = useState('User');
  const [bio, setBio] = useState('');
  const [bigPhotoUrl, setBigPhotoUrl] = useState('');

  const [modalOptions, setModalOptionsVisible] = useState(false);

  const reelsVisible = activeTab === 'reels';
  const postsVisible = activeTab === 'posts';

  const userId = auth().currentUser?.uid;

  async function handleLogout() {
    try {
      // Mostra loading
      Toast.show({ type: 'info', text1: 'Saindo...' });

      // Faz logout no Firebase
      await auth().signOut();

      // Redireciona para Login
      navigation.navigate('Login');

      // Mostra mensagem
      Toast.show({
        type: 'success',
        text1: 'Até logo!',
        text2: 'Você saiu da sua conta',
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao sair',
        text2: 'Tente novamente',
      });
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

  const postagens = useMemo(
    () =>
      Array.from({ length: 21 }).map((_, index) => (
        <YStack
          key={`post-${index}`}
          jc="center"
          ai="center"
          w="30%"
          minWidth={100}
          h={120}
          br={14}
          bg="#555555ff"
          mb={12}
        >
          <YStack jc="center" ai="center" w="100%" h="100%">
            <Text color="white">Imagem</Text>
          </YStack>
        </YStack>
      )),
    [],
  );

  const reels = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, index) => (
        <YStack
          key={`reel-${index}`}
          jc="center"
          ai="center"
          w="45%"
          minWidth={140}
          h={200}
          br={16}
          bg="#555555ff"
          mb={16}
        >
          <YStack jc="center" ai="center" w="100%" h="100%">
            <Text color="white">Videos</Text>
          </YStack>
        </YStack>
      )),
    [],
  );

  return (
    <YStack flex={1} bg="$background">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <XStack jc="space-between" ai="center" px="$4" pt="$5" pb="$3" w="100%">
          <XStack
            jc="center"
            ai="center"
            w={44}
            h={44}
            br={22}
            bg="#eee7e7ff"
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon />
          </XStack>
          <Text fontSize={24}>Profile</Text>
          <XStack
            jc="center"
            ai="center"
            w={44}
            h={44}
            br={22}
            bg="#eee7e7ff"
            pressStyle={{ scale: 0.95 }}
            onPress={() => setModalOptionsVisible(prev => !prev)}
          >
            <MenuIcon size={24} color="#000" />
          </XStack>
          {/* Modal  */}

          {modalOptions ? (
            <YStack
              pos="absolute"
              zi={99}
              jc="flex-start"
              ai="center"
              w={100}
              h={90}
              t={80}
              r={24}
              bg="white"
              bw={1}
            >
              <XStack
                jc="center"
                ai="center"
                w="100%"
                h={30}
                bw={1}
                onPress={() => {
                  navigation.navigate('EditProfile');
                  setModalOptionsVisible(false);
                }}
              >
                <Text textAlign="center" fontSize={14}>
                  ✏️Editar perfil
                </Text>
              </XStack>
              <XStack jc="center" ai="center" w="100%" h={30} bw={1}>
                <Text textAlign="center" fontSize={14}>
                  Em breve..
                </Text>
              </XStack>
              <XStack
                jc="center"
                ai="center"
                w="100%"
                h={30}
                bw={1}
                onPress={handleLogout}
              >
                <Text textAlign="center" fontSize={14}>
                  🚪Exit
                </Text>
              </XStack>
            </YStack>
          ) : null}

          {/*------ */}
        </XStack>

        {/* Hero / info card */}
        <YStack px="$4" mt="$3">
          <YStack
            bw={1}
            br={24}
            bg="white"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={12}
          >
            <YStack
              pos="absolute"
              jc="center"
              ai="center"
              w="100%"
              h={140}
              mb="$3"
              overflow="hidden"
              bw={1}
              br={20}
            >
              {bigPhotoUrl ? (
                <Image
                  source={{ uri: bigPhotoUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Text>I love Alay</Text>
              )}
            </YStack>

            <YStack jc="center" ai="center" mt="$12" mb="$3">
              <YStack
                w={120}
                h={120}
                br={80}
                overflow="hidden"
                bw={2}
                bc="#e4e2e2ff"
                bg="white"
              >
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} w="100%" h="100%" />
                ) : (
                  <YStack flex={1} jc="center" ai="center" bg="#f2f2f2">
                    <UserIcon size={90} />
                  </YStack>
                )}
              </YStack>
            </YStack>

            <YStack jc="center" ai="center" gap="$2">
              <Text fontSize={24}>{profileName}</Text>
              <Text textAlign="center" px="$3">
                {bio}
              </Text>
            </YStack>

            <XStack jc="space-between" ai="center" mt="$4" px="$4" py="$5">
              <Text fontStyle="italic" fontSize={18}>
                1000 Seguidores
              </Text>
              <Text fontStyle="italic" fontSize={18}>
                100 Seguindo
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Tabs */}
        <YStack mt="$5" px="$4">
          <XStack
            w="100%"
            bw={1}
            br={16}
            overflow="hidden"
            bg="white"
            borderColor="#e4e2e2ff"
          >
            <XStack
              f={1}
              jc="center"
              ai="center"
              py="$3"
              bg={postsVisible ? '#e4e2e2ff' : 'transparent'}
              pressStyle={{ scale: 0.97 }}
              onPress={() => setActiveTab('posts')}
            >
              <Text fontSize={20}>Postagens</Text>
            </XStack>
            <XStack
              f={1}
              jc="center"
              ai="center"
              py="$3"
              bg={reelsVisible ? '#e4e2e2ff' : 'transparent'}
              pressStyle={{ scale: 0.97 }}
              onPress={() => setActiveTab('reels')}
            >
              <Text fontSize={20}>Reels</Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Grid */}
        <YStack px="$3" mt="$4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <XStack
              flexWrap="wrap"
              jc="space-between"
              w="100%"
              px="$1"
              gap="$2"
            >
              {postsVisible ? postagens : reels}
            </XStack>
          </ScrollView>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
