/* eslint-disable react-native/no-inline-styles */
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, ScrollView, Text, XStack, YStack } from 'tamagui';

import { ArrowLeftIcon, MenuIcon, UserIcon } from '../../components/icons';
import { RootStackParamList } from '../../navigation/types';
import { auth, firestore } from '../../services/firebase';

type Post = {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
};

export default function FriendProfile() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const route = useRoute<RouteProp<RootStackParamList, 'FriendProfile'>>();
  const { profileUserId } = route.params;

  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const [bio, setBio] = useState('');
  const [bigPhotoUrl, setBigPhotoUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [profileName, setProfileName] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  const [modalOptions, setModalOptionsVisible] = useState(false);

  const reelsVisible = activeTab === 'reels';
  const postsVisible = activeTab === 'posts';

  const userId = auth().currentUser?.uid;

  const friendId = profileUserId;

  useEffect(() => {
    if (!friendId) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(friendId)
      .onSnapshot(doc => {
        const userData = doc.data();
        setPhotoUrl(userData?.photoURL || '');
        setBigPhotoUrl(userData?.BigImageProfile || '');
        setProfileName(userData?.profileName || 'User');
        setBio(userData?.bio || '');
      });

    return () => unsubscribe();
  }, [friendId]);

  useEffect(() => {
    if (!userId) return;

    // Busca posts do usuário logado
    const unsubscribe = firestore()
      .collection('posts')
      .where('authorId', '==', friendId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snap => {
          if (!snap) return;
          const data = snap.docs.map(doc => {
            const raw = doc.data() as any;
            return {
              id: doc.id,
              imageUrl: raw.imageUrl || raw.postImage || '',
              caption: raw.caption || '',
              // normaliza o timestamp do Firestore para string ISO
              createdAt: raw.createdAt?.toDate
                ? raw.createdAt.toDate().toISOString()
                : '',
            };
          });
          setPosts(data);
        },
        error => {
          console.error('Erro ao buscar posts:', error);
          setPosts([]);
        },
      );

    return () => unsubscribe();
  }, [friendId, userId]);

  return (
    <YStack flex={1} bg="#f8f8f8">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <XStack
          jc="space-between"
          ai="center"
          px="$4"
          pt={insets.top || 16}
          pb="$3"
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
          <Text fontSize={20} fontWeight="700">
            Friend Profile
          </Text>
          <XStack
            jc="center"
            ai="center"
            w={44}
            h={44}
            br={22}
            bg="#f1f1f1"
            pressStyle={{ scale: 0.95 }}
            onPress={() => setModalOptionsVisible(prev => !prev)}
          >
            <MenuIcon size={24} color="#000" />
          </XStack>
        </XStack>

        {/* Modal de opções */}
        {modalOptions ? (
          <YStack
            pos="absolute"
            zi={99}
            top={(insets.top || 16) + 56}
            right={16}
            w="60%"
            br={14}
            bw={1}
            bg="white"
            shadowColor="#000"
            shadowOpacity={0.1}
            shadowRadius={12}
            overflow="hidden"
          >
            <ScrollView>
              <YStack>
                <XStack
                  jc="center"
                  ai="center"
                  py="$3"
                  pressStyle={{ scale: 0.97 }}
                >
                  <Text fontSize={16}>Follow</Text>
                </XStack>
                <XStack
                  jc="center"
                  ai="center"
                  py="$3"
                  pressStyle={{ scale: 0.97 }}
                >
                  <Text fontSize={16}>Share</Text>
                </XStack>
              </YStack>
            </ScrollView>
          </YStack>
        ) : null}

        {/* Banner + Avatar + Bio */}
        <YStack px="$4" mt="$3">
          <YStack
            br={24}
            overflow="hidden"
            bg="#fff"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={12}
          >
            <YStack h={170} bg="#e1e1e1">
              {bigPhotoUrl ? (
                <Image
                  source={{ uri: bigPhotoUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <YStack flex={1} jc="center" ai="center">
                  <Text color="#777">I love Alay</Text>
                </YStack>
              )}
            </YStack>

            <YStack ai="center" mt={-50} mb="$3">
              <YStack
                w={120}
                h={120}
                br={60}
                overflow="hidden"
                bw={3}
                bc="#fff"
                bg="#f5f5f5"
              >
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} w="100%" h="100%" />
                ) : (
                  <YStack flex={1} jc="center" ai="center">
                    <UserIcon size={72} />
                  </YStack>
                )}
              </YStack>
            </YStack>

            <YStack ai="center" gap="$1" px="$4" mb="$4">
              <Text fontSize={22} fontWeight="700">
                {profileName}
              </Text>
              <Text textAlign="center" color="#666">
                {bio}
              </Text>
            </YStack>

            <XStack jc="space-around" ai="center" px="$4" py="$4" bg="#fafafa">
              <YStack ai="center">
                <Text fontSize={18} fontWeight="700">
                  1000
                </Text>
                <Text color="#777">Seguidores</Text>
              </YStack>
              <YStack ai="center">
                <Text fontSize={18} fontWeight="700">
                  100
                </Text>
                <Text color="#777">Seguindo</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        {/* Tabs */}
        <YStack mt="$5" px="$4">
          <XStack
            w="100%"
            br={16}
            overflow="hidden"
            bg="white"
            borderWidth={1}
            borderColor="#e4e2e2ff"
          >
            <XStack
              f={1}
              jc="center"
              ai="center"
              py="$3"
              bg={postsVisible ? '#f0f0f0' : 'transparent'}
              pressStyle={{ scale: 0.97 }}
              onPress={() => setActiveTab('posts')}
            >
              <Text fontSize={18} fontWeight="600">
                Postagens
              </Text>
            </XStack>
            <XStack
              f={1}
              jc="center"
              ai="center"
              py="$3"
              bg={reelsVisible ? '#f0f0f0' : 'transparent'}
              pressStyle={{ scale: 0.97 }}
              onPress={() => setActiveTab('reels')}
            >
              <Text fontSize={18} fontWeight="600">
                Reels
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Grid */}
        <YStack px="$4" mt="$4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <XStack
              flexWrap="wrap"
              jc="space-between"
              w="100%"
              gap="$3"
              pb="$4"
            >
              {postsVisible ? (
                posts.length ? (
                  posts.map(post => (
                    <YStack
                      key={post.id}
                      jc="center"
                      ai="center"
                      w="48%"
                      minWidth={140}
                      h={160}
                      br={16}
                      bw={1}
                      borderColor="#e5e5e5"
                      overflow="hidden"
                      bg="#f7f7f7"
                      onPress={() =>
                        navigation.navigate('PostDetails', {
                          postId: post.id,
                          postImage: post.imageUrl,
                          caption: post.caption,
                          createdAt: post.createdAt,
                        })
                      }
                    >
                      {post.imageUrl ? (
                        <Image
                          source={{ uri: post.imageUrl }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <YStack flex={1} jc="center" ai="center">
                          <Text color="#777">Sem imagem</Text>
                        </YStack>
                      )}
                    </YStack>
                  ))
                ) : (
                  <YStack w="100%" jc="center" ai="center" py="$6">
                    <Text color="#888">Nenhum post ainda</Text>
                  </YStack>
                )
              ) : (
                Array.from({ length: 4 }).map((_, index) => (
                  <YStack
                    key={`reel-${index}`}
                    jc="center"
                    ai="center"
                    w="48%"
                    minWidth={140}
                    h={200}
                    br={16}
                    bw={1}
                    borderColor="#e5e5e5"
                    bg="#eaeaea"
                  >
                    <Text color="#777">Vídeo</Text>
                  </YStack>
                ))
              )}
            </XStack>
          </ScrollView>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
