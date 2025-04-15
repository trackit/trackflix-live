import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './user-store';

describe('User Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useUserStore.setState({
      userSession: null,
      user: null,
      isCreator: false,
    });
  });

  it('should have initial state', () => {
    const state = useUserStore.getState();
    expect(state.userSession).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isCreator).toBe(false);
  });

  it('should set user session', () => {
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            'cognito:groups': ['users'],
          },
        },
      },
    } as any;

    useUserStore.getState().setUserSession(mockSession);
    const state = useUserStore.getState();
    expect(state.userSession).toEqual(mockSession);
    expect(state.isCreator).toBe(false);
  });

  it('should set isCreator to true when user has creators group', () => {
    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            'cognito:groups': ['Creators'],
          },
        },
      },
    } as any;

    useUserStore.getState().setUserSession(mockSession);
    const state = useUserStore.getState();
    expect(state.isCreator).toBe(true);
  });

  it('should set user', () => {
    const mockUser = {
      username: 'testuser',
      userId: '123',
    } as any;

    useUserStore.getState().setUser(mockUser);
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
  });
});
