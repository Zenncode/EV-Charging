export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    profile: ["users", "profile"] as const,
  },
  products: {
    all: ["products"] as const,
    detail: (id: string) => ["products", id] as const,
  },
};
