import { Role, UserStatus } from '../../shared/constants';

export * from './auth.validation';

export interface RefreshTokenPayload {
  userId: string;
  rememberMe: boolean;
}

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
}
