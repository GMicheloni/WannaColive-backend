import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    const { email, password, confirmPassword } = body;
    return this.authService.signup(email, password, confirmPassword);
  }
  @Post('signin')
  signin(@Body() body: LoginUserDto) {
    const { email, password } = body;
    return this.authService.signin(email, password);
  }
}
