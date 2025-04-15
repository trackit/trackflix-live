import { AuthSession, AuthUser } from 'aws-amplify/auth';
import { create } from 'zustand';

type UserStore = {
  userSession: AuthSession | null;
  setUserSession: (userSession: AuthSession | null) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isCreator: boolean;
};

export const useUserStore = create<UserStore>((set) => ({
  userSession: null,
  setUserSession: (userSession: AuthSession | null) => {
    set({ userSession });
    if (
      Array.isArray(
        userSession?.tokens?.idToken?.payload?.['cognito:groups']
      ) &&
      userSession?.tokens?.idToken?.payload?.['cognito:groups']?.includes(
        'Creators'
      )
    ) {
      set({ isCreator: true });
    }
  },
  user: null,
  setUser: (user: AuthUser | null) => set({ user }),
  isCreator: false,
}));
