import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './user-store';
import * as allure from 'allure-js-commons';

describe('User Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useUserStore.setState({
      userSession: null,
      user: null,
      isCreator: false,
    });
  });

  it('should have initial state', async () => {
    await allure.epic('Misc');
    await allure.feature('Essential features');
    await allure.story('Roles');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    const state = useUserStore.getState();
    expect(state.userSession).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isCreator).toBe(false);
  });

  it('should set user session', async () => {
    await allure.epic('Misc');
    await allure.feature('Essential features');
    await allure.story('Roles');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

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

  it('should set isCreator to true when user has creators group', async () => {
    await allure.epic('Misc');
    await allure.feature('Essential features');
    await allure.story('Roles');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

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

  it('should set user', async () => {
    await allure.epic('Misc');
    await allure.feature('Essential features');
    await allure.story('Roles');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    const mockUser = {
      username: 'testuser',
      userId: '123',
    } as any;

    useUserStore.getState().setUser(mockUser);
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
  });
});
