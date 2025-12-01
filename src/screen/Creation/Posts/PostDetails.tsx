/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';

import { CommentsSection } from '../../../components/CommentsSection';
import { ArrowLeftIcon } from '../../../components/icons';
import { RootStackParamList } from '../../../navigation/types';
import { auth, firestore } from '../../../services/firebase';

export default function PostDetails() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetails'>>();
  const { postId, postImage, caption, createdAt } = route.params;

  const userId = auth().currentUser?.uid;

  const [authorName, setAuthorName] = useState('Carregando...');
  const [authorAvatar, setAuthorAvatar] = useState<string | undefined>();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'há pouco';

  // Busca dados do autor
  useEffect(() => {
    if (!postId) return;

    let isMounted = true;

    async function fetchAuthor() {
      try {
        const postDoc = await firestore().collection('posts').doc(postId).get();
        const postData = postDoc.data();
        if (!postData?.authorId) {
          if (isMounted) setAuthorName('Sem nome');
          return;
        }

        const userDoc = await firestore()
          .collection('users')
          .doc(postData.authorId)
          .get();
        const userData = userDoc.data();

        if (isMounted) {
          setAuthorName(userData?.profileName || 'Sem nome');
          setAuthorAvatar(userData?.photoURL);
        }
      } catch (error) {
        console.error('Erro ao buscar autor:', error);
        if (isMounted) {
          setAuthorName('Sem nome');
          setAuthorAvatar(undefined);
        }
      }
    }

    fetchAuthor();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  // Ouve contadores do post (likes/comentários)
  useEffect(() => {
    if (!postId) return;

    const unsubscribe = firestore()
      .collection('posts')
      .doc(postId)
      .onSnapshot(doc => {
        const userData = doc.data();
        setLikeCount(userData?.likesCount || 0);
        setCommentsCount(userData?.commentsCount || 0);
      });

    return () => unsubscribe();
  }, [postId]);

  // Ouve se o usuário atual já curtiu
  useEffect(() => {
    if (!postId || !userId) return;

    const ref = firestore()
      .collection('posts')
      .doc(postId)
      .collection('likes')
      .doc(userId);

    const unsubscribe = ref.onSnapshot(snap => {
      setLiked(snap.exists);
    });

    return unsubscribe;
  }, [postId, userId]);

  async function likePostWithId(targetPostId: string) {
    if (!userId || !targetPostId) return;

    const likeRef = firestore()
      .collection('posts')
      .doc(targetPostId)
      .collection('likes')
      .doc(userId);

    const already = await likeRef.get();
    if (already.exists) return;

    await likeRef.set({ createdAt: firestore.FieldValue.serverTimestamp() });
    await firestore()
      .collection('posts')
      .doc(targetPostId)
      .set({ likesCount: firestore.FieldValue.increment(1) }, { merge: true });

    setLiked(true);
    setLikeCount(prev => prev + 1);
  }

  async function unlikePostWithId(targetPostId: string) {
    if (!userId || !targetPostId) return;

    const likeRef = firestore()
      .collection('posts')
      .doc(targetPostId)
      .collection('likes')
      .doc(userId);

    const existing = await likeRef.get();
    if (!existing.exists) return;

    await likeRef.delete();
    await firestore()
      .collection('posts')
      .doc(targetPostId)
      .set({ likesCount: firestore.FieldValue.increment(-1) }, { merge: true });

    setLiked(false);
    setLikeCount(prev => Math.max(0, prev - 1));
  }

  return (
    <YStack flex={1} bg="#f2f2f2">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <YStack px="$4" pt="$4" ai="center" gap="$3">
          <XStack jc="flex-start" ai="center" w="100%" maxWidth={520}>
            <XStack
              jc="center"
              ai="center"
              w={44}
              h={44}
              br={22}
              bg="#f0f0f0"
              shadowColor="#000"
              shadowOpacity={0.08}
              shadowRadius={6}
              pressStyle={{ scale: 0.95 }}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeftIcon />
            </XStack>
          </XStack>

          <YStack
            w="100%"
            maxWidth={520}
            bg="white"
            br={16}
            overflow="hidden"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={12}
          >
            <XStack jc="space-between" ai="center" px="$4" py="$3">
              <XStack ai="center" gap="$3">
                <YStack
                  w={42}
                  h={42}
                  br={21}
                  overflow="hidden"
                  bg="#f0f0f0"
                  jc="center"
                  ai="center"
                >
                  {authorAvatar ? (
                    <Image
                      source={{ uri: authorAvatar }}
                      style={{ width: 42, height: 42 }}
                    />
                  ) : (
                    <Text color="#999">U</Text>
                  )}
                </YStack>
                <YStack>
                  <Text fontSize={16} fontWeight="600">
                    {authorName}
                  </Text>
                  <Text fontSize={12} color="#aaa">
                    {formattedTime}
                  </Text>
                </YStack>
              </XStack>
              <Text color="#aaa">...</Text>
            </XStack>

            <YStack px="$4" pb="$3">
              <Text color="#444" lineHeight={20}>
                {caption || 'Sem legenda'}
              </Text>
            </YStack>

            <YStack bg="#e3e3e3">
              <Image
                source={{ uri: postImage }}
                style={{ width: '100%', height: 320 }}
                resizeMode="cover"
              />
            </YStack>

            <XStack jc="space-around" ai="center" py="$3" bg="#fafafa">
              <Text
                color={liked ? '#d00' : '#444'}
                onPress={() =>
                  liked ? unlikePostWithId(postId) : likePostWithId(postId)
                }
              >
                {likeCount} {liked ? '??' : '??'}
              </Text>
              <Text color="#666" fontWeight="600">
                {commentsCount} ??
              </Text>
              <Text color="#666" fontWeight="600">
                Salvar
              </Text>
            </XStack>
          </YStack>
        </YStack>

        <YStack px="$4" mt="$4">
          <YStack
            w="100%"
            maxWidth={520}
            alignSelf="center"
            bg="white"
            br={16}
            bw={1}
            borderColor="#e5e5e5"
            px="$4"
            py="$3"
          >
            <CommentsSection postId={postId} />
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
