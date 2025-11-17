/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      if (!request || !request.headers) {
        return false;
      }

      const authHeader = request.headers['authorization'];
      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return false;
      }

      const token = authHeader.split(' ')[1];
      if (!token || typeof token !== 'string') {
        return false;
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return false;
      }

      try {
        const user = this.jwtService.verify(token, { secret });
        if (!user || !user.id) {
          return false;
        }
        request.user = user;
        
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
