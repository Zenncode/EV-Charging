export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}
