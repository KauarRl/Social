import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

import { auth } from '../services/firebase';

type Story = {
  id: string;
  authorId: string;
  storyImage: string;
  caption?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
};

// Hook que busca stories de quem você segue; se não seguir ninguém, inclui você mesmo.
export function useStoriesFromFollowing() {
  const userId = auth().currentUser?.uid;
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!userId) return;

    let unsubscribes: Array<() => void> = [];
    let chunkResults: Record<number, Story[]> = {};

    async function fetchStoriesRealtime() {
      try {
        const followingSnap = await firestore()
          .collection('users')
          .doc(userId)
          .collection('following')
          .get();

        const followingIds = followingSnap.docs.map(doc => doc.id);
        const idsForQuery = followingIds.length > 0 ? followingIds : [userId]; // inclui o próprio usuário como fallback

        // Divide em blocos de até 10 (limite do operador "in")
        for (let i = 0; i < idsForQuery.length; i += 10) {
          const group = idsForQuery.slice(i, i + 10);
          if (!group.length) {
            chunkResults[i] = [];
            continue;
          }

          const unsubscribe = firestore()
            .collection('story')
            .where('authorId', 'in', group)
            .orderBy('createdAt', 'desc')
            .onSnapshot(
              snap => {
                const docs = snap?.docs || [];
                const mapped = docs.map(doc => {
                  const data = doc.data() as Story;
                  return { ...data, id: doc.id };
                });

                chunkResults[i] = mapped;
                const merged = Object.values(chunkResults).flat();
                merged.sort(
                  (a, b) =>
                    (b.createdAt?.toMillis?.() || 0) -
                    (a.createdAt?.toMillis?.() || 0),
                );
                setStories(merged);
              },
              error => {
                console.error('Erro no listener de storys:', error);
              },
            );

          unsubscribes.push(unsubscribe);
        }
      } catch (error) {
        console.error('Erro ao buscar storys:', error);
        setStories([]);
      }
    }

    fetchStoriesRealtime();

    return () => {
      unsubscribes.forEach(fn => fn());
      unsubscribes = [];
      chunkResults = {};
    };
  }, [userId]);

  return stories;
}
