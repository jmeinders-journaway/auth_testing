import { emptyUser, type IUser } from '../types/user';

type StoredUserLoose = Partial<{
  name: unknown;
  email: unknown;
  avatarUrl: unknown;
  avatar: unknown;
  userType: unknown;
  type: unknown;
}>;

function pickString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getUserFromLocalStorage(): IUser {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) {
    return emptyUser;
  }

  try {
    const parsed = JSON.parse(userRaw) as StoredUserLoose;
    const name = pickString(parsed.name);
    const email = pickString(parsed.email);
    const avatarUrl = pickString(parsed.avatarUrl) ?? pickString(parsed.avatar);
    const userType = pickString(parsed.userType) ?? pickString(parsed.type);

    return {
      name: name ?? emptyUser.name,
      email: email ?? emptyUser.email,
      avatarUrl: avatarUrl ?? emptyUser.avatarUrl,
      userType: userType ?? emptyUser.userType,
    };
  } catch {
    return emptyUser;
  }
}

