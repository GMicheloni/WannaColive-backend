/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/roles.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return false;
    }
    try {
      const secret = process.env.JWT_SECRET;
      const user = this.jwtService.verify(token, { secret });
      /* if (user.role == 'admin') {
        user.role = Roles.ADMIN;
      } else if (user.role == 'moderator') {
        user.role = Roles.MODERATOR;
      } else {
        user.role = Roles.USER;
      } */
      console.log(user);
      return true;
    } catch (error) {
      return false;
    }
  }
}
