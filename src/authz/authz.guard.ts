import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthzService } from './authz.service';

@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authService: AuthzService) {}

  async canActivate(
    context: ExecutionContext,
    // ): boolean | Promise<any> | Observable<boolean> {
  ): Promise<any> {
    const routePermissions = this.reflector.get<string[]>(
      'roles', // 'permissions',
      context.getHandler(),
    );

    //
    if (!routePermissions || routePermissions.length === 0) {
      return true;
    }

    const userRole = context.getArgs()[0].user;
    if (!userRole) return false;

    const userPermissions = await this.authService.getUserData(userRole);
    const hasPermission = () =>
      routePermissions.some(
        (routePermission) =>
          // // userPermission.permissions.includes(routePermission),
          // userPermissions.userPermission.permissions.includes(routePermission),
          true,
      );
    return hasPermission();
  }
}

// src/permissions.guard.ts
// https://auth0.com/blog/developing-a-secure-api-with-nestjs-adding-role-based-access-control/
