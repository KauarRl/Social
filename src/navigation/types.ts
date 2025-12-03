import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack Navigator
export type RootStackParamList = {
  Feed: {
    postId: string;
  };
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  CompleteProfile: undefined;
  Load: undefined;
  EditProfile: undefined;
  search: undefined;
  MainTabs: undefined;
  CreatePost: undefined;
  CreateStory: undefined;
  storysView: {
    storyId: string;
    storyImage: string;
    authorId: string;
    caption?: string;
    createdAt?: string;
  };
  PostDetails: {
    postId: string;
    postImage: string;
    caption?: string;
    createdAt?: string;
  };
  FriendProfile: {
    profileUserId: string;
  };
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Declare global type for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
