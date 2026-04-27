export interface UserJwtPayload {
  id: string;
  name: string;
  email: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface ResetPasswordInput {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}
