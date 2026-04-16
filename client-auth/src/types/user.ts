export interface IUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  userType: string | null;
}

export const emptyUser: IUser = {
  name: 'Guest User',
  email: 'No email available',
  avatarUrl: null,
  userType: null,
};

