import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Body() credentials: CreateUserDto) {
    const { email, password } = credentials;
    return this.authService.signup(email, password);
  }
  @Post('signin')
  signin(@Body() credentials: LoginUserDto) {
    const { email, password } = credentials;
    return this.authService.signin(email, password);
  }
}
