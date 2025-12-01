/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';

import { SearchIcon, UserIcon } from '../components/icons';
import { auth, firestore } from '../services/firebase';

type Post = {
  id: string;
  imageUrl: string;
  caption?: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  likesCount?: number;
};

export default function Feed() {
  const navigation = useNavigation();
  const userId = auth().currentUser?.uid;

  const [photoUrl, setPhotoUrl] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Foto do usuário logado
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(doc => {
        const userData = doc.data();
        setPhotoUrl(userData?.photoURL || '');
      });

    return () => unsubscribe();
  }, [userId]);

  // Busca posts (autor + dados do usuário do autor)
  useEffect(() => {
    const unsub = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(async snap => {
        const base = snap.docs.map(doc => {
          const raw = doc.data() as any;
          return {
            id: doc.id,
            authorId: raw.authorId,
            imageUrl: raw.postImage || raw.imageUrl || '',
            caption: raw.caption || '',
            createdAt: raw.createdAt?.toDate?.()?.toISOString() ?? '',
            likesCount: raw.likesCount || 0,
          };
        });

        const uniqueAuthorIds = Array.from(new Set(base.map(p => p.authorId)));
        const authors = await Promise.all(
          uniqueAuthorIds.map(id =>
            firestore().collection('users').doc(id).get(),
          ),
        );
        const authorMap = new Map(
          authors.filter(d => d.exists).map(d => [d.id, d.data() as any]),
        );

        const enriched = base.map(p => {
          const a = authorMap.get(p.authorId) || {};
          return {
            id: p.id,
            imageUrl: p.imageUrl,
            caption: p.caption,
            createdAt: p.createdAt,
            authorName: a.profileName || 'Usuário',
            authorAvatar: a.photoURL || '',
            likesCount: p.likesCount,
          } as Post;
        });

        // inicializa contadores locais
        const initialLikes: Record<string, number> = {};
        enriched.forEach(post => {
          initialLikes[post.id] = post.likesCount || 0;
        });
        setLikesMap(initialLikes);

        setPosts(enriched);
      });

    return unsub;
  }, []);

  const Stories = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, index) => (
        <YStack key={index} ai="center" mr="$3" gap="$2">
          <XStack
            jc="center"
            ai="center"
            w={64}
            h={64}
            br={32}
            bw={2}
            bc="#e5e5e5"
            bg="#f7f7f7"
            pressStyle={{ scale: 0.95 }}
          >
            <UserIcon size={32} />
          </XStack>
        </YStack>
      )),
    [],
  );

  async function likePost(postId: string) {
    if (!userId) return;

    await firestore()
      .collection('posts')
      .doc(postId)
      .collection('likes')
      .doc(userId)
      .set({ createdAt: firestore.FieldValue.serverTimestamp() });

    await firestore()
      .collection('posts')
      .doc(postId)
      .set({ likesCount: firestore.FieldValue.increment(1) }, { merge: true });

    setLikedMap(prev => ({ ...prev, [postId]: true }));
    setLikesMap(prev => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
  }

  async function unlikePost(postId: string) {
    if (!userId) return;

    await firestore()
      .collection('posts')
      .doc(postId)
      .collection('likes')
      .doc(userId)
      .delete();

    await firestore()
      .collection('posts')
      .doc(postId)
      .set({ likesCount: firestore.FieldValue.increment(-1) }, { merge: true });

    setLikedMap(prev => ({ ...prev, [postId]: false }));
    setLikesMap(prev => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] ?? 0) - 1),
    }));
  }

  const renderPost = ({ item }: { item: Post }) => {
    const liked = likedMap[item.id] ?? false;
    const likesCount = likesMap[item.id] ?? item.likesCount ?? 0;

    return (
      <YStack
        w="100%"
        br={18}
        bw={1}
        borderColor="#e5e5e5"
        overflow="hidden"
        bg="white"
        shadowColor="#000000ff"
        shadowOpacity={0.06}
        shadowRadius={10}
        mb="$3"
      >
        <XStack
          w="100%"
          ai="center"
          jc="space-between"
          px="$4"
          py="$3"
          borderBottomWidth={1}
          borderColor="#f0f0f0"
        >
          <XStack ai="center" gap="$3">
            {item.authorAvatar ? (
              <Image
                source={{ uri: item.authorAvatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                resizeMode="cover"
              />
            ) : (
              <XStack
                w={40}
                h={40}
                br={20}
                bg="#f2f2f2"
                jc="center"
                ai="center"
              >
                <UserIcon size={34} />
              </XStack>
            )}
            <YStack>
              <Text fontSize={16} fontWeight="700">
                {item.authorName}
              </Text>
              {item.createdAt ? (
                <Text color="#888" fontSize={12}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              ) : null}
            </YStack>
          </XStack>
          <Text color="#aaa">...</Text>
        </XStack>

        <YStack
          h={320}
          bg="#0e0e0e"
          jc="center"
          ai="center"
          onPress={() =>
            navigation.navigate('PostDetails', {
              postId: item.id,
              postImage: item.imageUrl,
              caption: item.caption,
              createdAt: item.createdAt,
            })
          }
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : (
            <YStack flex={1} jc="center" ai="center">
              <Text color="#777">Sem imagem</Text>
            </YStack>
          )}
        </YStack>

        {item.caption ? (
          <YStack px="$4" py="$3" gap="$1">
            <Text color="#333" lineHeight={20}>
              {item.caption}
            </Text>
          </YStack>
        ) : null}

        <XStack px="$4" py="$3" jc="space-between" ai="center">
          <Text
            color={liked ? '#d00' : '#444'}
            onPress={() => (liked ? unlikePost(item.id) : likePost(item.id))}
          >
            {likesCount} {liked ? '❤️' : '🖤'}
          </Text>
          <Text color="#444">Comentar</Text>
          <Text color="#444">Salvar</Text>
        </XStack>
      </YStack>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <YStack flex={1} bg="#fff" px="$3" pt="$3">
        {/* Header */}
        <XStack jc="space-between" ai="center" mb="$3">
          <XStack
            jc="center"
            ai="center"
            w={42}
            h={42}
            br={21}
            bw={1}
            borderColor="#e5e5e5"
            bg="#f7f7f7"
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.navigate('search')}
          >
            <SearchIcon />
          </XStack>

          <Text fontSize={18} fontWeight="700">
            Feed
          </Text>

          <XStack
            jc="center"
            ai="center"
            w={42}
            h={42}
            br={21}
            bw={1}
            borderColor="#e5e5e5"
            bg="#f7f7f7"
            pressStyle={{ scale: 0.95 }}
            onPress={() => navigation.navigate('Profile')}
          >
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ width: 38, height: 38, borderRadius: 19 }}
              />
            ) : (
              <UserIcon size={24} />
            )}
          </XStack>
        </XStack>

        {/* Stories */}
        <YStack mb="$4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            <XStack>{Stories}</XStack>
          </ScrollView>
        </YStack>

        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <YStack w="100%" jc="center" ai="center" py="$6">
              <Text color="#888">Nenhum post ainda</Text>
            </YStack>
          )}
          contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
        />
      </YStack>
    </KeyboardAvoidingView>
  );
}
