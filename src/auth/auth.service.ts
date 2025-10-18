import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signup(email: string, password: string, confirmPassword: string) {
    return email;
  }
  signin(email: string, password: string) {
    return email;
  }
}
