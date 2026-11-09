// The API client cannot reach the AuthContext, so it announces the end of a session here:
// a refresh the backend refused ('logout').
export type AuthEvent = 'logout';

type Listener = () => void;

const listeners: Record<AuthEvent, Set<Listener>> = {
  logout: new Set(),
};

export const authEvents = {
  on: (event: AuthEvent, listener: Listener): (() => void) => {
    listeners[event].add(listener);
    return () => {
      listeners[event].delete(listener);
    };
  },
  emit: (event: AuthEvent): void => {
    listeners[event].forEach((listener) => listener());
  },
};
