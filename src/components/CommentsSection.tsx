/* eslint-disable react-native/no-inline-styles */
/* Componente responsável por exibir e enviar comentários de um post */
import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { Image, Text, XStack, YStack } from 'tamagui';

import { usePostComments } from '../hooks/usePostComments';
import { auth, firestore } from '../services/firebase';

type CommentsSectionProps = {
  postId: string;
};

export function CommentsSection({ postId }: CommentsSectionProps) {
  const comments = usePostComments(postId); // Hook que escuta a subcoleção de comentários
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  const canSend = newComment.trim().length > 0 && !isSending;

  async function handleSendComment() {
    if (!canSend) return;

    const user = auth().currentUser;
    if (!user) return;

    setIsSending(true);

    try {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      // Salva o comentário dentro de posts/{postId}/comments
      await firestore()
        .collection('posts')
        .doc(postId)
        .collection('comments')
        .add({
          text: newComment.trim(),
          authorId: user.uid,
          authorName: userData?.profileName || user.displayName || 'Usuário',
          authorAvatar: userData?.photoURL || user.photoURL || '',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // Atualiza o contador no documento principal do post
      await firestore()
        .collection('posts')
        .doc(postId)
        .update({
          commentsCount: firestore.FieldValue.increment(1),
        });

      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário: ', error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <YStack py="$2" gap="$3">
      {/* Input + botão Enviar (estilo Instagram) */}
      <XStack ai="center" bg="#f6f6f6" br={999} px="$3" py="$2" gap="$2">
        {/* Campo controlado para digitar o comentário */}
        <TextInput
          style={{ flex: 1, paddingVertical: 6 }}
          placeholder="Adicione um comentário..."
          placeholderTextColor="#999"
          value={newComment}
          onChangeText={setNewComment}
        />

        {/* Botão Enviar com feedback de bloqueio */}
        <XStack
          px="$3"
          py="$2"
          br={999}
          bg={canSend ? 'black' : '#cfcfcf'}
          pressStyle={canSend ? { scale: 0.97 } : undefined}
          opacity={canSend ? 1 : 0.5}
          onPress={handleSendComment}
        >
          <Text color="white" fontWeight="600">
            Enviar
          </Text>
        </XStack>
      </XStack>
      <YStack gap="$2">
        {comments.length ? (
          comments.map(comment => (
            <YStack
              key={comment.id}
              borderBottomWidth={1}
              borderColor="#f0f0f0"
              pb="$2"
            >
              <XStack jc="flex-start" ai="center" gap={10}>
                <Image
                  source={{ uri: comment.authorAvatar }}
                  w={40}
                  h={40}
                  br={30}
                />
                <Text fontWeight="600">{comment.authorName || 'Usuário'}</Text>
              </XStack>
              <Text color="#555" m={10}>
                {comment.text}
              </Text>
            </YStack>
          ))
        ) : (
          <YStack ai="center" py="$3">
            <Text color="#999">Sem comentários ainda</Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
