// hooks/usePostComments.ts
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export function usePostComments(postId: string | undefined) {
  const [comments, setComments] = useState<
    { id: string; text: string; authorName?: string; authorAvatar: string; }[]
  >([]);

  useEffect(() => {
    if (!postId) return;

    const unsub = firestore()
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setComments(data);
      });

    return () => unsub();
  }, [postId]);

  return comments;
}
