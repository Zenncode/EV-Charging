export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  user: {
    profile: "/users/me",
    updateProfile: "/users/me",
  },
  product: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
    create: "/products",
  },
} as const;
