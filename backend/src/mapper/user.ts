import { UserDto } from '@app/shared';
import { User } from '@prisma/client';

export const userMapper = (user: User): UserDto => ({
  id: user.id,
  email: user.email,
  role: user.role
});
