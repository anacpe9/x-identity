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
  ): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // just authenticated,
    if (!roles || roles.length === 0) {
      return true;
    }

    const user = context.getArgs()[0].user;
    if (!user) return false;

    return roles.some((role) => role === user.role);
  }
}

// src/permissions.guard.ts
// https://auth0.com/blog/developing-a-secure-api-with-nestjs-adding-role-based-access-control/
