/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      if (!request) {
        return false;
      }

      const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
        return false;
      }

      const user = request.user;
      if (!user || !user.role) {
        return false;
      }

      // Verificar si user.role es un array o un string
      const userRoles = Array.isArray(user.role) ? user.role : [user.role];
      
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      
      return hasRole;
    } catch (error) {
      return false;
    }
  }
}
