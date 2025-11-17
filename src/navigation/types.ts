import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack Navigator
export type RootStackParamList = {
    Feed: undefined;
    Profile: undefined;
    Login: undefined;
    Register: undefined;
    CompleteProfile: undefined;
    Load: undefined;
    EditProfile: undefined;
    search: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Declare global type for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
