import { Role, UserStatus } from "../../constants";

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
} 