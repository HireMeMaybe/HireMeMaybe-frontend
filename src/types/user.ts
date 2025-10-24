// Shared user-related backend types
// There are a couple of shapes returned by different endpoints: camelCase and PascalCase.
// Export both so callers can pick the one that matches the endpoint.

export interface BackendUser {
  createdAt?: string;
  deletedAt?: { time?: string; valid?: boolean } | null;
  email?: string;
  id?: string;
  profile_picture?: string | null;
  punishment?: { at?: string; end?: string; type?: string } | null;
  tel?: string;
  updatedAt?: string;
  username?: string;
}

export interface BackendUserPascal {
  ID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  tel?: string;
  email?: string;
  id?: string;
  username?: string;
  profile_picture?: string | null;
}

export type UserLike = BackendUser | BackendUserPascal;
