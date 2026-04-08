import type { AuthUser } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
}

type Listener = (state: AuthState) => void;

const state: AuthState = {
  user: null,
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(state));
}

export const authStore = {
  getState() {
    return state;
  },
  setUser(user: AuthUser | null) {
    state.user = user;
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
