export class CreateUserDto {
  email: string;
  password: string;
  confirmPassword: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
