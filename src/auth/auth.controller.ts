import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCredentialsDto, LoginUserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Body() credentials: CreateCredentialsDto) {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    const { email, password } = credentials;
    return this.authService.signup(email, password);
  }
  @Post('signin')
  async signin(@Body() credentials: LoginUserDto) {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    const { email, password } = credentials;
    const token = await this.authService.signin(email, password);
    return { token };
  }
}
