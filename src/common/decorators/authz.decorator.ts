import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { BasicGuard } from '../guards/basic.guard';

export function AuthBasic(...credentials: string[]) {
  return applyDecorators(
    // SetMetadata('credentials', credentials),
    UseGuards(BasicGuard),
    ApiSecurity('basic'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
