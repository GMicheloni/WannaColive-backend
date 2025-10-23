import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCredentialsDto, LoginUserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Body() credentials: CreateCredentialsDto) {
    const { email, password } = credentials;
    return this.authService.signup(email, password);
  }
  @Post('signin')
  async signin(@Body() credentials: LoginUserDto) {
    const { email, password } = credentials;
    const token = await this.authService.signin(email, password);
    return { token };
  }
}
