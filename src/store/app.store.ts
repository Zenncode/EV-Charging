interface AppState {
  initialized: boolean;
}

type Listener = (state: AppState) => void;

const state: AppState = {
  initialized: false,
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(state));
}

export const appStore = {
  getState() {
    return state;
  },
  setInitialized(initialized: boolean) {
    state.initialized = initialized;
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
